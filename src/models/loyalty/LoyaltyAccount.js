const mongoose = require('mongoose');

// Configuración de niveles
const TIER_CONFIG = {
  bronze: { minPoints: 0, multiplier: 1, benefits: ['Acceso a ofertas exclusivas'] },
  silver: { minPoints: 1000, multiplier: 1.25, benefits: ['Envío gratis en compras +$50. 000', 'Acceso anticipado a ventas'] },
  gold: { minPoints: 5000, multiplier: 1.5, benefits: ['Envío gratis siempre', 'Soporte prioritario', 'Descuento 5% permanente'] },
  platinum: { minPoints: 15000, multiplier: 2, benefits: ['Todo Gold', 'Regalos exclusivos', 'Descuento 10% permanente'] }
};

const LoyaltyAccountSchema = new mongoose.Schema({
  user: { 
    type: mongoose. Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Puntos
  points: { 
    type: Number, 
    default: 0,
    min: 0
  },
  lifetimePoints: { // Total de puntos ganados históricamente
    type: Number, 
    default: 0 
  },
  redeemedPoints: { // Total de puntos canjeados
    type: Number, 
    default: 0 
  },
  
  // Nivel
  tier: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  tierUpdatedAt: Date,
  
  // Puntos por expirar
  expiringPoints: [{
    amount: Number,
    expiresAt: Date
  }],
  
  // Referidos
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: { 
    type: mongoose.Schema. Types.ObjectId, 
    ref: 'User' 
  },
  referralCount: { 
    type: Number, 
    default: 0 
  },
  
  // Estado
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  // Última actividad
  lastActivityAt: Date

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
LoyaltyAccountSchema.index({ tier: 1 });
LoyaltyAccountSchema.index({ points: -1 });

// Virtual: configuración del nivel actual
LoyaltyAccountSchema. virtual('tierConfig'). get(function() {
  return TIER_CONFIG[this.tier];
});

// Virtual: puntos para siguiente nivel
LoyaltyAccountSchema.virtual('pointsToNextTier').get(function() {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(this. tier);
  
  if (currentIndex === tiers.length - 1) return 0; // Ya es platinum
  
  const nextTier = tiers[currentIndex + 1];
  return Math.max(0, TIER_CONFIG[nextTier].minPoints - this.lifetimePoints);
});

// Virtual: siguiente nivel
LoyaltyAccountSchema.virtual('nextTier').get(function() {
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tiers.indexOf(this.tier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
});

// Virtual: multiplicador de puntos
LoyaltyAccountSchema.virtual('pointsMultiplier').get(function() {
  return TIER_CONFIG[this.tier].multiplier;
});

// Pre-save: generar código de referido
LoyaltyAccountSchema.pre('save', async function(next) {
  if (this.isNew && !this.referralCode) {
    const User = mongoose.model('User');
    const user = await User.findById(this.user);
    const random = Math.random().toString(36).substring(2, 6). toUpperCase();
    this. referralCode = `${user.nombre.substring(0, 3). toUpperCase()}${random}`;
  }
  
  // Actualizar nivel basado en lifetimePoints
  this.updateTier();
  
  next();
});

// Método: actualizar nivel
LoyaltyAccountSchema.methods.updateTier = function() {
  const tiers = ['platinum', 'gold', 'silver', 'bronze'];
  
  for (const tier of tiers) {
    if (this.lifetimePoints >= TIER_CONFIG[tier].minPoints) {
      if (this.tier !== tier) {
        this.tier = tier;
        this.tierUpdatedAt = new Date();
      }
      break;
    }
  }
};

// Método: agregar puntos
LoyaltyAccountSchema.methods.addPoints = async function(amount, reason, orderId) {
  const multipliedAmount = Math.floor(amount * this.pointsMultiplier);
  
  this.points += multipliedAmount;
  this.lifetimePoints += multipliedAmount;
  this. lastActivityAt = new Date();
  
  // Agregar puntos con fecha de expiración (1 año)
  this.expiringPoints.push({
    amount: multipliedAmount,
    expiresAt: new Date(Date. now() + 365 * 24 * 60 * 60 * 1000)
  });
  
  // Crear transacción
  const PointsTransaction = mongoose.model('PointsTransaction');
  await PointsTransaction.create({
    loyaltyAccount: this._id,
    user: this.user,
    type: 'earn',
    points: multipliedAmount,
    basePoints: amount,
    multiplier: this.pointsMultiplier,
    reason,
    order: orderId
  });
  
  return this.save();
};

// Método: canjear puntos
LoyaltyAccountSchema.methods.redeemPoints = async function(amount, reason, rewardId) {
  if (this.points < amount) {
    throw new Error('Puntos insuficientes');
  }
  
  this.points -= amount;
  this.redeemedPoints += amount;
  this.lastActivityAt = new Date();
  
  // Crear transacción
  const PointsTransaction = mongoose.model('PointsTransaction');
  await PointsTransaction.create({
    loyaltyAccount: this._id,
    user: this.user,
    type: 'redeem',
    points: -amount,
    reason,
    reward: rewardId
  });
  
  return this.save();
};

// Método: procesar puntos expirados
LoyaltyAccountSchema.methods.processExpiredPoints = async function() {
  const now = new Date();
  let expiredTotal = 0;
  
  this.expiringPoints = this.expiringPoints.filter(ep => {
    if (ep.expiresAt <= now) {
      expiredTotal += ep.amount;
      return false;
    }
    return true;
  });
  
  if (expiredTotal > 0) {
    this.points = Math.max(0, this.points - expiredTotal);
    
    const PointsTransaction = mongoose.model('PointsTransaction');
    await PointsTransaction.create({
      loyaltyAccount: this._id,
      user: this.user,
      type: 'expire',
      points: -expiredTotal,
      reason: 'Puntos expirados'
    });
  }
  
  return this.save();
};

// Static: obtener o crear cuenta
LoyaltyAccountSchema.statics.getOrCreate = async function(userId) {
  let account = await this.findOne({ user: userId });
  
  if (!account) {
    account = await this.create({ user: userId });
  }
  
  return account;
};

// Static: obtener leaderboard
LoyaltyAccountSchema.statics.getLeaderboard = async function(limit = 10) {
  return this.find({ isActive: true })
    .populate('user', 'nombre avatar')
    .sort({ lifetimePoints: -1 })
    .limit(limit);
};

// Exportar
// Static: obtener leaderboard
LoyaltyAccountSchema.statics.getLeaderboard = async function(limit = 10) {
  return this. find({ isActive: true })
    .populate('user', 'nombre avatar')
    .sort({ lifetimePoints: -1 })
    .limit(limit);
};

// Static: procesar referido
LoyaltyAccountSchema.statics.processReferral = async function(newUserId, referralCode) {
  const referrerAccount = await this.findOne({ referralCode });
  
  if (!referrerAccount) {
    throw new Error('Código de referido inválido');
  }
  
  // Crear cuenta para el nuevo usuario
  const newUserAccount = await this.create({
    user: newUserId,
    referredBy: referrerAccount.user
  });
  
  // Dar puntos al referidor
  referrerAccount.referralCount += 1;
  await referrerAccount.addPoints(500, 'Bono por referido');
  
  // Dar puntos al nuevo usuario
  await newUserAccount.addPoints(200, 'Bono de bienvenida por referido');
  
  return { referrerAccount, newUserAccount };
};

module.exports = mongoose.model('LoyaltyAccount', LoyaltyAccountSchema);
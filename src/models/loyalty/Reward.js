const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  // Información básica
  name: { 
    type: String, 
    required: [true, 'El nombre de la recompensa es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  image: String,
  
  // Costo en puntos
  pointsCost: { 
    type: Number, 
    required: [true, 'El costo en puntos es requerido'],
    min: [1, 'El costo mínimo es 1 punto']
  },
  
  // Tipo de recompensa
  type: { 
    type: String, 
    enum: ['discount_percentage', 'discount_fixed', 'free_shipping', 'product', 'coupon'],
    required: true
  },
  
  // Valor de la recompensa
  value: { 
    type: Number, 
    required: true 
  }, // Porcentaje, monto fijo, o ID de producto
  
  // Para recompensas de producto
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  },
  
  // Restricciones
  restrictions: {
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number,
    validCategories: [String],
    excludedCategories: [String],
    validProducts: [{ type: mongoose.Schema.Types. ObjectId, ref: 'Product' }],
    excludedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    minTier: { 
      type: String, 
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    maxUsesPerUser: { type: Number, default: null },
    maxUsesTotal: { type: Number, default: null }
  },
  
  // Stock
  stock: { 
    type: Number, 
    default: null // null = ilimitado
  },
  redeemedCount: { 
    type: Number, 
    default: 0 
  },
  
  // Estado
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  
  // Vigencia
  startDate: Date,
  endDate: Date,
  
  // Ordenamiento
  displayOrder: { 
    type: Number, 
    default: 0 
  },
  
  // Términos y condiciones
  terms: String

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
RewardSchema.index({ isActive: 1, displayOrder: 1 });
RewardSchema.index({ type: 1 });
RewardSchema.index({ pointsCost: 1 });

// Virtual: disponible
RewardSchema.virtual('isAvailable').get(function() {
  if (! this.isActive) return false;
  if (this.stock !== null && this.stock <= 0) return false;
  
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  return true;
});

// Virtual: stock restante
RewardSchema.virtual('remainingStock').get(function() {
  if (this.stock === null) return null; // Ilimitado
  return Math.max(0, this.stock - this.redeemedCount);
});

// Pre-save: generar slug
RewardSchema.pre('save', function(next) {
  if (this.isModified('name') && ! this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      . replace(/(^-|-$)/g, '');
  }
  next();
});

// Método: verificar si usuario puede canjear
RewardSchema.methods.canRedeem = async function(userId, userTier) {
  if (! this.isAvailable) {
    return { canRedeem: false, reason: 'Recompensa no disponible' };
  }
  
  // Verificar nivel mínimo
  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
  if (tierOrder.indexOf(userTier) < tierOrder.indexOf(this. restrictions.minTier)) {
    return { canRedeem: false, reason: `Requiere nivel ${this.restrictions.minTier} o superior` };
  }
  
  // Verificar usos por usuario
  if (this.restrictions.maxUsesPerUser) {
    const RedeemedReward = mongoose.model('RedeemedReward');
    const userUses = await RedeemedReward.countDocuments({
      user: userId,
      reward: this._id
    });
    
    if (userUses >= this.restrictions.maxUsesPerUser) {
      return { canRedeem: false, reason: 'Has alcanzado el límite de canjes para esta recompensa' };
    }
  }
  
  return { canRedeem: true };
};

// Método: canjear recompensa
RewardSchema.methods.redeem = async function (userId) {
  // Verificar stock
  if (this.stock !== null) {
    if (this.stock <= this.redeemedCount) {
      throw new Error('Sin stock disponible');
    }
    this.redeemedCount += 1;
    await this.save();
  }

  // Generar cupón único
  const couponCode = "CPN-" + Math.random().toString(36).substring(2, 10).toUpperCase();

  // Fecha de expiración: +30 días
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const RedeemedReward = mongoose.model('RedeemedReward');

  // Crear registro
  const redeemed = await RedeemedReward.create({
    user: userId,
    reward: this._id,
    type: this.type,
    value: this.value,
    restrictions: this.restrictions,
    couponCode,
    expiresAt,
    redeemedAt: new Date()
  });

  return redeemed;
};


// Static: obtener recompensas disponibles para un nivel
RewardSchema.statics. getAvailableForTier = async function(tier, options = {}) {
  const { type, page = 1, limit = 12 } = options;
  const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
  const tierIndex = tierOrder.indexOf(tier);
  
  const filter = {
    isActive: true,
    'restrictions.minTier': { $in: tierOrder. slice(0, tierIndex + 1) },
    $or: [
      { stock: null },
      { $expr: { $gt: ['$stock', '$redeemedCount'] } }
    ],
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: new Date() } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: new Date() } }] }
    ]
  };
  
  if (type) filter.type = type;
  
  const [rewards, total] = await Promise.all([
    this.find(filter)
      .sort({ displayOrder: 1, pointsCost: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    this.countDocuments(filter)
  ]);
  
  return {
    rewards,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

module.exports = mongoose.model('Reward', RewardSchema);
const mongoose = require('mongoose');

const PointsTransactionSchema = new mongoose.Schema({
  loyaltyAccount: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'LoyaltyAccount',
    required: true,
    index: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  
  // Tipo de transacción
  type: { 
    type: String, 
    enum: ['earn', 'redeem', 'expire', 'adjustment', 'bonus', 'referral'],
    required: true,
    index: true
  },
  
  // Puntos (positivo = ganado, negativo = gastado/expirado)
  points: { 
    type: Number, 
    required: true 
  },
  
  // Para transacciones de compra
  basePoints: Number, // Puntos base antes del multiplicador
  multiplier: { 
    type: Number, 
    default: 1 
  },
  
  // Balance después de la transacción
  balanceAfter: Number,
  
  // Referencias
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  },
  reward: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reward' 
  },
  
  // Descripción
  reason: { 
    type: String, 
    required: true 
  },
  description: String,
  
  // Expiración (para puntos ganados)
  expiresAt: Date,
  isExpired: { 
    type: Boolean, 
    default: false 
  },
  
  // Auditoría (para ajustes manuales)
  adjustedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }

}, { 
  timestamps: true 
});

// Índices
PointsTransactionSchema.index({ user: 1, createdAt: -1 });
PointsTransactionSchema.index({ type: 1, createdAt: -1 });
PointsTransactionSchema.index({ order: 1 });
PointsTransactionSchema.index({ expiresAt: 1 }, { sparse: true });

// Pre-save: calcular balance después
PointsTransactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const LoyaltyAccount = mongoose.model('LoyaltyAccount');
    const account = await LoyaltyAccount.findById(this. loyaltyAccount);
    this.balanceAfter = account ?  account.points : 0;
    
    // Establecer fecha de expiración para puntos ganados
    if (this.type === 'earn' && ! this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

// Static: obtener historial de un usuario
PointsTransactionSchema.statics.getUserHistory = async function(userId, options = {}) {
  const { type, startDate, endDate, page = 1, limit = 20 } = options;
  
  const filter = { user: userId };
  
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = startDate;
    if (endDate) filter.createdAt.$lte = endDate;
  }
  
  const [transactions, total] = await Promise.all([
    this.find(filter)
      .populate('order', 'orderNumber total')
      .populate('reward', 'name')
      .sort({ createdAt: -1 })
      . skip((page - 1) * limit)
      .limit(limit),
    this.countDocuments(filter)
  ]);
  
  return {
    transactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

// Static: obtener resumen de puntos
PointsTransactionSchema.statics.getUserSummary = async function(userId) {
  const result = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$points' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  const summary = {
    earned: 0,
    redeemed: 0,
    expired: 0,
    bonus: 0,
    transactions: 0
  };
  
  result.forEach(r => {
    if (r._id === 'earn') summary.earned = r.total;
    if (r._id === 'redeem') summary.redeemed = Math.abs(r.total);
    if (r._id === 'expire') summary.expired = Math.abs(r.total);
    if (r._id === 'bonus') summary.bonus = r.total;
    summary.transactions += r.count;
  });
  
  return summary;
};

module.exports = mongoose.model('PointsTransaction', PointsTransactionSchema);
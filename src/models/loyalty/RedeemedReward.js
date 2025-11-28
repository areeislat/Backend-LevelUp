const mongoose = require('mongoose');

const RedeemedRewardSchema = new mongoose.Schema({
  user: { 
    type: mongoose. Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  reward: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reward',
    required: true
  },
  
  // Código de cupón generado
  couponCode: { 
    type: String, 
    unique: true,
    required: true
  },
  
  // Copia del tipo y valor (snapshot)
  type: { 
    type: String, 
    enum: ['discount_percentage', 'discount_fixed', 'free_shipping', 'product', 'coupon'],
    required: true
  },
  value: { 
    type: Number, 
    required: true 
  },
  restrictions: {
    minOrderAmount: Number,
    maxDiscount: Number,
    validCategories: [String],
    excludedCategories: [String]
  },
  
  // Estado
  status: { 
    type: String, 
    enum: ['active', 'used', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  
  // Uso
  usedAt: Date,
  usedInOrder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  },
  discountApplied: Number, // Descuento real aplicado
  
  // Vigencia
  expiresAt: { 
    type: Date, 
    required: true,
    index: true
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
RedeemedRewardSchema.index({ couponCode: 1 });
RedeemedRewardSchema.index({ user: 1, status: 1 });
RedeemedRewardSchema.index({ expiresAt: 1 });

// Virtual: está expirado
RedeemedRewardSchema.virtual('isExpired'). get(function() {
  return this.expiresAt < new Date() || this.status === 'expired';
});

// Virtual: es válido (activo y no expirado)
RedeemedRewardSchema.virtual('isValid').get(function() {
  return this.status === 'active' && this.expiresAt > new Date();
});

// Pre-save: generar código de cupón
RedeemedRewardSchema.pre('save', async function(next) {
  if (this.isNew && !this.couponCode) {
    const timestamp = Date.now(). toString(36). toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.couponCode = `LUG-${timestamp}-${random}`;
  }
  
  // Establecer fecha de expiración (30 días por defecto)
  if (this.isNew && ! this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  
  next();
});

// Método: usar cupón
RedeemedRewardSchema.methods.use = async function(orderId, discountApplied) {
  if (!this.isValid) {
    throw new Error('Este cupón no es válido o ha expirado');
  }
  
  this.status = 'used';
  this.usedAt = new Date();
  this.usedInOrder = orderId;
  this.discountApplied = discountApplied;
  
  return this.save();
};

// Método: cancelar cupón
RedeemedRewardSchema.methods.cancel = async function(reason) {
  this.status = 'cancelled';
  return this.save();
};

// Static: buscar por código
RedeemedRewardSchema.statics.findByCode = async function(code) {
  return this.findOne({ couponCode: code. toUpperCase() })
    .populate('reward', 'name type value');
};

// Static: validar código para orden
RedeemedRewardSchema. statics.validateForOrder = async function(code, orderTotal, categories = []) {
  const coupon = await this.findByCode(code);
  
  if (!coupon) {
    return { valid: false, error: 'Código no encontrado' };
  }
  
  if (! coupon.isValid) {
    return { valid: false, error: 'Este código ha expirado o ya fue utilizado' };
  }
  
  // Verificar monto mínimo
  if (coupon.restrictions.minOrderAmount && orderTotal < coupon.restrictions. minOrderAmount) {
    return { 
      valid: false, 
      error: `El monto mínimo de compra es $${coupon.restrictions.minOrderAmount. toLocaleString()}` 
    };
  }
  
  // Calcular descuento
  let discount = 0;
  if (coupon.type === 'discount_percentage') {
    discount = Math.round(orderTotal * coupon.value / 100);
    if (coupon.restrictions.maxDiscount) {
      discount = Math.min(discount, coupon.restrictions. maxDiscount);
    }
  } else if (coupon. type === 'discount_fixed') {
    discount = coupon. value;
  } else if (coupon.type === 'free_shipping') {
    discount = 0; // El descuento de envío se maneja aparte
  }
  
  return {
    valid: true,
    coupon,
    discount,
    type: coupon.type
  };
};

// Static: obtener cupones activos de un usuario
RedeemedRewardSchema.statics.getUserActiveCoupons = async function(userId) {
  return this.find({
    user: userId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  })
    .populate('reward', 'name description image')
    .sort({ expiresAt: 1 });
};

// Static: marcar cupones expirados
RedeemedRewardSchema.statics.markExpired = async function() {
  return this.updateMany(
    {
      status: 'active',
      expiresAt: { $lt: new Date() }
    },
    { status: 'expired' }
  );
};

module.exports = mongoose.model('RedeemedReward', RedeemedRewardSchema);
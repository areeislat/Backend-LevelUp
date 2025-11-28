const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    required: true,
    index: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  
  // Monto
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'CLP' 
  },
  
  // Método y gateway
  method: { 
    type: String, 
    enum: ['credit_card', 'debit_card', 'transfer', 'webpay', 'mercadopago'],
    required: true
  },
  gateway: { 
    type: String, 
    enum: ['webpay', 'mercadopago', 'flow', 'manual'],
    required: true
  },
  
  // Estado
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // IDs de transacción
  transactionId: { 
    type: String,
    unique: true,
    sparse: true
  },
  gatewayTransactionId: String,
  authorizationCode: String,
  
  // Detalles de tarjeta (enmascarados)
  cardDetails: {
    brand: String, // visa, mastercard, etc.
    last4: String,
    expiryMonth: String,
    expiryYear: String
  },
  
  // Respuesta del gateway
  gatewayResponse: mongoose.Schema.Types. Mixed,
  
  // Errores
  errorCode: String,
  errorMessage: String,
  
  // Reembolso
  refund: {
    amount: Number,
    reason: String,
    transactionId: String,
    processedAt: Date,
    processedBy: { type: mongoose. Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Timestamps adicionales
  processedAt: Date,
  completedAt: Date,
  failedAt: Date

}, { 
  timestamps: true 
});

// Índices
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

// Pre-save: generar transactionId
PaymentSchema.pre('save', function(next) {
  if (this.isNew && !this. transactionId) {
    const timestamp = Date.now(). toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.transactionId = `PAY-${timestamp}-${random}`. toUpperCase();
  }
  next();
});

// Método: completar pago
PaymentSchema.methods. complete = async function(gatewayResponse, authCode) {
  this.status = 'completed';
  this.gatewayResponse = gatewayResponse;
  this.authorizationCode = authCode;
  this.completedAt = new Date();
  return this.save();
};

// Método: fallar pago
PaymentSchema.methods.fail = async function(errorCode, errorMessage, gatewayResponse) {
  this.status = 'failed';
  this.errorCode = errorCode;
  this.errorMessage = errorMessage;
  this.gatewayResponse = gatewayResponse;
  this.failedAt = new Date();
  return this.save();
};

// Método: procesar reembolso
PaymentSchema.methods.processRefund = async function(amount, reason, userId) {
  if (this.status !== 'completed') {
    throw new Error('Solo se pueden reembolsar pagos completados');
  }
  
  this.status = 'refunded';
  this.refund = {
    amount: amount || this.amount,
    reason,
    processedAt: new Date(),
    processedBy: userId
  };
  
  return this.save();
};

// Static: obtener pagos de un usuario
PaymentSchema.statics.getUserPayments = async function(userId, options = {}) {
  const { status, page = 1, limit = 10 } = options;
  
  const filter = { user: userId };
  if (status) filter.status = status;
  
  return this.find(filter)
    .populate('order', 'orderNumber total')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

module.exports = mongoose.model('Payment', PaymentSchema);
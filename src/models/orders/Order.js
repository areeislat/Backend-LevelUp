const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true
  },
  productId: String,
  name: { 
    type: String, 
    required: true 
  },
  image: String,
  brand: String,
  price: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: 1
  },
  subtotal: Number
});

const ShippingSchema = new mongoose.Schema({
  method: { 
    type: String, 
    enum: ['standard', 'express', 'pickup'],
    default: 'standard'
  },
  address: {
    nombre: String,
    direccion: { type: String, required: true },
    comuna: { type: String, required: true },
    region: { type: String, required: true },
    codigoPostal: String,
    telefono: String,
    instrucciones: String
  },
  cost: { 
    type: Number, 
    default: 0 
  },
  estimatedDelivery: Date,
  carrier: String,
  trackingCode: String,
  trackingUrl: String,
  shippedAt: Date,
  deliveredAt: Date
}, { _id: false });

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  comment: String,
  updatedBy: { 
    type: mongoose.Schema. Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  // Número de orden único
  orderNumber: { 
    type: String, 
    required: true,
    unique: true
  },
  
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  
  // Items
  items: [OrderItemSchema],
  
  // Estado
  status: { 
    type: String, 
    enum: [
      'pending',      // Pendiente de pago
      'confirmed',    // Pago confirmado
      'processing',   // En preparación
      'shipped',      // Enviado
      'delivered',    // Entregado
      'cancelled',    // Cancelado
      'refunded'      // Reembolsado
    ],
    default: 'pending',
    index: true
  },
  statusHistory: [StatusHistorySchema],
  
  // Totales
  subtotal: { 
    type: Number, 
    required: true 
  },
  tax: { 
    type: Number, 
    default: 0 
  },
  shippingCost: { 
    type: Number, 
    default: 0 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  total: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'CLP' 
  },
  
  // Cupón usado
  coupon: {
    code: String,
    discountType: String,
    discountValue: Number
  },
  
  // Puntos de lealtad
  loyaltyPointsUsed: { 
    type: Number, 
    default: 0 
  },
  loyaltyPointsEarned: { 
    type: Number, 
    default: 0 
  },
  
  // Información de envío
  shipping: ShippingSchema,
  
  // Información de pago
  payment: {
    method: { 
      type: String, 
      enum: ['credit_card', 'debit_card', 'transfer', 'webpay', 'mercadopago'],
      required: true
    },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    gateway: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  
  // Notas
  customerNotes: String,
  internalNotes: String,
  
  // Facturación
  billingAddress: {
    rut: String,
    razonSocial: String,
    giro: String,
    direccion: String,
    comuna: String,
    region: String
  },
  invoiceNumber: String,
  invoiceUrl: String,
  
  // Cancelación/Reembolso
  cancellation: {
    reason: String,
    cancelledBy: { type: mongoose.Schema. Types.ObjectId, ref: 'User' },
    cancelledAt: Date
  },
  refund: {
    amount: Number,
    reason: String,
    refundedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    refundedAt: Date,
    transactionId: String
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'payment.status': 1 });
OrderSchema.index({ createdAt: -1 });

// Virtual: puede cancelarse
OrderSchema.virtual('canCancel').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Virtual: puede reembolsarse
OrderSchema.virtual('canRefund').get(function() {
  return ['confirmed', 'processing', 'delivered'].includes(this.status) 
    && this.payment.status === 'paid';
});

// Pre-save: generar número de orden
OrderSchema. pre('save', async function(next) {
  if (this.isNew && ! this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear(). toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8). toUpperCase();
    this. orderNumber = `LUG-${year}${month}-${random}`;
  }
  
  // Calcular subtotales de items
  this.items.forEach(item => {
    item.subtotal = item.price * item.quantity;
  });
  
  next();
});

// Método: actualizar estado
OrderSchema.methods.updateStatus = async function(newStatus, comment, userId) {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled', 'refunded'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`No se puede cambiar de ${this.status} a ${newStatus}`);
  }
  
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    comment,
    updatedBy: userId
  });
  
  return this.save();
};

// Método: marcar como pagado
OrderSchema.methods.markAsPaid = async function(transactionId, gateway, gatewayResponse) {
  this.payment.status = 'paid';
  this.payment.transactionId = transactionId;
  this.payment.gateway = gateway;
  this.payment.gatewayResponse = gatewayResponse;
  this.payment.paidAt = new Date();
  
  await this.updateStatus('confirmed', 'Pago confirmado');
  return this.save();
};

// Método: agregar tracking
OrderSchema.methods.addTracking = async function(trackingCode, carrier, trackingUrl) {
  this.shipping.trackingCode = trackingCode;
  this.shipping.carrier = carrier;
  this.shipping.trackingUrl = trackingUrl;
  this.shipping.shippedAt = new Date();
  
  await this.updateStatus('shipped', `Enviado con ${carrier}`);
  return this. save();
};

// Método: cancelar orden
OrderSchema.methods.cancel = async function(reason, userId) {
  if (! this.canCancel) {
    throw new Error('Esta orden no puede ser cancelada');
  }
  
  this.cancellation = {
    reason,
    cancelledBy: userId,
    cancelledAt: new Date()
  };
  
  await this.updateStatus('cancelled', reason, userId);
  return this.save();
};

// Static: crear desde carrito
OrderSchema.statics. createFromCart = async function(cart, userId, paymentMethod, shippingData) {
  const order = new this({
    user: userId,
    items: cart.items. map(item => ({
      product: item.product,
      productId: item.productId,
      name: item. name,
      image: item. image,
      price: item. price,
      quantity: item. quantity
    })),
    subtotal: cart.subtotal,
    tax: cart.tax,
    shippingCost: cart.shippingCost,
    discount: cart.discount,
    total: cart.total,
    currency: cart.currency,
    coupon: cart.coupon,
    loyaltyPointsUsed: cart.loyaltyPointsToUse,
    shipping: shippingData,
    payment: {
      method: paymentMethod,
      status: 'pending'
    }
  });
  
  // Calcular puntos a ganar (1 punto por cada $1000)
  order.loyaltyPointsEarned = Math.floor(order. total / 1000);
  
  return order.save();
};

// Static: obtener órdenes de usuario
OrderSchema.statics.getUserOrders = async function(userId, options = {}) {
  const { status, page = 1, limit = 10 } = options;
  
  const filter = { user: userId };
  if (status) filter.status = status;
  
  const [orders, total] = await Promise. all([
    this.find(filter)
      .sort({ createdAt: -1 })
      . skip((page - 1) * limit)
      .limit(limit)
      .populate('items.product', 'name image'),
    this. countDocuments(filter)
  ]);
  
  return {
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

// Static: estadísticas de ventas
OrderSchema.statics. getSalesStats = async function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        'payment.status': 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$total' },
        orderCount: { $sum: 1 },
        avgOrderValue: { $avg: '$total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', OrderSchema);
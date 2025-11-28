const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  
  // Tipo de notificación
  type: { 
    type: String, 
    enum: [
      'order_created',
      'order_confirmed', 
      'order_shipped',
      'order_delivered',
      'order_cancelled',
      'payment_success',
      'payment_failed',
      'loyalty_points_earned',
      'loyalty_tier_upgrade',
      'loyalty_points_expiring',
      'reward_redeemed',
      'ticket_created',
      'ticket_response',
      'ticket_resolved',
      'promotion',
      'price_drop',
      'back_in_stock',
      'review_reminder',
      'welcome',
      'system'
    ],
    required: true,
    index: true
  },
  
  // Contenido
  title: { 
    type: String, 
    required: true,
    maxlength: 200
  },
  message: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  
  // Datos adicionales
  data: {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    orderNumber: String,
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    ticketId: { type: mongoose. Schema.Types.ObjectId, ref: 'Ticket' },
    ticketNumber: String,
    points: Number,
    tier: String,
    rewardId: { type: mongoose.Schema. Types.ObjectId, ref: 'Reward' },
    link: String,
    imageUrl: String,
    extra: mongoose.Schema.Types.Mixed
  },
  
  // Canal de envío
  channel: { 
    type: String, 
    enum: ['in_app', 'email', 'push', 'sms'],
    default: 'in_app'
  },
  
  // Estado
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'delivered', 'failed', 'read'],
    default: 'pending',
    index: true
  },
  
  // Fechas
  sentAt: Date,
  deliveredAt: Date,
  readAt: Date,
  
  // Para emails
  emailId: String,
  emailTemplate: String,
  
  // Para push
  pushToken: String,
  
  // Error si falló
  errorMessage: String,
  
  // Prioridad
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  
  // Expiración (para notificaciones temporales)
  expiresAt: Date

}, { 
  timestamps: true 
});

// Índices
NotificationSchema.index({ user: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, readAt: 1 });
NotificationSchema. index({ type: 1, createdAt: -1 });
NotificationSchema. index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual: no leída
NotificationSchema.virtual('isUnread').get(function() {
  return ! this.readAt;
});

// Método: marcar como leída
NotificationSchema.methods.markAsRead = async function() {
  if (! this.readAt) {
    this.readAt = new Date();
    this.status = 'read';
    return this.save();
  }
  return this;
};

// Método: marcar como enviada
NotificationSchema.methods. markAsSent = async function(emailId = null) {
  this.status = 'sent';
  this.sentAt = new Date();
  if (emailId) this.emailId = emailId;
  return this.save();
};

// Método: marcar como fallida
NotificationSchema.methods. markAsFailed = async function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  return this.save();
};

// Static: crear notificación de orden
NotificationSchema.statics.createOrderNotification = async function(type, order, user) {
  const templates = {
    order_created: {
      title: '¡Pedido recibido!',
      message: `Tu pedido #${order.orderNumber} ha sido recibido y está siendo procesado.`
    },
    order_confirmed: {
      title: 'Pago confirmado',
      message: `El pago de tu pedido #${order.orderNumber} ha sido confirmado.`
    },
    order_shipped: {
      title: '¡Tu pedido está en camino!',
      message: `Tu pedido #${order. orderNumber} ha sido enviado.  Código de seguimiento: ${order.shipping?. trackingCode || 'N/A'}`
    },
    order_delivered: {
      title: 'Pedido entregado',
      message: `Tu pedido #${order.orderNumber} ha sido entregado.  ¡Gracias por tu compra!`
    },
    order_cancelled: {
      title: 'Pedido cancelado',
      message: `Tu pedido #${order.orderNumber} ha sido cancelado. `
    }
  };
  
  const template = templates[type];
  if (!template) throw new Error('Tipo de notificación no válido');
  
  return this.create({
    user: user._id || user,
    type,
    title: template.title,
    message: template.message,
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      link: `/perfil? section=compras`
    },
    channel: 'in_app'
  });
};

// Static: crear notificación de lealtad
NotificationSchema.statics.createLoyaltyNotification = async function(type, userId, data) {
  const templates = {
    loyalty_points_earned: {
      title: '¡Puntos ganados!',
      message: `Has ganado ${data.points} puntos Level Up.  Tu balance actual es ${data.balance} puntos.`
    },
    loyalty_tier_upgrade: {
      title: '¡Subiste de nivel!',
      message: `¡Felicitaciones! Ahora eres miembro ${data.tier. toUpperCase()}. Disfruta de tus nuevos beneficios.`
    },
    loyalty_points_expiring: {
      title: 'Puntos por expirar',
      message: `Tienes ${data.points} puntos que expirarán el ${new Date(data.expiryDate).toLocaleDateString()}. ¡Úsalos antes!`
    }
  };
  
  const template = templates[type];
  if (!template) throw new Error('Tipo de notificación no válido');
  
  return this.create({
    user: userId,
    type,
    title: template.title,
    message: template.message,
    data: {
      points: data. points,
      tier: data. tier,
      link: '/puntos'
    },
    channel: 'in_app'
  });
};

// Static: obtener notificaciones de usuario
NotificationSchema.statics.getUserNotifications = async function(userId, options = {}) {
  const { unreadOnly = false, type, page = 1, limit = 20 } = options;
  
  const filter = { user: userId };
  if (unreadOnly) filter.readAt = null;
  if (type) filter.type = type;
  
  const [notifications, total, unreadCount] = await Promise.all([
    this.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    this.countDocuments(filter),
    this.countDocuments({ user: userId, readAt: null })
  ]);
  
  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

// Static: marcar todas como leídas
NotificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { user: userId, readAt: null },
    { readAt: new Date(), status: 'read' }
  );
};

// Static: contar no leídas
NotificationSchema. statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ user: userId, readAt: null });
};

// Static: eliminar notificaciones antiguas
NotificationSchema.statics.cleanOld = async function(daysToKeep = 90) {
  const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  return this.deleteMany({ 
    createdAt: { $lt: cutoff },
    status: 'read'
  });
};

module.exports = mongoose.model('Notification', NotificationSchema);
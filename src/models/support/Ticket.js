const mongoose = require('mongoose');

const TicketMessageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  senderType: { 
    type: String, 
    enum: ['user', 'admin', 'system'],
    required: true
  },
  message: { 
    type: String, 
    required: true,
    maxlength: [5000, 'El mensaje no puede exceder 5000 caracteres']
  },
  attachments: [{
    filename: String,
    url: String,
    type: String,
    size: Number
  }],
  isInternal: { // Notas internas del equipo (no visibles para el usuario)
    type: Boolean, 
    default: false 
  },
  readAt: Date
}, { timestamps: true });

const TicketSchema = new mongoose.Schema({
  // Número de ticket único
  ticketNumber: { 
    type: String, 
    unique: true,
    required: true
  },
  
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  
  // Información del ticket
  subject: { 
    type: String, 
    required: [true, 'El asunto es requerido'],
    trim: true,
    maxlength: [200, 'El asunto no puede exceder 200 caracteres']
  },
  category: { 
    type: String, 
    enum: ['order', 'product', 'payment', 'shipping', 'account', 'technical', 'other'],
    default: 'other',
    index: true
  },
  
  // Prioridad
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  // Estado
  status: { 
    type: String, 
    enum: ['open', 'in_progress', 'pending_user', 'pending_admin', 'resolved', 'closed'],
    default: 'open',
    index: true
  },
  
  // Mensajes
  messages: [TicketMessageSchema],
  
  // Asignación
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    index: true
  },
  department: { 
    type: String, 
    enum: ['support', 'sales', 'technical', 'billing'],
    default: 'support'
  },
  
  // Referencias
  relatedOrder: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  },
  relatedProduct: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  },
  
  // Tags para búsqueda
  tags: [String],
  
  // Métricas
  firstResponseAt: Date,
  resolvedAt: Date,
  closedAt: Date,
  
  // Satisfacción
  rating: { 
    type: Number, 
    min: 1, 
    max: 5 
  },
  ratingComment: String,
  
  // Reapertura
  reopenCount: { 
    type: Number, 
    default: 0 
  },
  lastReopenedAt: Date

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
TicketSchema.index({ ticketNumber: 1 });
TicketSchema.index({ user: 1, status: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ status: 1, priority: -1, createdAt: 1 });

// Virtual: tiempo de respuesta (en horas)
TicketSchema. virtual('responseTime').get(function() {
  if (! this.firstResponseAt) return null;
  return Math.round((this.firstResponseAt - this.createdAt) / (1000 * 60 * 60) * 10) / 10;
});

// Virtual: tiempo de resolución (en horas)
TicketSchema.virtual('resolutionTime').get(function() {
  if (!this.resolvedAt) return null;
  return Math.round((this.resolvedAt - this.createdAt) / (1000 * 60 * 60) * 10) / 10;
});

// Virtual: mensajes visibles para usuario
TicketSchema.virtual('userMessages').get(function() {
  return this.messages.filter(m => ! m.isInternal);
});

// Virtual: cantidad de mensajes
TicketSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

// Pre-save: generar número de ticket
TicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const date = new Date();
    const year = date.getFullYear(). toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 7). toUpperCase();
    this. ticketNumber = `TKT-${year}${month}-${random}`;
  }
  next();
});

// Método: agregar mensaje
TicketSchema. methods.addMessage = async function(senderId, senderType, message, attachments = [], isInternal = false) {
  this.messages.push({
    sender: senderId,
    senderType,
    message,
    attachments,
    isInternal
  });
  
  // Primera respuesta del equipo
  if (senderType !== 'user' && ! this.firstResponseAt && ! isInternal) {
    this. firstResponseAt = new Date();
  }
  
  // Actualizar estado
  if (senderType === 'user') {
    if (this.status === 'pending_user') {
      this. status = 'pending_admin';
    }
  } else if (! isInternal) {
    if (this.status === 'open' || this.status === 'pending_admin') {
      this. status = 'pending_user';
    }
  }
  
  return this.save();
};

// Método: asignar ticket
TicketSchema.methods.assign = async function(adminId) {
  this.assignedTo = adminId;
  if (this.status === 'open') {
    this.status = 'in_progress';
  }
  return this.save();
};

// Método: resolver ticket
TicketSchema.methods.resolve = async function(adminId, resolutionMessage) {
  if (resolutionMessage) {
    await this.addMessage(adminId, 'admin', resolutionMessage);
  }
  
  this.status = 'resolved';
  this.resolvedAt = new Date();
  return this.save();
};

// Método: cerrar ticket
TicketSchema.methods.close = async function() {
  this.status = 'closed';
  this.closedAt = new Date();
  return this.save();
};

// Método: reabrir ticket
TicketSchema.methods. reopen = async function(userId, reason) {
  if (this.status !== 'resolved' && this.status !== 'closed') {
    throw new Error('Solo se pueden reabrir tickets resueltos o cerrados');
  }
  
  this.status = 'open';
  this.resolvedAt = null;
  this.closedAt = null;
  this.reopenCount += 1;
  this.lastReopenedAt = new Date();
  
  await this.addMessage(userId, 'user', `Ticket reabierto: ${reason}`);
  
  return this.save();
};

// Método: agregar rating
TicketSchema.methods. addRating = async function(rating, comment) {
  if (this.status !== 'resolved' && this.status !== 'closed') {
    throw new Error('Solo se pueden calificar tickets resueltos');
  }
  
  this.rating = rating;
  this.ratingComment = comment;
  return this.save();
};

// Static: obtener tickets de un usuario
TicketSchema. statics.getUserTickets = async function(userId, options = {}) {
  const { status, page = 1, limit = 10 } = options;
  
  const filter = { user: userId };
  if (status) filter.status = status;
  
  const [tickets, total] = await Promise. all([
    this.find(filter)
      .select('-messages. isInternal')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    this.countDocuments(filter)
  ]);
  
  return {
    tickets,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
};

// Static: obtener tickets para admin
TicketSchema.statics.getAdminQueue = async function(options = {}) {
  const { status, priority, category, assignedTo, page = 1, limit = 20 } = options;
  
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignedTo !== undefined) {
    filter.assignedTo = assignedTo === 'unassigned' ? null : assignedTo;
  }
  
  const [tickets, total, stats] = await Promise.all([
    this.find(filter)
      .populate('user', 'nombre email')
      .populate('assignedTo', 'nombre')
      .sort({ priority: -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    this.countDocuments(filter),
    this.aggregate([
      { $match: { status: { $nin: ['resolved', 'closed'] } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
  ]);
  
  return {
    tickets,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
  };
};

// Static: estadísticas de soporte
TicketSchema.statics.getStats = async function(startDate, endDate) {
  const match = {
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        avgRating: { $avg: '$rating' },
        avgResponseTime: { 
          $avg: { 
            $divide: [
              { $subtract: ['$firstResponseAt', '$createdAt'] }, 
              3600000 
            ] 
          } 
        },
        avgResolutionTime: { 
          $avg: { 
            $divide: [
              { $subtract: ['$resolvedAt', '$createdAt'] }, 
              3600000 
            ] 
          } 
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Ticket', TicketSchema);
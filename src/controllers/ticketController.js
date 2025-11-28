const Ticket = require('../models/support/Ticket');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Obtener tickets del usuario
 * GET /api/tickets
 */
const getTickets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { 
      status, 
      priority, 
      category,
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = {};
    
    // Si no es admin, solo ver sus propios tickets
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate('user', 'name email')
        .populate('assignedTo', 'name')
        .populate('relatedOrder', 'orderNumber')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Ticket.countDocuments(filter)
    ]);

    res.json({
      message: 'Tickets obtenidos exitosamente',
      statusCode: 200,
      data: {
        tickets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener ticket por ID
 * GET /api/tickets/:id
 */
const getTicketById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const filter = { _id: id };
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const ticket = await Ticket.findOne(filter)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .populate('relatedOrder', 'orderNumber total items')
      .populate('messages.sender', 'name');

    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado');
    }

    // Marcar mensajes como leídos si es el usuario
    if (userRole !== 'admin') {
      const unreadMessages = ticket.messages.filter(
        m => m.senderType !== 'user' && !m.readAt
      );
      for (const message of unreadMessages) {
        message.readAt = new Date();
      }
      if (unreadMessages.length > 0) {
        await ticket.save();
      }
    }

    res.json({
      message: 'Ticket obtenido exitosamente',
      statusCode: 200,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear ticket
 * POST /api/tickets
 */
const createTicket = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { subject, category, priority, message, relatedOrder, attachments } = req.body;

    if (!subject || !category || !message) {
      throw new ValidationError('Campos requeridos: subject, category, message');
    }

    const ticket = await Ticket.create({
      user: userId,
      subject,
      category,
      priority: priority || 'normal',
      relatedOrder,
      messages: [{
        sender: userId,
        senderType: 'user',
        message,
        attachments
      }]
    });

    await ticket.populate('user', 'name email');

    res.status(201).json({
      message: 'Ticket creado exitosamente',
      statusCode: 201,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agregar mensaje al ticket
 * POST /api/tickets/:id/messages
 */
const addMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { message, attachments, isInternal } = req.body;

    if (!message) {
      throw new ValidationError('El mensaje es requerido');
    }

    const filter = { _id: id };
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const ticket = await Ticket.findOne(filter);

    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado');
    }

    if (ticket.status === 'closed') {
      throw new ValidationError('No se pueden agregar mensajes a un ticket cerrado');
    }

    const senderType = userRole === 'admin' ? 'admin' : 'user';

    await ticket.addMessage({
      sender: userId,
      senderType,
      message,
      attachments,
      isInternal: isInternal && userRole === 'admin'
    });

    await ticket.populate('messages.sender', 'name');

    res.status(201).json({
      message: 'Mensaje agregado exitosamente',
      statusCode: 201,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar estado del ticket
 * PATCH /api/tickets/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'pending_user', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Estado inválido');
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado');
    }

    await ticket.updateStatus(status);

    res.json({
      message: 'Estado actualizado exitosamente',
      statusCode: 200,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar prioridad del ticket (solo admin)
 * PATCH /api/tickets/:id/priority
 */
const updatePriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      throw new ValidationError('Prioridad inválida');
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { priority },
      { new: true }
    );

    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado');
    }

    res.json({
      message: 'Prioridad actualizada exitosamente',
      statusCode: 200,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Asignar ticket a un agente (solo admin)
 * PATCH /api/tickets/:id/assign
 */
const assignTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado');
    }

    await ticket.assignTo(assignedTo);

    res.json({
      message: 'Ticket asignado exitosamente',
      statusCode: 200,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cerrar ticket
 * POST /api/tickets/:id/close
 */
const closeTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { resolution } = req.body;

    const filter = { _id: id };
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const ticket = await Ticket.findOne(filter);

    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado');
    }

    await ticket.close(resolution);

    res.json({
      message: 'Ticket cerrado exitosamente',
      statusCode: 200,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reabrir ticket
 * POST /api/tickets/:id/reopen
 */
const reopenTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;
    const { reason } = req.body;

    const filter = { _id: id };
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const ticket = await Ticket.findOne(filter);

    if (!ticket) {
      throw new NotFoundError('Ticket no encontrado');
    }

    await ticket.reopen(reason);

    res.json({
      message: 'Ticket reabierto exitosamente',
      statusCode: 200,
      data: { ticket }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de tickets (solo admin)
 * GET /api/tickets/stats
 */
const getTicketStats = async (req, res, next) => {
  try {
    const [
      total,
      statusBreakdown,
      priorityBreakdown,
      categoryBreakdown,
      avgResolutionTime
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.aggregate([
        { $group: { _id: '$status', count: { $count: {} } } }
      ]),
      Ticket.aggregate([
        { $group: { _id: '$priority', count: { $count: {} } } }
      ]),
      Ticket.aggregate([
        { $group: { _id: '$category', count: { $count: {} } } }
      ]),
      Ticket.aggregate([
        { $match: { status: 'closed', closedAt: { $exists: true } } },
        { 
          $project: { 
            resolutionTime: { 
              $subtract: ['$closedAt', '$createdAt'] 
            } 
          } 
        },
        { $group: { _id: null, avg: { $avg: '$resolutionTime' } } }
      ])
    ]);

    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      statusCode: 200,
      data: {
        total,
        statusBreakdown,
        priorityBreakdown,
        categoryBreakdown,
        avgResolutionTimeHours: avgResolutionTime[0]?.avg 
          ? (avgResolutionTime[0].avg / (1000 * 60 * 60)).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  addMessage,
  updateStatus,
  updatePriority,
  assignTicket,
  closeTicket,
  reopenTicket,
  getTicketStats
};

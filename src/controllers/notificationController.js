const Notification = require('../models/support/Notification');
const { NotFoundError } = require('../utils/errors');

/**
 * Obtener notificaciones del usuario
 * GET /api/notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { 
      unreadOnly, 
      type, 
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = { user: userId };
    if (unreadOnly === 'true') filter.isRead = false;
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ user: userId, isRead: false })
    ]);

    res.json({
      message: 'Notificaciones obtenidas exitosamente',
      statusCode: 200,
      data: {
        notifications,
        unreadCount,
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
 * Marcar notificación como leída
 * PATCH /api/notifications/:id/read
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({ _id: id, user: userId });

    if (!notification) {
      throw new NotFoundError('Notificación no encontrada');
    }

    await notification.markAsRead();

    res.json({
      message: 'Notificación marcada como leída',
      statusCode: 200,
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marcar todas como leídas
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      message: 'Todas las notificaciones marcadas como leídas',
      statusCode: 200
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar notificación
 * DELETE /api/notifications/:id
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

    if (!notification) {
      throw new NotFoundError('Notificación no encontrada');
    }

    res.json({
      message: 'Notificación eliminada',
      statusCode: 200,
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar todas las notificaciones leídas
 * DELETE /api/notifications/read
 */
const deleteReadNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const result = await Notification.deleteMany({ 
      user: userId, 
      isRead: true 
    });

    res.json({
      message: `${result.deletedCount} notificaciones eliminadas`,
      statusCode: 200,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear notificación (interno o admin)
 * POST /api/notifications
 */
const createNotification = async (req, res, next) => {
  try {
    const notificationData = req.body;

    const notification = await Notification.create(notificationData);

    res.status(201).json({
      message: 'Notificación creada exitosamente',
      statusCode: 201,
      data: { notification }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener preferencias de notificación
 * GET /api/notifications/preferences
 */
const getPreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aquí podrías tener un modelo separado para preferencias
    // Por ahora retornamos las preferencias del usuario si existen
    const User = require('../models/auth/User');
    const user = await User.findById(userId).select('notificationPreferences');

    res.json({
      message: 'Preferencias obtenidas exitosamente',
      statusCode: 200,
      data: { 
        preferences: user.notificationPreferences || {
          email: true,
          push: true,
          sms: false
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar preferencias de notificación
 * PUT /api/notifications/preferences
 */
const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const preferences = req.body;

    const User = require('../models/auth/User');
    const user = await User.findByIdAndUpdate(
      userId,
      { notificationPreferences: preferences },
      { new: true }
    ).select('notificationPreferences');

    res.json({
      message: 'Preferencias actualizadas exitosamente',
      statusCode: 200,
      data: { preferences: user.notificationPreferences }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  createNotification,
  getPreferences,
  updatePreferences
};

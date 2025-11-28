const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  createNotification,
  getPreferences,
  updatePreferences
} = require('../controllers/notificationController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/notifications/preferences
 * @desc    Obtener preferencias de notificación
 * @access  Private
 */
router.get('/preferences', authenticate, getPreferences);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Actualizar preferencias de notificación
 * @access  Private
 */
router.put('/preferences', authenticate, updatePreferences);

/**
 * @route   GET /api/notifications
 * @desc    Obtener notificaciones del usuario
 * @access  Private
 */
router.get('/', authenticate, getNotifications);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Marcar notificación como leída
 * @access  Private
 */
router.patch('/:id/read', authenticate, markAsRead);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Marcar todas como leídas
 * @access  Private
 */
router.patch('/read-all', authenticate, markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Eliminar notificación
 * @access  Private
 */
router.delete('/:id', authenticate, deleteNotification);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Eliminar todas las notificaciones leídas
 * @access  Private
 */
router.delete('/read', authenticate, deleteReadNotifications);

/**
 * @route   POST /api/notifications
 * @desc    Crear notificación
 * @access  Private (Admin)
 */
router.post('/', authenticate, requireRole('admin'), createNotification);

module.exports = router;

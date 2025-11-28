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
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Obtener notificaciones del usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 */
router.get('/', authenticate, getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Marcar notificación como leída
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 */
router.patch('/:id/read', authenticate, markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Marcar todas como leídas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
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

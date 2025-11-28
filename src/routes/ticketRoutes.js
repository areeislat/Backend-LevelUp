const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ticketController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/tickets/stats
 * @desc    Obtener estadísticas de tickets
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, requireRole('admin'), getTicketStats);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     tags: [Tickets]
 *     summary: Obtener tickets del usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tickets
 */
router.get('/', authenticate, getTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     tags: [Tickets]
 *     summary: Obtener ticket por ID
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
 *         description: Ticket encontrado
 */
router.get('/:id', authenticate, getTicketById);

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     tags: [Tickets]
 *     summary: Crear ticket
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               category:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket creado
 */
router.post('/', authenticate, createTicket);

/**
 * @swagger
 * /api/tickets/{id}/messages:
 *   post:
 *     tags: [Tickets]
 *     summary: Agregar mensaje al ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mensaje agregado
 */
router.post('/:id/messages', authenticate, addMessage);

/**
 * @route   PATCH /api/tickets/:id/status
 * @desc    Actualizar estado del ticket
 * @access  Private (Admin)
 */
router.patch('/:id/status', authenticate, requireRole('admin'), updateStatus);

/**
 * @route   PATCH /api/tickets/:id/priority
 * @desc    Actualizar prioridad del ticket
 * @access  Private (Admin)
 */
router.patch('/:id/priority', authenticate, requireRole('admin'), updatePriority);

/**
 * @route   PATCH /api/tickets/:id/assign
 * @desc    Asignar ticket a un agente
 * @access  Private (Admin)
 */
router.patch('/:id/assign', authenticate, requireRole('admin'), assignTicket);

/**
 * @route   POST /api/tickets/:id/close
 * @desc    Cerrar ticket
 * @access  Private
 */
router.post('/:id/close', authenticate, closeTicket);

/**
 * @route   POST /api/tickets/:id/reopen
 * @desc    Reabrir ticket
 * @access  Private
 */
router.post('/:id/reopen', authenticate, reopenTicket);

module.exports = router;

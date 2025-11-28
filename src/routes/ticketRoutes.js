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
 * @route   GET /api/tickets
 * @desc    Obtener tickets del usuario
 * @access  Private
 */
router.get('/', authenticate, getTickets);

/**
 * @route   GET /api/tickets/:id
 * @desc    Obtener ticket por ID
 * @access  Private
 */
router.get('/:id', authenticate, getTicketById);

/**
 * @route   POST /api/tickets
 * @desc    Crear ticket
 * @access  Private
 */
router.post('/', authenticate, createTicket);

/**
 * @route   POST /api/tickets/:id/messages
 * @desc    Agregar mensaje al ticket
 * @access  Private
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

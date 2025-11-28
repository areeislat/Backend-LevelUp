const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  processPayment,
  confirmPayment,
  failPayment,
  refundPayment,
  handleWebhook,
  getPaymentStats
} = require('../controllers/paymentController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/payments/webhook/:gateway
 * @desc    Webhook para notificaciones del gateway
 * @access  Public (validación interna por gateway)
 */
router.post('/webhook/:gateway', handleWebhook);

/**
 * @route   GET /api/payments/stats
 * @desc    Obtener estadísticas de pagos
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, requireRole('admin'), getPaymentStats);

/**
 * @route   GET /api/payments
 * @desc    Obtener pagos del usuario
 * @access  Private
 */
router.get('/', authenticate, getPayments);

/**
 * @route   GET /api/payments/:id
 * @desc    Obtener pago por ID
 * @access  Private
 */
router.get('/:id', authenticate, getPaymentById);

/**
 * @route   POST /api/payments
 * @desc    Crear pago
 * @access  Private
 */
router.post('/', authenticate, createPayment);

/**
 * @route   POST /api/payments/:id/process
 * @desc    Procesar pago
 * @access  Private
 */
router.post('/:id/process', authenticate, processPayment);

/**
 * @route   POST /api/payments/:id/confirm
 * @desc    Confirmar pago exitoso
 * @access  Private (Admin)
 */
router.post('/:id/confirm', authenticate, requireRole('admin'), confirmPayment);

/**
 * @route   POST /api/payments/:id/fail
 * @desc    Marcar pago como fallido
 * @access  Private (Admin)
 */
router.post('/:id/fail', authenticate, requireRole('admin'), failPayment);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Procesar reembolso
 * @access  Private (Admin)
 */
router.post('/:id/refund', authenticate, requireRole('admin'), refundPayment);

module.exports = router;

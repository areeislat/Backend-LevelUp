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
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Obtener pagos del usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
router.get('/', authenticate, getPayments);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Obtener pago por ID
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
 *         description: Pago encontrado
 */
router.get('/:id', authenticate, getPaymentById);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Crear pago
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               method:
 *                 type: string
 *               gateway:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pago creado
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

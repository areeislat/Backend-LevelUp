const express = require('express');
const router = express.Router();
const {
  getPayments,
  getPaymentById,
  createPayment,
  handleWebhook 
} = require('../controllers/paymentController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/payments/webhook/:gateway
 * @desc    Webhook para notificaciones del gateway (Stub)
 * @access  Public (validación interna por gateway)
 */
router.post('/webhook/:gateway', handleWebhook);

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
 *     summary: Crear pago (Simula confirmación inmediata)
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
 *         description: Pago creado y confirmado inmediatamente (Simulación)
 */
router.post('/', authenticate, createPayment);

module.exports = router;

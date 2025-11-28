const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  updateShippingInfo,
  getOrderStats
} = require('../controllers/orderController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/orders/stats
 * @desc    Obtener estadísticas de pedidos
 * @access  Private (Admin)
 */
router.get('/stats', authenticate, requireRole('admin'), getOrderStats);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener pedidos del usuario
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/', authenticate, getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener pedido por ID
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
 *         description: Pedido encontrado
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Crear pedido desde carrito
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pedido creado
 */
router.post('/', authenticate, createOrder);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancelar pedido
 * @access  Private
 */
router.post('/:id/cancel', authenticate, cancelOrder);

/**
 * @route   PATCH /api/orders/:id/status
 * @desc    Actualizar estado del pedido
 * @access  Private (Admin)
 */
router.patch('/:id/status', authenticate, requireRole('admin'), updateOrderStatus);

/**
 * @route   PATCH /api/orders/:id/shipping
 * @desc    Actualizar información de envío
 * @access  Private (Admin)
 */
router.patch('/:id/shipping', authenticate, requireRole('admin'), updateShippingInfo);

module.exports = router;

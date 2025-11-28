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
 * @route   GET /api/orders
 * @desc    Obtener pedidos del usuario
 * @access  Private
 */
router.get('/', authenticate, getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener pedido por ID
 * @access  Private
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @route   POST /api/orders
 * @desc    Crear pedido desde carrito
 * @access  Private
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

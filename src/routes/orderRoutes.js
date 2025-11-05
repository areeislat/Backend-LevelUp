const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middlewares/auth');
const { extractTenant, validateTenantUser } = require('../middlewares/tenant');
const { validate, createOrderValidator } = require('../utils/validators');

/**
 * Rutas de Órdenes
 * Todas las rutas requieren autenticación
 */

// Aplicar middlewares base a todas las rutas
router.use(extractTenant);
router.use(authenticate);
router.use(validateTenantUser);

// Crear una nueva orden
router.post('/', validate(createOrderValidator), createOrder);

// Obtener órdenes del usuario autenticado
router.get('/my-orders', getMyOrders);

// Obtener todas las órdenes (solo admin)
router.get('/', authorize('admin'), getAllOrders);

// Obtener una orden por ID
router.get('/:id', getOrderById);

// Actualizar estado de una orden (solo admin)
router.put('/:id/status', authorize('admin'), updateOrderStatus);

// Cancelar una orden
router.post('/:id/cancel', cancelOrder);

module.exports = router;


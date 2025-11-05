const express = require('express');
const router = express.Router();
const {
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { authenticate } = require('../middlewares/auth');
const { extractTenant, validateTenantUser } = require('../middlewares/tenant');
const { validate, addToCartValidator } = require('../utils/validators');

/**
 * Rutas de Carrito
 * Todas las rutas requieren autenticación
 */

// Aplicar middlewares a todas las rutas
router.use(extractTenant);
router.use(authenticate);
router.use(validateTenantUser);

// Obtener o crear carrito del usuario
router.get('/', getOrCreateCart);

// Añadir producto al carrito
router.post('/items', validate(addToCartValidator), addToCart);

// Actualizar cantidad de un producto en el carrito
router.put('/items/:productId', updateCartItem);

// Eliminar un producto del carrito
router.delete('/items/:productId', removeFromCart);

// Vaciar el carrito
router.delete('/', clearCart);

module.exports = router;


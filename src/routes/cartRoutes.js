const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeCart
} = require('../controllers/cartController');

// IMPORTANTE: Importamos optionalAuthenticate
const { authenticate, optionalAuthenticate } = require('../middlewares/authMiddleware');

/**
 * Rutas con Autenticación Opcional:
 * - Si el usuario envía token, usamos su carrito personal.
 * - Si no, usamos el carrito de sesión (invitado).
 */
router.get('/', optionalAuthenticate, getCart);
router.post('/items', optionalAuthenticate, addItem);
router.put('/items/:productId', optionalAuthenticate, updateItemQuantity);
router.delete('/items/:productId', optionalAuthenticate, removeItem);
router.delete('/', optionalAuthenticate, clearCart);
router.post('/coupon', optionalAuthenticate, applyCoupon);
router.delete('/coupon', optionalAuthenticate, removeCoupon);

// Esta ruta SÍ requiere autenticación obligatoria
router.post('/merge', authenticate, mergeCart);

module.exports = router;
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
const { authenticate } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/cart
 * @desc    Obtener carrito del usuario
 * @access  Public/Private (funciona con o sin autenticación)
 */
router.get('/', getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Agregar item al carrito
 * @access  Public/Private
 */
router.post('/items', addItem);

/**
 * @route   PUT /api/cart/items/:productId
 * @desc    Actualizar cantidad de un item
 * @access  Public/Private
 */
router.put('/items/:productId', updateItemQuantity);

/**
 * @route   DELETE /api/cart/items/:productId
 * @desc    Eliminar item del carrito
 * @access  Public/Private
 */
router.delete('/items/:productId', removeItem);

/**
 * @route   DELETE /api/cart
 * @desc    Limpiar carrito
 * @access  Public/Private
 */
router.delete('/', clearCart);

/**
 * @route   POST /api/cart/coupon
 * @desc    Aplicar cupón de descuento
 * @access  Public/Private
 */
router.post('/coupon', applyCoupon);

/**
 * @route   DELETE /api/cart/coupon
 * @desc    Remover cupón
 * @access  Public/Private
 */
router.delete('/coupon', removeCoupon);

/**
 * @route   POST /api/cart/merge
 * @desc    Migrar carrito de sesión a usuario
 * @access  Private
 */
router.post('/merge', authenticate, mergeCart);

module.exports = router;

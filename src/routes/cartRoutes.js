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
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Obtener carrito del usuario
 *     description: Obtiene el carrito actual del usuario autenticado o por sesión
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 */
router.get('/', getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Agregar item al carrito
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Item agregado al carrito
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

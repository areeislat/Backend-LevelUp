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
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Obtener carrito del usuario
 *     description: Obtiene el carrito del usuario autenticado o del invitado (sesión)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 cart:
 *                   type: object
 */
router.get('/', optionalAuthenticate, getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Añadir producto al carrito
 *     description: Añade un producto al carrito del usuario o invitado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Producto añadido al carrito
 */
router.post('/items', optionalAuthenticate, addItem);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   put:
 *     tags: [Cart]
 *     summary: Actualizar cantidad de producto en carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 */
router.put('/items/:productId', optionalAuthenticate, updateItemQuantity);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Eliminar producto del carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 */
router.delete('/items/:productId', optionalAuthenticate, removeItem);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Vaciar carrito completo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito vaciado exitosamente
 */
router.delete('/', optionalAuthenticate, clearCart);

/**
 * @swagger
 * /api/cart/coupon:
 *   post:
 *     tags: [Cart]
 *     summary: Aplicar cupón de descuento
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: DESCUENTO10
 *     responses:
 *       200:
 *         description: Cupón aplicado exitosamente
 */
router.post('/coupon', optionalAuthenticate, applyCoupon);

/**
 * @swagger
 * /api/cart/coupon:
 *   delete:
 *     tags: [Cart]
 *     summary: Remover cupón de descuento
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cupón removido exitosamente
 */
router.delete('/coupon', optionalAuthenticate, removeCoupon);

/**
 * @swagger
 * /api/cart/merge:
 *   post:
 *     tags: [Cart]
 *     summary: Fusionar carrito de invitado con carrito de usuario
 *     description: Fusiona el carrito de sesión (invitado) con el carrito del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionCart:
 *                 type: object
 *     responses:
 *       200:
 *         description: Carritos fusionados exitosamente
 */
router.post('/merge', authenticate, mergeCart);

module.exports = router;
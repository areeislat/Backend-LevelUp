const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  markAsHelpful,
  moderateReview
} = require('../controllers/reviewController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener reseñas de un producto
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           default: approved
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get('/product/:productId', getProductReviews);

/**
 * @swagger
 * /api/reviews/my-reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener mis reseñas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mis reseñas
 */
router.get('/my-reviews', authenticate, getMyReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Crear reseña
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reseña creada
 */
router.post('/', authenticate, createReview);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Actualizar reseña
 * @access  Private
 */
router.put('/:id', authenticate, updateReview);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Eliminar reseña
 * @access  Private
 */
router.delete('/:id', authenticate, deleteReview);

/**
 * @route   POST /api/reviews/:id/helpful
 * @desc    Marcar reseña como útil
 * @access  Private
 */
router.post('/:id/helpful', authenticate, markAsHelpful);

/**
 * @route   PATCH /api/reviews/:id/moderate
 * @desc    Moderar reseña (aprobar/rechazar)
 * @access  Private (Admin)
 */
router.patch('/:id/moderate', authenticate, requireRole('admin'), moderateReview);

module.exports = router;

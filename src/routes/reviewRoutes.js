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
 * @route   GET /api/reviews/product/:productId
 * @desc    Obtener reseñas de un producto
 * @access  Public
 */
router.get('/product/:productId', getProductReviews);

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Obtener mis reseñas
 * @access  Private
 */
router.get('/my-reviews', authenticate, getMyReviews);

/**
 * @route   POST /api/reviews
 * @desc    Crear reseña
 * @access  Private
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

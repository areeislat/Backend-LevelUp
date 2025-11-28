const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/categories
 * @desc    Obtener todas las categorías
 * @access  Public
 */
router.get('/', getCategories);

/**
 * @route   GET /api/categories/:idOrSlug
 * @desc    Obtener categoría por ID o slug
 * @access  Public
 */
router.get('/:idOrSlug', getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Crear categoría
 * @access  Private (Admin)
 */
router.post('/', authenticate, requireRole('admin'), createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Actualizar categoría
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, requireRole('admin'), updateCategory);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Eliminar categoría
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  reserveStock,
  releaseStock
} = require('../controllers/productController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

/**
 * @route   GET /api/products
 * @desc    Obtener todos los productos con filtros
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:idOrSlug
 * @desc    Obtener producto por ID o slug
 * @access  Public
 */
router.get('/:idOrSlug', getProductById);

/**
 * @route   POST /api/products
 * @desc    Crear producto
 * @access  Private (Admin)
 */
router.post('/', authenticate, requireRole('admin'), createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Actualizar producto
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, requireRole('admin'), updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar producto (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteProduct);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Actualizar stock de producto
 * @access  Private (Admin)
 */
router.patch('/:id/stock', authenticate, requireRole('admin'), updateStock);

/**
 * @route   POST /api/products/:id/reserve
 * @desc    Reservar stock
 * @access  Private (Admin)
 */
router.post('/:id/reserve', authenticate, requireRole('admin'), reserveStock);

/**
 * @route   POST /api/products/:id/release
 * @desc    Liberar stock reservado
 * @access  Private (Admin)
 */
router.post('/:id/release', authenticate, requireRole('admin'), releaseStock);

module.exports = router;

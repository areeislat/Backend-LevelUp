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
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Obtener todos los productos con filtros
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría ID
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filtrar por marca
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Solo productos en stock
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por texto
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de productos con paginación
 */
router.get('/', getProducts);

/**
 * @swagger
 * /api/products/{idOrSlug}:
 *   get:
 *     tags: [Products]
 *     summary: Obtener producto por ID o slug
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:idOrSlug', getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Crear producto
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
 *               - name
 *               - pricing
 *             properties:
 *               productId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               pricing:
 *                 type: object
 *                 properties:
 *                   basePrice:
 *                     type: number
 *                   salePrice:
 *                     type: number
 *     responses:
 *       201:
 *         description: Producto creado
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

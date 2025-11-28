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
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Obtener todas las categorías
 *     description: Lista todas las categorías activas o filtradas
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por categorías activas
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filtrar por categorías destacadas
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/', getCategories);

/**
 * @swagger
 * /api/categories/{idOrSlug}:
 *   get:
 *     tags: [Categories]
 *     summary: Obtener categoría por ID o slug
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:idOrSlug', getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Crear categoría
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, requireRole('admin'), createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Actualizar categoría
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría actualizada
 */
router.put('/:id', authenticate, requireRole('admin'), updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Eliminar categoría
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría eliminada
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteCategory);

module.exports = router;

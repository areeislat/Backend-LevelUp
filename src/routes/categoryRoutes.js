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
 *                 example: Ropa
 *               slug:
 *                 type: string
 *                 example: ropa
 *               description:
 *                 type: string
 *                 example: "Categoría de prendas de vestir y accesorios."
 *               icon:
 *                 type: string
 *                 example: "tshirt"
 *     responses:
 *       201:
 *         description: Categoría creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categoría creada exitosamente
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6567e1c2f1a2b3c4d5e6f7a8
 *                         name:
 *                           type: string
 *                           example: Ropa
 *                         slug:
 *                           type: string
 *                           example: ropa
 *                         description:
 *                           type: string
 *                           example: "Categoría de prendas de vestir y accesorios."
 *                         icon:
 *                           type: string
 *                           example: "tshirt"
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
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ropa actualizada
 *               slug:
 *                 type: string
 *                 example: ropa-actualizada
 *               description:
 *                 type: string
 *                 example: "Nueva descripción de la categoría."
 *               icon:
 *                 type: string
 *                 example: "tshirt"
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Categoría actualizada exitosamente
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6567e1c2f1a2b3c4d5e6f7a8
 *                         name:
 *                           type: string
 *                           example: Ropa actualizada
 *                         slug:
 *                           type: string
 *                           example: ropa-actualizada
 *                         description:
 *                           type: string
 *                           example: "Nueva descripción de la categoría."
 *                         icon:
 *                           type: string
 *                           example: "tshirt"
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

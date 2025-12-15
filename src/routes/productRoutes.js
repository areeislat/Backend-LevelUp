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
const upload = require('../middlewares/uploadImage');
/**
 * @swagger
 * /api/products/upload-image:
 *   post:
 *     tags: [Products]
 *     summary: Subir imagen de producto a Cloudinary
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: URL de la imagen subida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: https://res.cloudinary.com/tu_cloud/image/upload/v123456789/producto.jpg
 */
router.post('/upload-image', authenticate, requireRole('admin'), upload.single('image'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'No se subió ninguna imagen', statusCode: 400 });
  }
  res.json({ url: req.file.path });
});

/**
 * @swagger
 * /api/products/upload-image-test:
 *   post:
 *     tags: [Products]
 *     summary: (TEMPORAL) Subir imagen sin autenticación - SOLO PARA PRUEBAS
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: URL de la imagen subida
 */
router.post('/upload-image-test', upload.single('image'), (req, res) => {
  console.log('📤 Upload test endpoint hit');
  console.log('File received:', req.file ? 'Yes' : 'No');
  
  if (!req.file || !req.file.path) {
    console.error('❌ No file received');
    return res.status(400).json({ message: 'No se subió ninguna imagen', statusCode: 400 });
  }
  
  console.log('✅ Image uploaded to:', req.file.path);
  res.json({ url: req.file.path });
});

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
 *               - price
 *               - image
 *               - stock
 *             properties:
 *               productId:
 *                 type: string
 *                 example: SKU-12345
 *               name:
 *                 type: string
 *                 example: Camiseta básica
 *               description:
 *                 type: string
 *                 example: Camiseta 100% algodón, varios colores.
 *               price:
 *                 type: number
 *                 example: 19.99
 *               oldPrice:
 *                 type: number
 *                 example: 24.99
 *               image:
 *                 type: string
 *                 example: https://res.cloudinary.com/tu_cloud/image/upload/v123456789/producto.jpg
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://res.cloudinary.com/tu_cloud/image/upload/v123456789/galeria1.jpg"]
 *               category:
 *                 type: string
 *                 example: ropa
 *               stock:
 *                 type: object
 *                 properties:
 *                   current:
 *                     type: integer
 *                     example: 50
 *                   minLevel:
 *                     type: integer
 *                     example: 5
 *                   maxLevel:
 *                     type: integer
 *                     example: 100
 *                 example: {"current": 50, "minLevel": 5, "maxLevel": 100}
 *     example:
 *       productId: SKU-12345
 *       name: Camiseta básica
 *       description: Camiseta 100% algodón, varios colores.
 *       price: 19.99
 *       oldPrice: 24.99
 *       image: https://res.cloudinary.com/tu_cloud/image/upload/v123456789/producto.jpg
 *       images: ["https://res.cloudinary.com/tu_cloud/image/upload/v123456789/galeria1.jpg"]
 *       category: ropa
 *       stock: { current: 50, minLevel: 5, maxLevel: 100 }
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post('/', authenticate, requireRole('admin'), createProduct);


/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Actualizar producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Camiseta actualizada
 *               description:
 *                 type: string
 *                 example: Nueva descripción del producto.
 *               price:
 *                 type: number
 *                 example: 21.99
 *               oldPrice:
 *                 type: number
 *                 example: 24.99
 *               image:
 *                 type: string
 *                 example: https://res.cloudinary.com/tu_cloud/image/upload/v123456789/producto.jpg
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://res.cloudinary.com/tu_cloud/image/upload/v123456789/galeria1.jpg"]
 *               category:
 *                 type: string
 *                 example: ropa
 *               stock:
 *                 type: object
 *                 properties:
 *                   current:
 *                     type: integer
 *                     example: 40
 *                   minLevel:
 *                     type: integer
 *                     example: 5
 *                   maxLevel:
 *                     type: integer
 *                     example: 100
 *                 example: {"current": 40, "minLevel": 5, "maxLevel": 100}
 *     responses:
 *       200:
 *         description: Producto actualizado
 */
router.put('/:id', authenticate, requireRole('admin'), updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Eliminar producto (soft delete)
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, requireRole('admin'), deleteProduct);


/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     tags: [Products]
 *     summary: Actualizar stock de producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - type
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 10
 *               type:
 *                 type: string
 *                 enum: [restock, sale, adjustment]
 *                 example: restock
 *               reason:
 *                 type: string
 *                 example: "Reposición de stock"
 *               orderId:
 *                 type: string
 *                 example: "6567e1c2f1a2b3c4d5e6f7a8"
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 */
router.patch('/:id/stock', authenticate, requireRole('admin'), updateStock);


/**
 * @swagger
 * /api/products/{id}/reserve:
 *   post:
 *     tags: [Products]
 *     summary: Reservar stock de producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               orderId:
 *                 type: string
 *                 example: "6567e1c2f1a2b3c4d5e6f7a8"
 *     responses:
 *       200:
 *         description: Stock reservado exitosamente
 */
router.post('/:id/reserve', authenticate, requireRole('admin'), reserveStock);


/**
 * @swagger
 * /api/products/{id}/release:
 *   post:
 *     tags: [Products]
 *     summary: Liberar stock reservado de producto
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               orderId:
 *                 type: string
 *                 example: "6567e1c2f1a2b3c4d5e6f7a8"
 *     responses:
 *       200:
 *         description: Stock liberado exitosamente
 */
router.post('/:id/release', authenticate, requireRole('admin'), releaseStock);

module.exports = router;

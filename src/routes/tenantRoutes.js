const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     tags: [Tenants]
 *     summary: Crear nuevo tenant
 *     description: Crea un nuevo tenant con opción de crear admin inicial
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
 *                 example: Mi Tienda
 *               slug:
 *                 type: string
 *                 example: mi-tienda
 *               adminName:
 *                 type: string
 *                 example: Administrador
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 example: admin@mitienda.com
 *               adminPassword:
 *                 type: string
 *                 format: password
 *                 example: Admin123!
 *     responses:
 *       201:
 *         description: Tenant creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     tenant:
 *                       $ref: '#/components/schemas/Tenant'
 *                     admin:
 *                       $ref: '#/components/schemas/User'
 *       409:
 *         description: Slug ya en uso
 */
router.post('/', tenantController.createTenant);

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     tags: [Tenants]
 *     summary: Obtener todos los tenants (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Elementos por página
 *     responses:
 *       200:
 *         description: Lista de tenants
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.get('/', authenticateToken, requireAdmin, tenantController.getTenants);

/**
 * @swagger
 * /api/tenants/{id}:
 *   get:
 *     tags: [Tenants]
 *     summary: Obtener tenant por ID (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tenant
 *     responses:
 *       200:
 *         description: Tenant encontrado
 *       404:
 *         description: Tenant no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.get('/:id', authenticateToken, requireAdmin, tenantController.getTenantById);

/**
 * @swagger
 * /api/tenants/{id}:
 *   put:
 *     tags: [Tenants]
 *     summary: Actualizar tenant (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tenant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tenant actualizado
 *       404:
 *         description: Tenant no encontrado
 *       409:
 *         description: Slug ya en uso
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.put('/:id', authenticateToken, requireAdmin, tenantController.updateTenant);

/**
 * @swagger
 * /api/tenants/{id}:
 *   delete:
 *     tags: [Tenants]
 *     summary: Desactivar tenant (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tenant
 *     responses:
 *       200:
 *         description: Tenant desactivado
 *       404:
 *         description: Tenant no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.delete('/:id', authenticateToken, requireAdmin, tenantController.deleteTenant);

module.exports = router;

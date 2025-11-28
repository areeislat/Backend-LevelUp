const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, admin]
 *         description: Filtrar por rol
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
 *         description: Lista de usuarios obtenida exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.get('/', authenticateToken, requireAdmin, userController.getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.get('/:id', authenticateToken, requireAdmin, userController.getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear nuevo usuario (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *               - name
 *               - email
 *               - password
 *             properties:
 *               tenantId:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, admin]
 *                 default: customer
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       409:
 *         description: El email ya está registrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.post('/', authenticateToken, requireAdmin, userController.createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, admin]
 *               isActive:
 *                 type: boolean
 *               phone:
 *                 type: string
 *               addresses:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El email ya está en uso
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.put('/:id', authenticateToken, requireAdmin, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Desactivar usuario (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario desactivado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

/**
 * @swagger
 * /api/users/{id}/change-password:
 *   post:
 *     summary: Cambiar contraseña de usuario (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       401:
 *         description: Contraseña actual incorrecta
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/:id/change-password', authenticateToken, requireAdmin, userController.changePassword);

module.exports = router;

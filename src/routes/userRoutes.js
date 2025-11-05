const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const { extractTenant, validateTenantUser } = require('../middlewares/tenant');

/**
 * Rutas de Usuarios
 * Todas las rutas requieren autenticación y rol de admin
 */

// Aplicar middlewares a todas las rutas
router.use(extractTenant);
router.use(authenticate);
router.use(validateTenantUser);
router.use(authorize('admin'));

// Obtener todos los usuarios
router.get('/', getAllUsers);

// Obtener un usuario por ID
router.get('/:id', getUserById);

// Actualizar un usuario
router.put('/:id', updateUser);

// Eliminar un usuario
router.delete('/:id', deleteUser);

module.exports = router;


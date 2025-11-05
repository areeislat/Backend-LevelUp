const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { extractTenant } = require('../middlewares/tenant');
const { validate, registerValidator, loginValidator } = require('../utils/validators');

/**
 * Rutas de Autenticación
 * Todas las rutas requieren x-tenant-id header
 */

// Registro de nuevo usuario
router.post(
  '/register',
  extractTenant,
  validate(registerValidator),
  register
);

// Login
router.post(
  '/login',
  extractTenant,
  validate(loginValidator),
  login
);

// Obtener perfil del usuario autenticado
router.get(
  '/profile',
  extractTenant,
  authenticate,
  getProfile
);

// Actualizar perfil del usuario autenticado
router.put(
  '/profile',
  extractTenant,
  authenticate,
  updateProfile
);

module.exports = router;


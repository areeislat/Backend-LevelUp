const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getCategories
} = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/auth');
const { extractTenant, validateTenantUser } = require('../middlewares/tenant');
const { validate, createProductValidator } = require('../utils/validators');

/**
 * Rutas de Productos
 * Todas las rutas requieren x-tenant-id
 * Algunas requieren autenticación y rol de admin
 */

// Rutas públicas (solo requieren tenant)
router.get(
  '/',
  extractTenant,
  getAllProducts
);

router.get(
  '/categories',
  extractTenant,
  getCategories
);

router.get(
  '/slug/:slug',
  extractTenant,
  getProductBySlug
);

router.get(
  '/:id',
  extractTenant,
  getProductById
);

// Rutas protegidas (requieren autenticación y rol de admin)
router.post(
  '/',
  extractTenant,
  authenticate,
  validateTenantUser,
  authorize('admin'),
  validate(createProductValidator),
  createProduct
);

router.put(
  '/:id',
  extractTenant,
  authenticate,
  validateTenantUser,
  authorize('admin'),
  updateProduct
);

router.delete(
  '/:id',
  extractTenant,
  authenticate,
  validateTenantUser,
  authorize('admin'),
  deleteProduct
);

module.exports = router;


const express = require('express');
const router = express.Router();
const {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant
} = require('../controllers/tenantController');
const { validate, createTenantValidator } = require('../utils/validators');

/**
 * Rutas de Tenants
 * Nota: Estas rutas no requieren x-tenant-id ya que son para gestionar tenants
 */

// Crear un nuevo tenant
router.post('/', validate(createTenantValidator), createTenant);

// Obtener todos los tenants
router.get('/', getAllTenants);

// Obtener un tenant por ID
router.get('/:id', getTenantById);

// Actualizar un tenant
router.put('/:id', updateTenant);

// Eliminar un tenant
router.delete('/:id', deleteTenant);

module.exports = router;


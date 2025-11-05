const Tenant = require('../models/Tenant');
const { UnauthorizedError } = require('../utils/errors');

/**
 * Middleware para extraer y validar el tenantId del header
 * Este middleware debe ejecutarse después de authenticate (cuando aplique)
 */
const extractTenant = async (req, res, next) => {
  try {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      throw new UnauthorizedError('Header x-tenant-id es requerido');
    }

    // Verificar que el tenant existe y está activo
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      throw new UnauthorizedError('Tenant no encontrado');
    }

    if (tenant.status !== 'active') {
      throw new UnauthorizedError('Tenant inactivo');
    }

    // Adjuntar tenantId al request
    req.tenantId = tenantId;
    req.tenant = tenant;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para validar que el usuario pertenece al tenant
 * Debe ejecutarse después de authenticate y extractTenant
 */
const validateTenantUser = (req, res, next) => {
  try {
    if (!req.user || !req.tenantId) {
      throw new UnauthorizedError('Autenticación y tenant requeridos');
    }

    // Verificar que el tenantId del usuario coincida con el del header
    if (req.user.tenantId.toString() !== req.tenantId.toString()) {
      throw new UnauthorizedError('Usuario no pertenece al tenant especificado');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  extractTenant,
  validateTenantUser
};


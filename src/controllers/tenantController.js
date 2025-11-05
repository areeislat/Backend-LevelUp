const Tenant = require('../models/Tenant');
const { NotFoundError, ConflictError } = require('../utils/errors');

/**
 * Crear un nuevo tenant
 */
const createTenant = async (req, res, next) => {
  try {
    const { name, slug, email, domain } = req.body;

    // Verificar si el slug o email ya existen
    const existingTenant = await Tenant.findOne({
      $or: [{ slug }, { email }]
    });

    if (existingTenant) {
      throw new ConflictError('El slug o email ya están en uso');
    }

    const tenant = await Tenant.create({
      name,
      slug,
      email,
      domain
    });

    res.status(201).json({
      success: true,
      message: 'Tenant creado exitosamente',
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los tenants
 */
const getAllTenants = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const tenants = await Tenant.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Tenant.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tenants,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un tenant por ID
 */
const getTenantById = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      throw new NotFoundError('Tenant no encontrado');
    }

    res.status(200).json({
      success: true,
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un tenant
 */
const updateTenant = async (req, res, next) => {
  try {
    const { name, domain, status, settings } = req.body;

    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      throw new NotFoundError('Tenant no encontrado');
    }

    // Actualizar campos permitidos
    if (name) tenant.name = name;
    if (domain) tenant.domain = domain;
    if (status) tenant.status = status;
    if (settings) tenant.settings = { ...tenant.settings, ...settings };

    await tenant.save();

    res.status(200).json({
      success: true,
      message: 'Tenant actualizado exitosamente',
      data: tenant
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un tenant (soft delete - cambiar status a inactive)
 */
const deleteTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id);

    if (!tenant) {
      throw new NotFoundError('Tenant no encontrado');
    }

    tenant.status = 'inactive';
    await tenant.save();

    res.status(200).json({
      success: true,
      message: 'Tenant desactivado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTenant,
  getAllTenants,
  getTenantById,
  updateTenant,
  deleteTenant
};


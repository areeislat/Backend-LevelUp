const Tenant = require('../models/Tenant');
const User = require('../models/auth/User');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Obtener todos los tenants
 * GET /api/tenants
 */
const getTenants = async (req, res, next) => {
  try {
    const { active, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (active !== undefined) filter.isActive = active === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [tenants, total] = await Promise.all([
      Tenant.find(filter)
        .select('-__v')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Tenant.countDocuments(filter)
    ]);

    res.json({
      message: 'Tenants obtenidos exitosamente',
      statusCode: 200,
      data: {
        tenants,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener tenant por ID
 * GET /api/tenants/:id
 */
const getTenantById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findById(id);

    if (!tenant) {
      throw new NotFoundError('Tenant no encontrado');
    }

    res.json({
      message: 'Tenant obtenido exitosamente',
      statusCode: 200,
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nuevo tenant
 * POST /api/tenants
 */
const createTenant = async (req, res, next) => {
  try {
    const { name, slug, adminName, adminEmail, adminPassword } = req.body;

    // Validar campos requeridos
    if (!name || !slug) {
      return res.status(400).json({
        message: 'Faltan campos requeridos: name, slug',
        statusCode: 400
      });
    }

    // Verificar que el slug no exista
    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
      return res.status(409).json({
        message: 'El slug ya está en uso',
        statusCode: 409
      });
    }

    // Crear tenant
    const tenant = await Tenant.create({
      name,
      slug,
      isActive: true
    });

    // Opcionalmente crear admin inicial si se proporcionan credenciales
    let admin = null;
    if (adminName && adminEmail && adminPassword) {
      admin = await User.create({
        tenantId: tenant._id,
        name: adminName,
        email: adminEmail,
        password: adminPassword, // Se hashea automáticamente
        role: 'admin',
        isActive: true
      });
    }

    const response = {
      message: 'Tenant creado exitosamente',
      statusCode: 201,
      data: {
        tenant: {
          id: tenant._id,
          name: tenant.name,
          slug: tenant.slug,
          isActive: tenant.isActive,
          createdAt: tenant.createdAt
        }
      }
    };

    // Agregar admin si fue creado
    if (admin) {
      response.data.admin = {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      };
    }

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar tenant
 * PUT /api/tenants/:id
 */
const updateTenant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, isActive } = req.body;

    // Si se actualiza el slug, verificar que no exista
    if (slug) {
      const existingTenant = await Tenant.findOne({ slug, _id: { $ne: id } });
      if (existingTenant) {
        return res.status(409).json({
          message: 'El slug ya está en uso',
          statusCode: 409
        });
      }
    }

    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { name, slug, isActive },
      { new: true, runValidators: true }
    );

    if (!tenant) {
      throw new NotFoundError('Tenant no encontrado');
    }

    res.json({
      message: 'Tenant actualizado exitosamente',
      statusCode: 200,
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Desactivar tenant
 * DELETE /api/tenants/:id
 */
const deleteTenant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!tenant) {
      throw new NotFoundError('Tenant no encontrado');
    }

    res.json({
      message: 'Tenant desactivado exitosamente',
      statusCode: 200,
      data: { tenant }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant
};

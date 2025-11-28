const User = require('../models/auth/User');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Obtener todos los usuarios
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, active, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (active !== undefined) filter.isActive = active === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      message: 'Usuarios obtenidos exitosamente',
      statusCode: 200,
      data: {
        users,
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
 * Obtener usuario por ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    res.json({
      message: 'Usuario obtenido exitosamente',
      statusCode: 200,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear usuario
 * POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { tenantId, name, email, password, role } = req.body;

    // Validar campos requeridos
    if (!tenantId || !name || !email || !password) {
      return res.status(400).json({
        message: 'Faltan campos requeridos: tenantId, name, email, password',
        statusCode: 400
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ tenantId, email });
    if (existingUser) {
      return res.status(409).json({
        message: 'El email ya está registrado en este tenant',
        statusCode: 409
      });
    }

    const user = await User.create({
      tenantId,
      name,
      email,
      password,
      role: role || 'customer',
      isActive: true
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      statusCode: 201,
      data: { user: userResponse }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar usuario
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, phone, addresses } = req.body;

    const user = await User.findById(id);

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Si se actualiza el email, verificar que no exista
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        tenantId: user.tenantId, 
        email, 
        _id: { $ne: id } 
      });
      
      if (existingUser) {
        return res.status(409).json({
          message: 'El email ya está en uso',
          statusCode: 409
        });
      }
      user.email = email;
    }

    // Actualizar campos
    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (phone) user.phone = phone;
    if (addresses) user.addresses = addresses;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Usuario actualizado exitosamente',
      statusCode: 200,
      data: { user: userResponse }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Desactivar usuario
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    res.json({
      message: 'Usuario desactivado exitosamente',
      statusCode: 200,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cambiar contraseña de usuario
 * POST /api/users/:id/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Faltan campos requeridos: currentPassword, newPassword',
        statusCode: 400
      });
    }

    const user = await User.findById(id).select('+password');

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Contraseña actual incorrecta',
        statusCode: 401
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Contraseña actualizada exitosamente',
      statusCode: 200
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword
};

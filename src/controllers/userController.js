const User = require('../models/User');
const { NotFoundError } = require('../utils/errors');

/**
 * Obtener todos los usuarios del tenant (solo admin)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, page = 1, limit = 10 } = req.query;
    const tenantId = req.tenantId;

    const filter = { tenantId };
    
    if (role) {
      filter.role = role;
    }
    
    if (status) {
      filter.status = status;
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
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
 * Obtener un usuario por ID (solo admin)
 */
const getUserById = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const user = await User.findOne({
      _id: req.params.id,
      tenantId
    }).select('-password');

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un usuario (solo admin)
 */
const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, role, status } = req.body;
    const tenantId = req.tenantId;

    const user = await User.findOne({
      _id: req.params.id,
      tenantId
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    // Actualizar campos
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un usuario (solo admin - soft delete)
 */
const deleteUser = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const user = await User.findOne({
      _id: req.params.id,
      tenantId
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    user.status = 'inactive';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Usuario desactivado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};


const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { UnauthorizedError, ConflictError } = require('../utils/errors');

/**
 * Registro de nuevo usuario
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    const tenantId = req.tenantId;

    // Verificar si el usuario ya existe en este tenant
    const existingUser = await User.findOne({ tenantId, email });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado en este tenant');
    }

    // Crear usuario
    const user = await User.create({
      tenantId,
      email,
      password,
      firstName,
      lastName,
      phone,
      role: role || 'customer'
    });

    // Generar token
    const token = generateToken({
      userId: user._id,
      tenantId: user.tenantId,
      role: user.role
    });

    // Remover password de la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login de usuario
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const tenantId = req.tenantId;

    // Buscar usuario (incluir password)
    const user = await User.findOne({ tenantId, email }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Verificar status del usuario
    if (user.status !== 'active') {
      throw new UnauthorizedError('Usuario inactivo');
    }

    // Generar token
    const token = generateToken({
      userId: user._id,
      tenantId: user.tenantId,
      role: user.role
    });

    // Remover password de la respuesta
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
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
 * Actualizar perfil del usuario autenticado
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    // Actualizar campos permitidos
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};


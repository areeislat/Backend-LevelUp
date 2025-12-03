const User = require('../models/auth/User');
const LoyaltyAccount = require('../models/loyalty/LoyaltyAccount');
const { generateToken } = require('../utils/jwt');

// ✅ REGISTER CORREGIDO
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Faltan campos requeridos: name, email, password',
        statusCode: 400
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'El email ya está registrado en este tenant',
        statusCode: 409
      });
    }

    const user = await User.create({
      nombre: name,
      email,
      password,
      role: role || 'user',
      isActive: true
    });

    await LoyaltyAccount.create({
      user: user._id,
      points: 1000, // 1000 Puntos de regalo
      tier: 'bronze'
    });

    const token = generateToken({
      userId: user._id,
      role: user.role,
      email: user.email
    });

    const userResponse = {
      id: user._id,
      name: user.nombre,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      statusCode: 201,
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errors: error.errors
      });
    }
    next(error);
  }
};

// ✅ LOGIN (ESTE YA ESTABA BIEN)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Faltan campos requeridos: email, password',
        statusCode: 400
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
        statusCode: 401
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Usuario inactivo',
        statusCode: 403
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Credenciales inválidas',
        statusCode: 401
      });
    }

    const token = generateToken({
      userId: user._id,
      role: user.role,
      email: user.email
    });

    const userResponse = {
      id: user._id,
      name: user.nombre,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };

    res.status(200).json({
      message: 'Login exitoso',
      statusCode: 200,
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errors: error.errors
      });
    }
    next(error);
  }
};

// ✅ PERFIL
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        statusCode: 404
      });
    }

    res.json({
      message: 'Perfil obtenido exitosamente',
      statusCode: 200,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// ✅ UPDATE PERFIL CORREGIDO (name → nombre)
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, addresses, preferences } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
        statusCode: 404
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(409).json({
          message: 'El email ya está en uso',
          statusCode: 409
        });
      }
      user.email = email;
    }

    if (name) user.nombre = name; // ✅ CORREGIDO
    if (phone) user.phone = phone;
    if (addresses) user.addresses = addresses;
    if (preferences) user.preferences = preferences;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Perfil actualizado exitosamente',
      statusCode: 200,
      data: { user: userResponse }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errors: error.errors
      });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};

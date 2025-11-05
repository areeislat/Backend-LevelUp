const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const User = require('../models/User');

/**
 * Middleware de autenticación JWT
 * Verifica que el usuario esté autenticado
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No se proporcionó token de autenticación');
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = verifyToken(token);

    // Buscar usuario
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      throw new UnauthorizedError('Usuario no encontrado');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('Usuario inactivo');
    }

    // Adjuntar usuario y tenantId al request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar roles
 * @param  {...String} allowedRoles - Roles permitidos
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Usuario no autenticado'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('No tienes permisos para realizar esta acción'));
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};


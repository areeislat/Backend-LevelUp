const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Middleware de autenticación JWT
 * Verifica el token y extrae información del usuario
 */
const authenticate = (req, res, next) => {
  try {
    // 1. Leer el header Authorization
    const authHeader = req.headers.authorization;

    // 2. Verificar que existe y tiene el formato correcto
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Token de autenticación no proporcionado',
        statusCode: 401
      });
    }

    // 3. Extraer el token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Token de autenticación no proporcionado',
        statusCode: 401
      });
    }

    // 4. Verificar el token con JWT_SECRET
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // 5. Extraer datos del usuario del token
    // El token debe contener: userId, role, email
    if (!decoded.userId || !decoded.role || !decoded.email) {
      return res.status(401).json({
        message: 'Token inválido: faltan datos del usuario',
        statusCode: 401
      });
    }

    // 6. Guardar información del usuario en req.user
    req.user = {
      _id: decoded.userId,
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email
    };

    next();
  } catch (error) {
    // Manejar errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Token inválido',
        statusCode: 401
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expirado',
        statusCode: 401
      });
    }

    next(error);
  }
};

/**
 * Middleware de autenticación opcional
 * Si hay un token válido, identifica al usuario.
 * Si no hay token o es inválido, continúa como invitado sin error.
 */
const optionalAuthenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Si hay header y formato correcto, intentamos verificar
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        // Verificar el token
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Si el token es válido, guardamos el usuario
        if (decoded.userId) {
          req.user = {
            _id: decoded.userId,
            userId: decoded.userId,
            role: decoded.role,
            email: decoded.email
          };
        }
      }
    }
    // Siempre continuamos, haya usuario o no (req.user será undefined si no hay token válido)
    next();
  } catch (error) {
    // Si el token expira o es inválido, simplemente ignoramos el error
    // y dejamos que el usuario continúe como invitado
    next();
  }
};

/**
 * Middleware helper de autorización por rol
 * Verifica que el usuario tenga uno de los roles permitidos
 * * @param {...string} rolesPermitidos - Lista de roles permitidos
 * @returns {Function} Middleware de Express
 */
const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuario no autenticado',
        statusCode: 401
      });
    }

    // Verificar que el rol del usuario esté en los roles permitidos
    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
        statusCode: 403
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireRole,
  authenticateToken: authenticate, // Alias para compatibilidad
  requireAdmin: requireRole('admin') // Helper para admin
};
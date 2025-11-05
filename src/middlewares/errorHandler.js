const config = require('../config/env');

/**
 * Middleware de manejo centralizado de errores
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = 'Errores de validación';
    
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }

  // Error de casting de Mongoose (ID inválido)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `ID inválido: ${err.value}`;
  }

  // Error de duplicado (clave única)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `El ${field} ya existe`;
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Log del error (solo en desarrollo)
  if (config.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Respuesta de error
  const response = {
    success: false,
    message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;


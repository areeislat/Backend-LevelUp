require('dotenv').config();

/**
 * Configuración centralizada de variables de entorno
 */
module.exports = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://marpalmal:awNRTG1Ur8gt3t6H@proyecto.qbt3om8.mongodb.net/LevelUP?retryWrites=true&w=majority&authSource=admin&appName=proyecto',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};


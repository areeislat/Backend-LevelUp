const mongoose = require('mongoose');
const config = require('./env');

/**
 * Conecta a la base de datos MongoDB
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      // Opciones recomendadas para MongoDB con timeouts extendidos para Cloud Run
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // 30 segundos
      connectTimeoutMS: 30000, // 30 segundos
      socketTimeoutMS: 45000,
      family: 4 // Forzar IPv4
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);

    // Manejo de eventos de la conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });

  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    console.warn('⚠️  El servidor continuará sin conexión a MongoDB');
    // No hacer process.exit() para permitir que el servidor siga corriendo
    // Esto permite que CORS y otros endpoints funcionen aunque MongoDB falle
  }
};

module.exports = connectDB;


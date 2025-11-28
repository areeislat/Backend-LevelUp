const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  token: { 
    type: String, 
    required: true,
    unique: true
  },
  refreshToken: { 
    type: String,
    unique: true,
    sparse: true
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: true
  },
  
  // Información del dispositivo
  deviceInfo: {
    userAgent: String,
    browser: String,
    os: String,
    device: String
  },
  ipAddress: String,
  
  // Estado
  isValid: { 
    type: Boolean, 
    default: true 
  },
  revokedAt: Date,
  revokedReason: String

}, { 
  timestamps: true 
});

// Índice compuesto para limpieza
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ user: 1, isValid: 1 });

// Static: invalidar todas las sesiones de un usuario
SessionSchema.statics.revokeAllUserSessions = async function(userId, reason = 'Manual revocation') {
  return this.updateMany(
    { user: userId, isValid: true },
    { 
      isValid: false, 
      revokedAt: new Date(),
      revokedReason: reason
    }
  );
};

// Static: limpiar sesiones expiradas
SessionSchema.statics.cleanExpired = async function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

// Método: revocar sesión
SessionSchema. methods.revoke = async function(reason = 'Manual revocation') {
  this.isValid = false;
  this. revokedAt = new Date();
  this.revokedReason = reason;
  return this.save();
};

module.exports = mongoose.model('Session', SessionSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
  alias: { 
    type: String, 
    default: 'Casa' 
  },
  direccion: { 
    type: String, 
    required: true 
  },
  comuna: { 
    type: String, 
    required: true 
  },
  region: { 
    type: String, 
    required: true 
  },
  codigoPostal: String,
  isDefault: { 
    type: Boolean, 
    default: false 
  }
}, { _id: true });

const PreferencesSchema = new mongoose.Schema({
  language: { 
    type: String, 
    enum: ['es', 'en'], 
    default: 'es' 
  },
  currency: { 
    type: String, 
    enum: ['CLP', 'USD'], 
    default: 'CLP' 
  },
  emailNotifications: { 
    type: Boolean, 
    default: true 
  },
  pushNotifications: { 
    type: Boolean, 
    default: true 
  },
  newsletter: { 
    type: Boolean, 
    default: false 
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  // Información básica
  nombre: { 
    type: String, 
    required: [true, 'El nombre es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  apellidos: { 
    type: String,
    trim: true,
    maxlength: [50, 'Los apellidos no pueden exceder 50 caracteres']
  },
  email: { 
    type: String, 
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido']
  },
  password: { 
    type: String, 
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false // No incluir en queries por defecto
  },
  telefono: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: '/img/default-avatar.png'
  },

  // Rol y permisos
  role: { 
    type: String, 
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },

  // Direcciones
  addresses: [AddressSchema],

  // Preferencias
  preferences: {
    type: PreferencesSchema,
    default: () => ({})
  },

  // Estado de la cuenta
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isEmailVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Recuperación de contraseña
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Tracking
  lastLogin: Date,
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: Date

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual: nombre completo
UserSchema.virtual('nombreCompleto'). get(function() {
  return this.apellidos 
    ? `${this.nombre} ${this.apellidos}` 
    : this.nombre;
});

// Virtual: cuenta bloqueada
UserSchema.virtual('isLocked').get(function() {
  return ! !(this.lockUntil && this.lockUntil > Date. now());
});

// Pre-save: encriptar contraseña
UserSchema.pre('save', async function(next) {
  if (! this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método: comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método: incrementar intentos de login fallidos
UserSchema.methods.incLoginAttempts = async function() {
  // Si el bloqueo expiró, resetear
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  // Bloquear después de 5 intentos fallidos (30 minutos)
  if (this.loginAttempts + 1 >= 5 && ! this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 30 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Método: obtener dirección por defecto
UserSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

// Static: buscar por email
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email. toLowerCase() });
};

module.exports = mongoose.model('User', UserSchema);
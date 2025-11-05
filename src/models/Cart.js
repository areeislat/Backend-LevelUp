const mongoose = require('mongoose');

/**
 * Modelo de Carrito de Compras
 * Carrito persistente por usuario
 */
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'El precio no puede ser negativo']
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'El tenantId es requerido'],
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  items: [cartItemSchema],
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Índice compuesto: un usuario solo puede tener un carrito activo por tenant
cartSchema.index({ tenantId: 1, user: 1, status: 1 });

// Virtual para calcular el subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Virtual para calcular el total de items
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});

// Método para añadir un producto al carrito
cartSchema.methods.addItem = function(productId, quantity, price) {
  const existingItem = this.items.find(
    item => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity, price });
  }

  return this.save();
};

// Método para actualizar cantidad de un producto
cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString()
  );

  if (!item) {
    throw new Error('Producto no encontrado en el carrito');
  }

  if (quantity <= 0) {
    this.items = this.items.filter(
      item => item.product.toString() !== productId.toString()
    );
  } else {
    item.quantity = quantity;
  }

  return this.save();
};

// Método para eliminar un producto del carrito
cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Método para vaciar el carrito
cartSchema.methods.clear = function() {
  this.items = [];
  return this.save();
};

// Incluir virtuals en JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);


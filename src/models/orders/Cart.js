const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true
  },
  productId: String, // ID personalizado del producto
  name: String,
  image: String,
  price: { 
    type: Number, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: [1, 'La cantidad mínima es 1'],
    max: [99, 'La cantidad máxima es 99']
  },
  subtotal: Number,
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save del item: calcular subtotal
CartItemSchema. pre('save', function(next) {
  this.subtotal = this.price * this.quantity;
  next();
});

const CartSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types. ObjectId, 
    ref: 'User',
    index: true
  },
  sessionId: { // Para usuarios no autenticados
    type: String,
    index: true,
    sparse: true
  },
  
  items: [CartItemSchema],
  
  // Totales
  subtotal: { 
    type: Number, 
    default: 0 
  },
  tax: { 
    type: Number, 
    default: 0 
  },
  shippingCost: { 
    type: Number, 
    default: 0 
  },
  discount: { 
    type: Number, 
    default: 0 
  },
  total: { 
    type: Number, 
    default: 0 
  },
  
  // Cupón aplicado
  coupon: {
    code: String,
    discountType: { type: String, enum: ['percentage', 'fixed'] },
    discountValue: Number
  },
  
  // Puntos de lealtad a usar
  loyaltyPointsToUse: {
    type: Number,
    default: 0
  },
  
  // Moneda
  currency: { 
    type: String, 
    default: 'CLP' 
  },
  
  // Expiración (para carritos abandonados)
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
  }

}, { 
  timestamps: true 
});

// Índice para limpiar carritos expirados
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save: calcular totales
CartSchema.pre('save', function(next) {
  // Calcular subtotal
  this.subtotal = this.items. reduce((sum, item) => {
    return sum + (item. price * item.quantity);
  }, 0);
  
  // Calcular descuento por cupón
  if (this. coupon && this.coupon.code) {
    if (this.coupon.discountType === 'percentage') {
      this.discount = Math.round(this.subtotal * this.coupon.discountValue / 100);
    } else {
      this.discount = this.coupon.discountValue;
    }
  }
  
  // Calcular total
  this.total = this. subtotal + this.tax + this.shippingCost - this.discount;
  this.total = Math.max(0, this.total); // No puede ser negativo
  
  next();
});

// Método: agregar item
CartSchema.methods.addItem = async function(productData, quantity = 1) {
  const existingItem = this.items.find(
    item => item.product.toString() === productData._id.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.subtotal = existingItem.price * existingItem.quantity;
  } else {
    this. items.push({
      product: productData._id,
      productId: productData.productId,
      name: productData.name,
      image: productData.image,
      price: productData.price,
      quantity
    });
  }
  
  return this.save();
};

// Método: actualizar cantidad
CartSchema.methods.updateQuantity = async function(productId, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString()
  );
  
  if (! item) {
    throw new Error('Producto no encontrado en el carrito');
  }
  
  if (quantity <= 0) {
    return this.removeItem(productId);
  }
  
  item.quantity = quantity;
  item.subtotal = item.price * quantity;
  
  return this. save();
};

// Método: remover item
CartSchema.methods. removeItem = async function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
  return this.save();
};

// Método: aplicar cupón
CartSchema.methods.applyCoupon = async function(code, discountType, discountValue) {
  this.coupon = { code, discountType, discountValue };
  return this.save();
};

// Método: remover cupón
CartSchema.methods.removeCoupon = async function() {
  this.coupon = undefined;
  this.discount = 0;
  return this.save();
};

// Método: vaciar carrito
CartSchema.methods.clear = async function() {
  this.items = [];
  this. coupon = undefined;
  this. discount = 0;
  this.loyaltyPointsToUse = 0;
  return this.save();
};

// Método: obtener cantidad total de items
CartSchema.methods.getItemCount = function() {
  return this.items.reduce((sum, item) => sum + item. quantity, 0);
};

// Static: obtener o crear carrito
CartSchema.statics.getOrCreate = async function(userId, sessionId) {
  let cart;
  
  if (userId) {
    cart = await this.findOne({ user: userId });
    
    // Si hay un carrito de sesión, fusionarlo
    if (! cart && sessionId) {
      cart = await this.findOne({ sessionId });
      if (cart) {
        cart.user = userId;
        cart.sessionId = undefined;
        await cart.save();
      }
    }
  } else if (sessionId) {
    cart = await this.findOne({ sessionId });
  }
  
  if (!cart) {
    cart = new this(userId ?  { user: userId } : { sessionId });
    await cart.save();
  }
  
  return cart;
};

// Static: fusionar carrito de sesión con carrito de usuario
CartSchema.statics. mergeCarts = async function(userId, sessionId) {
  const [userCart, sessionCart] = await Promise.all([
    this.findOne({ user: userId }),
    this.findOne({ sessionId })
  ]);
  
  if (! sessionCart) return userCart;
  if (!userCart) {
    sessionCart.user = userId;
    sessionCart. sessionId = undefined;
    return sessionCart.save();
  }
  
  // Fusionar items
  for (const sessionItem of sessionCart.items) {
    const existingItem = userCart.items. find(
      item => item. product.toString() === sessionItem. product.toString()
    );
    
    if (existingItem) {
      existingItem. quantity += sessionItem.quantity;
    } else {
      userCart. items.push(sessionItem);
    }
  }
  
  await sessionCart.deleteOne();
  return userCart. save();
};

module.exports = mongoose.model('Cart', CartSchema);
const mongoose = require('mongoose');

// Sub-esquema para historial de stock
const StockHistorySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['restock', 'sale', 'return', 'adjustment', 'reservation', 'release'],
    required: true
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  previousStock: Number,
  newStock: Number,
  reason: String,
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order' 
  },
  performedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

// Sub-esquema para especificaciones
const SpecificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  // Identificador personalizado (como en tu frontend)
  productId: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  
  // Información básica
  name: { 
    type: String, 
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder 200 caracteres']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  brand: { 
    type: String, 
    required: [true, 'La marca es requerida'],
    trim: true
  },
  
  // Precios
  price: { 
    type: Number, 
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  oldPrice: { 
    type: Number,
    default: null
  },
  costPrice: { // Precio de costo (admin)
    type: Number,
    select: false
  },
  
  // Categoría
  category: { 
    type: String, 
    required: [true, 'La categoría es requerida'],
    index: true
  },
  subcategory: String,
  tags: [{ type: String, lowercase: true }],
  
  // Imágenes
  image: { 
    type: String, 
    required: [true, 'La imagen principal es requerida']
  },
  images: [String], // Galería adicional
  
  // Stock e Inventario
  stock: {
    current: { 
      type: Number, 
      required: true,
      default: 0,
      min: 0
    },
    reserved: { 
      type: Number, 
      default: 0,
      min: 0
    },
    minLevel: { 
      type: Number, 
      default: 5 
    },
    maxLevel: { 
      type: Number, 
      default: 100 
    },
    reorderPoint: { 
      type: Number, 
      default: 10 
    },
    lastRestocked: Date
  },
  stockHistory: [StockHistorySchema],
  
  // Calificación
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: { 
    type: Number, 
    default: 0 
  },
  
  // Especificaciones técnicas
  specifications: [SpecificationSchema],
  
  // Estado
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  isNewArrival: { 
    type: Boolean, 
    default: false 
  },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  
  // Auditoría
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
// slug y productId ya tienen índice por unique: true
ProductSchema.index({ name: 'text', brand: 'text', description: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ 'stock.current': 1 });

// Virtual: stock disponible
ProductSchema.virtual('availableStock'). get(function() {
  return Math.max(0, this.stock.current - this.stock.reserved);
});

// Virtual: tiene descuento
ProductSchema.virtual('hasDiscount').get(function() {
  return this.oldPrice && this.oldPrice > this.price;
});

// Virtual: porcentaje de descuento
ProductSchema.virtual('discountPercent').get(function() {
  if (!this.hasDiscount) return 0;
  return Math.round((1 - this.price / this.oldPrice) * 100);
});

// Virtual: está en stock
ProductSchema.virtual('inStock').get(function() {
  return this.availableStock > 0;
});

// Virtual: stock bajo
ProductSchema.virtual('lowStock').get(function() {
  return this.stock.current <= this.stock.minLevel && this.stock.current > 0;
});

// Pre-save: generar slug
ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Método: reservar stock
ProductSchema.methods. reserveStock = async function(quantity, orderId, userId) {
  if (this.availableStock < quantity) {
    throw new Error('Stock insuficiente');
  }
  
  const previousStock = this.stock.current;
  this.stock.reserved += quantity;
  
  this.stockHistory.push({
    type: 'reservation',
    quantity: -quantity,
    previousStock,
    newStock: this.availableStock,
    orderId,
    performedBy: userId
  });
  
  return this.save();
};

// Método: liberar reserva de stock
ProductSchema.methods.releaseStock = async function(quantity, orderId, userId) {
  const previousStock = this.stock.current;
  this.stock.reserved = Math.max(0, this. stock.reserved - quantity);
  
  this.stockHistory.push({
    type: 'release',
    quantity,
    previousStock,
    newStock: this.availableStock,
    orderId,
    performedBy: userId
  });
  
  return this.save();
};

// Método: confirmar venta (reducir stock real)
ProductSchema.methods.confirmSale = async function(quantity, orderId, userId) {
  const previousStock = this.stock.current;
  this.stock.current -= quantity;
  this.stock.reserved = Math.max(0, this.stock.reserved - quantity);
  
  this.stockHistory.push({
    type: 'sale',
    quantity: -quantity,
    previousStock,
    newStock: this.stock.current,
    orderId,
    performedBy: userId
  });
  
  return this.save();
};

// Método: agregar stock
ProductSchema.methods.addStock = async function(quantity, reason, userId) {
  const previousStock = this.stock.current;
  this.stock.current += quantity;
  this.stock.lastRestocked = new Date();
  
  this.stockHistory.push({
    type: 'restock',
    quantity,
    previousStock,
    newStock: this.stock.current,
    reason,
    performedBy: userId
  });
  return this.save();
};
//

// Static: buscar productos
ProductSchema.statics.search = async function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    inStock,
    sortBy = 'createdAt',
    sortOrder = -1,
    page = 1,
    limit = 12
  } = options;
  //Cambio de filter para incluir solo productos activos
  const filter = { isActive: true };
  
  if (query) {
    filter.$text = { $search: query };
  }
  if (category && category !== 'todo') {
    filter.category = category;
  }
  if (minPrice !== undefined) {
    filter.price = { ... filter.price, $gte: minPrice };
  }
  if (maxPrice !== undefined) {
    filter.price = { ... filter.price, $lte: maxPrice };
  }
  if (inStock) {
    filter['stock.current'] = { $gt: 0 };
  }
  
  const sort = { [sortBy]: sortOrder };
  const skip = (page - 1) * limit;
  
  const [products, total] = await Promise.all([
    this.find(filter).sort(sort).skip(skip).limit(limit),
    this.countDocuments(filter)
  ]);
  
  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static: obtener productos con stock bajo
ProductSchema.statics.getLowStockProducts = function() {
  return this.find({
    isActive: true,
    $expr: { $lte: ['$stock.current', '$stock.minLevel'] }
  }). sort({ 'stock.current': 1 });
};

module.exports = mongoose.model('Product', ProductSchema);
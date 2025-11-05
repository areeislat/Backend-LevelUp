const mongoose = require('mongoose');

/**
 * Modelo de Producto
 * Los productos pertenecen a un tenant específico
 */
const productSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'El tenantId es requerido'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'El slug es requerido'],
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  comparePrice: {
    type: Number,
    min: [0, 'El precio de comparación no puede ser negativo']
  },
  sku: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  inventory: {
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'La cantidad no puede ser negativa']
    },
    trackInventory: {
      type: Boolean,
      default: true
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    }
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
productSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, status: 1 });
productSchema.index({ tenantId: 1, featured: 1 });

// Virtual para verificar si está en stock
productSchema.virtual('inStock').get(function() {
  return this.inventory.quantity > 0;
});

// Virtual para verificar si está en bajo stock
productSchema.virtual('isLowStock').get(function() {
  return this.inventory.trackInventory && 
         this.inventory.quantity <= this.inventory.lowStockThreshold;
});

// Incluir virtuals en JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);


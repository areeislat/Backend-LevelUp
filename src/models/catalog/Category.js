const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'El nombre de categoría es requerido'],
    trim: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  icon: {
    type: String,
    default: '🏷️'
  },
  image: String,
  
  // Jerarquía
  parent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    default: null
  },
  
  // Configuración
  displayOrder: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  
  // SEO
  metaTitle: String,
  metaDescription: String

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });
CategorySchema.index({ displayOrder: 1 });

// Virtual: subcategorías
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual: productos en esta categoría
CategorySchema.virtual('products', {
  ref: 'Product',
  localField: 'slug',
  foreignField: 'category'
});

// Pre-save: generar slug
CategorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      . replace(/(^-|-$)/g, '');
  }
  next();
});

// Static: obtener árbol de categorías
CategorySchema. statics.getTree = async function() {
  const categories = await this.find({ isActive: true }). sort('displayOrder');
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => String(cat.parent) === String(parentId))
      .map(cat => ({
        ... cat. toObject(),
        children: buildTree(cat._id)
      }));
  };
  
  return buildTree(null);
};

module.exports = mongoose.model('Category', CategorySchema);
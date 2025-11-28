const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: { 
    type: mongoose. Schema.Types.ObjectId, 
    ref: 'Product',
    required: true,
    index: true
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order'
  },
  
  // Contenido
  rating: { 
    type: Number, 
    required: [true, 'La calificación es requerida'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  comment: { 
    type: String,
    required: [true, 'El comentario es requerido'],
    trim: true,
    maxlength: [1000, 'El comentario no puede exceder 1000 caracteres']
  },
  
  // Pros y contras
  pros: [String],
  cons: [String],
  
  // Imágenes adjuntas
  images: [String],
  
  // Validación
  isVerifiedPurchase: { 
    type: Boolean, 
    default: false 
  },
  isApproved: { 
    type: Boolean, 
    default: true 
  },
  
  // Interacción
  helpfulCount: { 
    type: Number, 
    default: 0 
  },
  helpfulBy: [{ 
    type: mongoose. Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  
  // Respuesta del vendedor
  sellerResponse: {
    comment: String,
    respondedAt: Date,
    respondedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  
  // Moderación
  reportCount: { 
    type: Number, 
    default: 0 
  },
  reportedBy: [{
    user: { type: mongoose.Schema. Types.ObjectId, ref: 'User' },
    reason: String,
    reportedAt: { type: Date, default: Date. now }
  }]

}, { 
  timestamps: true 
});

// Índices
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.index({ product: 1, rating: -1 });
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema. index({ isApproved: 1 });

// Post-save: actualizar rating del producto
ReviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  if (product) {
    await product.updateRating();
  }
});

// Post-remove: actualizar rating del producto
ReviewSchema. post('remove', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this. product);
  if (product) {
    await product.updateRating();
  }
});

// Método: marcar como útil
ReviewSchema.methods.markHelpful = async function(userId) {
  if (this.helpfulBy.includes(userId)) {
    // Ya marcado, quitar
    this.helpfulBy. pull(userId);
    this. helpfulCount = Math.max(0, this.helpfulCount - 1);
  } else {
    this.helpfulBy.push(userId);
    this.helpfulCount += 1;
  }
  return this.save();
};

// Static: obtener reviews de un producto
ReviewSchema.statics.getProductReviews = async function(productId, options = {}) {
  const { 
    sortBy = 'createdAt', 
    sortOrder = -1,
    page = 1, 
    limit = 10 
  } = options;
  
  const filter = { 
    product: productId, 
    isApproved: true 
  };
  
  const [reviews, total, stats] = await Promise.all([
    this.find(filter)
      .populate('user', 'nombre avatar')
      .sort({ [sortBy]: sortOrder })
      . skip((page - 1) * limit)
      .limit(limit),
    this.countDocuments(filter),
    this.aggregate([
      { $match: filter },
      { 
        $group: { 
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ])
  ]);
  
  // Construir distribución de ratings
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats.forEach(s => {
    ratingDistribution[s._id] = s.count;
  });
  
  return {
    reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    ratingDistribution
  };
};

module.exports = mongoose.model('Review', ReviewSchema);
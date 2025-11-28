const Review = require('../models/catalog/Review');
const Product = require('../models/catalog/Product');
const Order = require('../models/orders/Order');
const { ValidationError, NotFoundError, UnauthorizedError } = require('../utils/errors');

/**
 * Obtener reseñas de un producto
 * GET /api/reviews/product/:productId
 */
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { 
      status = 'approved',
      sort = '-createdAt',
      page = 1,
      limit = 10 
    } = req.query;

    const filter = { product: productId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('user', 'name')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments(filter)
    ]);

    res.json({
      message: 'Reseñas obtenidas exitosamente',
      statusCode: 200,
      data: {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener reseñas del usuario
 * GET /api/reviews/my-reviews
 */
const getMyReviews = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const reviews = await Review.find({ user: userId })
      .populate('product', 'name image slug')
      .sort('-createdAt');

    res.json({
      message: 'Mis reseñas obtenidas exitosamente',
      statusCode: 200,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear reseña
 * POST /api/reviews
 */
const createReview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { product, order, rating, title, comment, pros, cons, images } = req.body;

    // Verificar si el producto existe
    const productExists = await Product.findById(product);
    if (!productExists) {
      throw new NotFoundError('Producto no encontrado');
    }

    // Verificar si ya existe una reseña del usuario para este producto
    const existingReview = await Review.findOne({ user: userId, product });
    if (existingReview) {
      throw new ValidationError('Ya has creado una reseña para este producto');
    }

    // Verificar si el usuario compró el producto
    let isVerifiedPurchase = false;
    if (order) {
      const orderExists = await Order.findOne({
        _id: order,
        user: userId,
        'items.product': product,
        status: 'delivered'
      });
      isVerifiedPurchase = !!orderExists;
    }

    const review = await Review.create({
      product,
      user: userId,
      order,
      rating,
      title,
      comment,
      pros,
      cons,
      images,
      isVerifiedPurchase,
      status: 'pending'
    });

    await review.populate('user', 'name');

    res.status(201).json({
      message: 'Reseña creada exitosamente, pendiente de moderación',
      statusCode: 201,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar reseña
 * PUT /api/reviews/:id
 */
const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { rating, title, comment, pros, cons, images } = req.body;

    const review = await Review.findOne({ _id: id, user: userId });

    if (!review) {
      throw new NotFoundError('Reseña no encontrada');
    }

    // Actualizar campos
    if (rating !== undefined) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment !== undefined) review.comment = comment;
    if (pros !== undefined) review.pros = pros;
    if (cons !== undefined) review.cons = cons;
    if (images !== undefined) review.images = images;

    review.status = 'pending'; // Volver a moderación
    await review.save();

    res.json({
      message: 'Reseña actualizada exitosamente',
      statusCode: 200,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar reseña
 * DELETE /api/reviews/:id
 */
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const filter = { _id: id };
    // Si no es admin, solo puede eliminar sus propias reseñas
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const review = await Review.findOneAndDelete(filter);

    if (!review) {
      throw new NotFoundError('Reseña no encontrada');
    }

    res.json({
      message: 'Reseña eliminada exitosamente',
      statusCode: 200,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marcar reseña como útil
 * POST /api/reviews/:id/helpful
 */
const markAsHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      throw new NotFoundError('Reseña no encontrada');
    }

    await review.markAsHelpful(userId);

    res.json({
      message: 'Reseña marcada como útil',
      statusCode: 200,
      data: { 
        helpfulCount: review.helpfulCount,
        helpfulBy: review.helpfulBy
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Moderar reseña (solo admin)
 * PATCH /api/reviews/:id/moderate
 */
const moderateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, moderationNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      throw new ValidationError('Estado inválido');
    }

    const review = await Review.findById(id);
    if (!review) {
      throw new NotFoundError('Reseña no encontrada');
    }

    await review.moderate(status, req.user._id, moderationNote);

    res.json({
      message: `Reseña ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`,
      statusCode: 200,
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
  markAsHelpful,
  moderateReview
};

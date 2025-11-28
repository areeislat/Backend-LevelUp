const Product = require('../models/catalog/Product');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Obtener todos los productos con filtros
 * GET /api/products
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      featured,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const filter = { isActive: true, isDeleted: false };

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (minPrice || maxPrice) {
      filter['pricing.salePrice'] = {};
      if (minPrice) filter['pricing.salePrice'].$gte = Number(minPrice);
      if (maxPrice) filter['pricing.salePrice'].$lte = Number(maxPrice);
    }
    if (inStock === 'true') filter['inventory.stock'] = { $gt: 0 };
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      message: 'Productos obtenidos exitosamente',
      statusCode: 200,
      data: {
        products,
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
 * Obtener producto por ID o slug
 * GET /api/products/:idOrSlug
 */
const getProductById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const product = await Product.findOne({
      $or: [
        { _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null },
        { slug: idOrSlug }
      ],
      isActive: true,
      isDeleted: false
    }).populate('category', 'name slug');

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    // Incrementar vistas
    await product.incrementViews();

    res.json({
      message: 'Producto obtenido exitosamente',
      statusCode: 200,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear producto
 * POST /api/products
 */
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;

    const product = await Product.create(productData);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      statusCode: 201,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar producto
 * PUT /api/products/:id
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    res.json({
      message: 'Producto actualizado exitosamente',
      statusCode: 200,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar producto (soft delete)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    res.json({
      message: 'Producto eliminado exitosamente',
      statusCode: 200,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar stock de producto
 * PATCH /api/products/:id/stock
 */
const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, type, reason, orderId } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    await product.updateStock(quantity, type, reason, req.user?._id, orderId);

    res.json({
      message: 'Stock actualizado exitosamente',
      statusCode: 200,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reservar stock
 * POST /api/products/:id/reserve
 */
const reserveStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, orderId } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    await product.reserveStock(quantity, orderId);

    res.json({
      message: 'Stock reservado exitosamente',
      statusCode: 200,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Liberar stock reservado
 * POST /api/products/:id/release
 */
const releaseStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, orderId } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    await product.releaseReservedStock(quantity, orderId);

    res.json({
      message: 'Stock liberado exitosamente',
      statusCode: 200,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  reserveStock,
  releaseStock
};

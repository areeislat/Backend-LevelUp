const Product = require('../models/Product');
const { NotFoundError, ConflictError } = require('../utils/errors');

/**
 * Crear un nuevo producto (solo admin)
 */
const createProduct = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const productData = { ...req.body, tenantId };

    // Verificar si el slug ya existe en este tenant
    const existingProduct = await Product.findOne({
      tenantId,
      slug: productData.slug
    });

    if (existingProduct) {
      throw new ConflictError('El slug del producto ya existe en este tenant');
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los productos
 */
const getAllProducts = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const {
      category,
      status,
      featured,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    const filter = { tenantId };

    // Filtros
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === 'true';

    // Filtro de precio
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Búsqueda por nombre o descripción
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const products = await Product.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un producto por ID
 */
const getProductById = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const product = await Product.findOne({
      _id: req.params.id,
      tenantId
    });

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un producto por slug
 */
const getProductBySlug = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const product = await Product.findOne({
      slug: req.params.slug,
      tenantId
    });

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar un producto (solo admin)
 */
const updateProduct = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const product = await Product.findOne({
      _id: req.params.id,
      tenantId
    });

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    // Actualizar campos
    Object.keys(req.body).forEach(key => {
      if (key !== 'tenantId') {
        product[key] = req.body[key];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un producto (solo admin)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      tenantId
    });

    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener categorías únicas del tenant
 */
const getCategories = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

    const categories = await Product.distinct('category', {
      tenantId,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getCategories
};


const Category = require('../models/catalog/Category');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Obtener todas las categorías
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
  try {
    const { active, featured, parent } = req.query;
    const filter = {};

    if (active !== undefined) filter.isActive = active === 'true';
    if (featured !== undefined) filter.isFeatured = featured === 'true';
    if (parent !== undefined) filter.parent = parent === 'null' ? null : parent;

    const categories = await Category.find(filter)
      .populate('parent', 'name slug')
      .sort({ displayOrder: 1, name: 1 });

    res.json({
      message: 'Categorías obtenidas exitosamente',
      statusCode: 200,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener categoría por ID o slug
 * GET /api/categories/:idOrSlug
 */
const getCategoryById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    
    const category = await Category.findOne({
      $or: [
        { _id: idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? idOrSlug : null },
        { slug: idOrSlug }
      ]
    }).populate('parent', 'name slug icon');

    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    // Obtener subcategorías
    const subcategories = await Category.find({ parent: category._id, isActive: true })
      .sort({ displayOrder: 1 });

    res.json({
      message: 'Categoría obtenida exitosamente',
      statusCode: 200,
      data: { 
        category,
        subcategories 
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear categoría
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
  try {
    const categoryData = req.body;

    const category = await Category.create(categoryData);

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      statusCode: 201,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar categoría
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    res.json({
      message: 'Categoría actualizada exitosamente',
      statusCode: 200,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar categoría
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar si tiene subcategorías
    const hasSubcategories = await Category.countDocuments({ parent: id });
    if (hasSubcategories > 0) {
      throw new ValidationError('No se puede eliminar una categoría con subcategorías');
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      throw new NotFoundError('Categoría no encontrada');
    }

    res.json({
      message: 'Categoría eliminada exitosamente',
      statusCode: 200,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

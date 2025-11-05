const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Obtener o crear el carrito del usuario autenticado
 */
const getOrCreateCart = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;

    let cart = await Cart.findOne({
      tenantId,
      user: userId,
      status: 'active'
    }).populate('items.product');

    // Si no existe, crear uno nuevo
    if (!cart) {
      cart = await Cart.create({
        tenantId,
        user: userId,
        items: []
      });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Añadir un producto al carrito
 */
const addToCart = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Verificar que el producto existe y pertenece al tenant
    const product = await Product.findOne({
      _id: productId,
      tenantId,
      status: 'active'
    });

    if (!product) {
      throw new NotFoundError('Producto no encontrado o no disponible');
    }

    // Verificar stock
    if (product.inventory.trackInventory && product.inventory.quantity < quantity) {
      throw new ValidationError('No hay suficiente stock disponible');
    }

    // Obtener o crear carrito
    let cart = await Cart.findOne({
      tenantId,
      user: userId,
      status: 'active'
    });

    if (!cart) {
      cart = new Cart({
        tenantId,
        user: userId,
        items: []
      });
    }

    // Añadir producto
    await cart.addItem(productId, quantity, product.price);

    // Poblar el carrito con los datos del producto
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Producto añadido al carrito',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar la cantidad de un producto en el carrito
 */
const updateCartItem = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({
      tenantId,
      user: userId,
      status: 'active'
    });

    if (!cart) {
      throw new NotFoundError('Carrito no encontrado');
    }

    // Verificar stock si se aumenta la cantidad
    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (product.inventory.trackInventory && product.inventory.quantity < quantity) {
        throw new ValidationError('No hay suficiente stock disponible');
      }
    }

    await cart.updateItemQuantity(productId, quantity);
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Carrito actualizado',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un producto del carrito
 */
const removeFromCart = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await Cart.findOne({
      tenantId,
      user: userId,
      status: 'active'
    });

    if (!cart) {
      throw new NotFoundError('Carrito no encontrado');
    }

    await cart.removeItem(productId);
    await cart.populate('items.product');

    res.status(200).json({
      success: true,
      message: 'Producto eliminado del carrito',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vaciar el carrito
 */
const clearCart = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;

    const cart = await Cart.findOne({
      tenantId,
      user: userId,
      status: 'active'
    });

    if (!cart) {
      throw new NotFoundError('Carrito no encontrado');
    }

    await cart.clear();

    res.status(200).json({
      success: true,
      message: 'Carrito vaciado',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};


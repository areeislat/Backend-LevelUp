const Cart = require('../models/orders/Cart');
const Product = require('../models/catalog/Product');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Obtener carrito del usuario
 * GET /api/cart
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    const filter = userId ? { user: userId } : { sessionId };

    let cart = await Cart.findOne(filter).populate('items.product', 'name image pricing inventory');

    if (!cart) {
      cart = await Cart.create(userId ? { user: userId } : { sessionId });
    }

    res.json({
      message: 'Carrito obtenido exitosamente',
      statusCode: 200,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agregar item al carrito
 * POST /api/cart/items
 */
const addItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    const { productId, quantity = 1 } = req.body;

    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      throw new NotFoundError('Producto no encontrado');
    }

    if (!product.isActive || product.isDeleted) {
      throw new ValidationError('Producto no disponible');
    }

    // Obtener o crear carrito
    const filter = userId ? { user: userId } : { sessionId };
    let cart = await Cart.findOne(filter);

    if (!cart) {
      cart = await Cart.create(userId ? { user: userId } : { sessionId });
    }

    // Agregar item
    await cart.addItem({
      product: product._id,
      productId: product.productId,
      name: product.name,
      image: product.images?.[0],
      price: product.pricing.salePrice,
      quantity
    });

    await cart.populate('items.product', 'name image pricing inventory');

    res.status(201).json({
      message: 'Producto agregado al carrito',
      statusCode: 201,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar cantidad de un item
 * PUT /api/cart/items/:productId
 */
const updateItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    const { productId } = req.params;
    const { quantity } = req.body;

    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      throw new NotFoundError('Carrito no encontrado');
    }

    await cart.updateItemQuantity(productId, quantity);
    await cart.populate('items.product', 'name image pricing inventory');

    res.json({
      message: 'Cantidad actualizada',
      statusCode: 200,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar item del carrito
 * DELETE /api/cart/items/:productId
 */
const removeItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    const { productId } = req.params;

    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      throw new NotFoundError('Carrito no encontrado');
    }

    await cart.removeItem(productId);
    await cart.populate('items.product', 'name image pricing inventory');

    res.json({
      message: 'Producto eliminado del carrito',
      statusCode: 200,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Limpiar carrito
 * DELETE /api/cart
 */
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      throw new NotFoundError('Carrito no encontrado');
    }

    await cart.clear();

    res.json({
      message: 'Carrito vaciado exitosamente',
      statusCode: 200,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Aplicar cupón de descuento
 * POST /api/cart/coupon
 */
const applyCoupon = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    const { couponCode } = req.body;

    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      throw new NotFoundError('Carrito no encontrado');
    }

    await cart.applyCoupon(couponCode);
    await cart.populate('items.product', 'name image pricing inventory');

    res.json({
      message: 'Cupón aplicado exitosamente',
      statusCode: 200,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remover cupón
 * DELETE /api/cart/coupon
 */
const removeCoupon = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) {
      throw new NotFoundError('Carrito no encontrado');
    }

    await cart.removeCoupon();
    await cart.populate('items.product', 'name image pricing inventory');

    res.json({
      message: 'Cupón removido exitosamente',
      statusCode: 200,
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Migrar carrito de sesión a usuario
 * POST /api/cart/merge
 */
const mergeCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.body;

    if (!sessionId) {
      throw new ValidationError('sessionId es requerido');
    }

    // Buscar carrito de sesión
    const sessionCart = await Cart.findOne({ sessionId });
    if (!sessionCart || sessionCart.items.length === 0) {
      return res.json({
        message: 'No hay carrito de sesión para migrar',
        statusCode: 200,
        data: { cart: null }
      });
    }

    // Buscar o crear carrito de usuario
    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = await Cart.create({ user: userId });
    }

    // Migrar items
    for (const item of sessionCart.items) {
      try {
        await userCart.addItem({
          product: item.product,
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        });
      } catch (error) {
        // Continuar si hay error en un item específico
        console.error('Error migrando item:', error.message);
      }
    }

    // Eliminar carrito de sesión
    await sessionCart.deleteOne();

    await userCart.populate('items.product', 'name image pricing inventory');

    res.json({
      message: 'Carrito migrado exitosamente',
      statusCode: 200,
      data: { cart: userCart }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  mergeCart
};

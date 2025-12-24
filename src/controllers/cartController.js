const Cart = require('../models/orders/Cart');
const Product = require('../models/catalog/Product');
const { ValidationError, NotFoundError } = require('../utils/errors');

// Función auxiliar para limpiar items nulos (productos borrados)
const cleanCartItems = (cart) => {
    if (!cart) return;
    const validItems = cart.items.filter(item => item.product != null);
    if (validItems.length !== cart.items.length) {
        cart.items = validItems;
        cart.save();
    }
};

/**
 * Obtener carrito del usuario
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    const filter = userId ? { user: userId } : { sessionId };

    let cart = await Cart.findOne(filter).populate('items.product', 'name image price stock');

    if (!cart) {
      cart = await Cart.create(userId ? { user: userId } : { sessionId });
    } else {
      cleanCartItems(cart);
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
 */
const addItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Producto no encontrado');
    if (!product.isActive) throw new ValidationError('Producto no disponible');

    const filter = userId ? { user: userId } : { sessionId };
    let cart = await Cart.findOne(filter);

    if (!cart) {
      cart = await Cart.create(userId ? { user: userId } : { sessionId });
    }

    // Usamos el objeto product completo para que el modelo extraiga los datos
    await cart.addItem(product, quantity);
    await cart.populate('items.product', 'name image price stock');

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

    // CORRECCIÓN AQUÍ: El método del modelo es updateQuantity, no updateItemQuantity
    await cart.updateQuantity(productId, quantity);
    
    await cart.populate('items.product', 'name image price stock');

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
    await cart.populate('items.product', 'name image price stock');

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
 */
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (cart) {
      await cart.clear();
    }

    // Devolvemos el carrito vacío aunque no existiera antes, para evitar errores en front
    res.json({
      message: 'Carrito vaciado exitosamente',
      statusCode: 200,
      data: { cart: cart || { items: [], total: 0 } }
    });
  } catch (error) {
    next(error);
  }
};

const applyCoupon = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    const { couponCode } = req.body;

    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) throw new NotFoundError('Carrito no encontrado');

    await cart.applyCoupon(couponCode);
    await cart.populate('items.product', 'name image price stock');

    res.json({ message: 'Cupón aplicado', statusCode: 200, data: { cart } });
  } catch (error) { next(error); }
};

const removeCoupon = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const sessionId = req.sessionID || req.headers['x-session-id'];
    const filter = userId ? { user: userId } : { sessionId };
    const cart = await Cart.findOne(filter);

    if (!cart) throw new NotFoundError('Carrito no encontrado');

    await cart.removeCoupon();
    await cart.populate('items.product', 'name image price stock');

    res.json({ message: 'Cupón removido', statusCode: 200, data: { cart } });
  } catch (error) { next(error); }
};

const mergeCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.body;

    if (!sessionId) throw new ValidationError('sessionId es requerido');

    const sessionCart = await Cart.findOne({ sessionId });
    if (!sessionCart || sessionCart.items.length === 0) {
      return res.json({ message: 'Nada que migrar', statusCode: 200, data: { cart: null } });
    }

    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) userCart = await Cart.create({ user: userId });

    for (const item of sessionCart.items) {
      try {
        const productDoc = await Product.findById(item.product);
        if (productDoc) {
             await userCart.addItem(productDoc, item.quantity);
        }
      } catch (error) {
        console.error('Error migrando item:', error.message);
      }
    }

    await sessionCart.deleteOne();
    await userCart.populate('items.product', 'name image price stock');

    res.json({ message: 'Carrito migrado', statusCode: 200, data: { cart: userCart } });
  } catch (error) { next(error); }
};

module.exports = {
  getCart, addItem, updateItemQuantity, removeItem, clearCart, applyCoupon, removeCoupon, mergeCart
};
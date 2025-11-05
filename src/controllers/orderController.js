const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Crear una nueva orden desde el carrito
 */
const createOrder = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const { paymentMethod, shippingAddress, notes } = req.body;

    // Obtener carrito activo
    const cart = await Cart.findOne({
      tenantId,
      user: userId,
      status: 'active'
    }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('El carrito está vacío');
    }

    // Verificar stock de todos los productos
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      
      if (!product || product.status !== 'active') {
        throw new ValidationError(`El producto ${item.product.name} ya no está disponible`);
      }

      if (product.inventory.trackInventory && product.inventory.quantity < item.quantity) {
        throw new ValidationError(`No hay suficiente stock de ${product.name}`);
      }
    }

    // Preparar items de la orden
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity
    }));

    // Calcular totales
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.16; // 16% de impuestos (ajustar según necesidad)
    const shipping = subtotal > 500 ? 0 : 50; // Envío gratis sobre $500
    const total = subtotal + tax + shipping;

    // Crear orden
    const order = await Order.create({
      tenantId,
      user: userId,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      shippingAddress,
      notes
    });

    // Actualizar inventario de productos
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product.inventory.trackInventory) {
        product.inventory.quantity -= item.quantity;
        await product.save();
      }
    }

    // Marcar carrito como completado
    cart.status = 'completed';
    await cart.save();

    // Poblar la orden con datos del usuario
    await order.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todas las órdenes del usuario autenticado
 */
const getMyOrders = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { tenantId, user: userId };
    
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('items.product', 'name slug images');

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
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
 * Obtener todas las órdenes del tenant (solo admin)
 */
const getAllOrders = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;

    const filter = { tenantId };
    
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name slug');

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
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
 * Obtener una orden por ID
 */
const getOrderById = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const userRole = req.user.role;

    const filter = {
      _id: req.params.id,
      tenantId
    };

    // Si no es admin, solo puede ver sus propias órdenes
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const order = await Order.findOne(filter)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name slug images');

    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar el estado de una orden (solo admin)
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const { status, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      tenantId
    });

    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    // Actualizar campos
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Orden actualizada exitosamente',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancelar una orden
 */
const cancelOrder = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.id;
    const userRole = req.user.role;

    const filter = {
      _id: req.params.id,
      tenantId
    };

    // Si no es admin, solo puede cancelar sus propias órdenes
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const order = await Order.findOne(filter);

    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    // Solo se puede cancelar si está en pending o processing
    if (!['pending', 'processing'].includes(order.status)) {
      throw new ValidationError('Esta orden no puede ser cancelada');
    }

    order.status = 'cancelled';
    await order.save();

    // Restaurar inventario
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.inventory.trackInventory) {
        product.inventory.quantity += item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Orden cancelada exitosamente',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};


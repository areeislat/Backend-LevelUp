const Order = require('../models/orders/Order');
const Cart = require('../models/orders/Cart');
const Product = require('../models/catalog/Product');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Obtener pedidos del usuario
 * GET /api/orders
 */
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name image')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      message: 'Pedidos obtenidos exitosamente',
      statusCode: 200,
      data: {
        orders,
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
 * Obtener pedido por ID
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const filter = { _id: id };
    // Si no es admin, solo puede ver sus propios pedidos
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const order = await Order.findOne(filter)
      .populate('items.product', 'name image brand')
      .populate('user', 'name email');

    if (!order) {
      throw new NotFoundError('Pedido no encontrado');
    }

    res.json({
      message: 'Pedido obtenido exitosamente',
      statusCode: 200,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear pedido desde carrito
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Validar dirección de envío
    if (!shippingAddress || !shippingAddress.direccion || !shippingAddress.comuna) {
      throw new ValidationError('Dirección de envío incompleta');
    }

    // Obtener carrito del usuario
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      throw new ValidationError('El carrito está vacío');
    }

    // Verificar disponibilidad de stock
    for (const item of cart.items) {
      if (!item.product.isActive || item.product.isDeleted) {
        throw new ValidationError(`El producto ${item.product.name} ya no está disponible`);
      }

      if (item.product.inventory.stock < item.quantity) {
        throw new ValidationError(
          `Stock insuficiente para ${item.product.name}. Disponible: ${item.product.inventory.stock}`
        );
      }
    }

    // Crear items del pedido
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productId: item.product.productId,
      name: item.product.name,
      image: item.product.images?.[0],
      brand: item.product.brand,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal
    }));

    // Crear pedido
    const order = await Order.create({
      user: userId,
      items: orderItems,
      subtotal: cart.subtotal,
      discount: cart.discount,
      shipping: {
        method: 'standard',
        address: shippingAddress,
        cost: cart.shippingCost
      },
      tax: cart.tax,
      total: cart.total,
      payment: {
        method: paymentMethod || 'pending',
        status: 'pending'
      },
      coupon: cart.coupon,
      notes,
      status: 'pending'
    });

    // Reservar stock de los productos
    for (const item of cart.items) {
      await item.product.reserveStock(item.quantity, order._id);
    }

    // Limpiar carrito
    await cart.clear();

    await order.populate('items.product', 'name image');

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      statusCode: 201,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancelar pedido
 * POST /api/orders/:id/cancel
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: id, user: userId });

    if (!order) {
      throw new NotFoundError('Pedido no encontrado');
    }

    await order.cancel(reason);

    res.json({
      message: 'Pedido cancelado exitosamente',
      statusCode: 200,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar estado del pedido (solo admin)
 * PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Estado inválido');
    }

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Pedido no encontrado');
    }

    order.status = status;
    order.timeline.push({
      status,
      date: new Date(),
      note: `Estado actualizado a ${status}`
    });

    if (status === 'confirmed') {
      order.confirmedAt = new Date();
      // Decrementar stock real de los productos
      for (const item of order.items) {
        // Cargar el producto actualizado
        const product = await Product.findById(item.product);
        if (product) {
          await product.confirmSale(item.quantity, order._id, req.user?._id);
        }
      }
    } else if (status === 'shipped') {
      order.shippedAt = new Date();
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      message: 'Estado del pedido actualizado',
      statusCode: 200,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar información de envío (solo admin)
 * PATCH /api/orders/:id/shipping
 */
const updateShippingInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { carrier, trackingCode, trackingUrl } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Pedido no encontrado');
    }

    if (carrier) order.shipping.carrier = carrier;
    if (trackingCode) order.shipping.trackingCode = trackingCode;
    if (trackingUrl) order.shipping.trackingUrl = trackingUrl;

    await order.save();

    res.json({
      message: 'Información de envío actualizada',
      statusCode: 200,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de pedidos (solo admin)
 * GET /api/orders/stats
 */
const getOrderStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalOrders,
      totalRevenue,
      statusBreakdown,
      avgOrderValue
    ] = await Promise.all([
      Order.countDocuments(filter),
      Order.aggregate([
        { $match: filter },
        { $match: { status: { $in: ['delivered', 'shipped', 'processing'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $count: {} } } }
      ]),
      Order.aggregate([
        { $match: filter },
        { $match: { status: { $in: ['delivered', 'shipped', 'processing'] } } },
        { $group: { _id: null, avg: { $avg: '$total' } } }
      ])
    ]);

    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      statusCode: 200,
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        avgOrderValue: avgOrderValue[0]?.avg || 0,
        statusBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  updateShippingInfo,
  getOrderStats
};

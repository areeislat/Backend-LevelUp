const Payment = require('../models/orders/Payment');
const Order = require('../models/orders/Order');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Obtener pagos del usuario
 * GET /api/payments
 */
const getPayments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('order', 'orderNumber total status')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(filter)
    ]);

    res.json({
      message: 'Pagos obtenidos exitosamente',
      statusCode: 200,
      data: {
        payments,
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
 * Obtener pago por ID
 * GET /api/payments/:id
 */
const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const filter = { _id: id };
    if (userRole !== 'admin') {
      filter.user = userId;
    }

    const payment = await Payment.findOne(filter)
      .populate('order', 'orderNumber total items')
      .populate('user', 'name email');

    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }

    res.json({
      message: 'Pago obtenido exitosamente',
      statusCode: 200,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear pago
 * POST /api/payments
 */
const createPayment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderId, method, gateway } = req.body;

    // Verificar que la orden existe y pertenece al usuario
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new NotFoundError('Orden no encontrada');
    }

    if (order.payment.status === 'completed') {
      throw new ValidationError('Esta orden ya ha sido pagada');
    }

    // Crear pago
    const payment = await Payment.create({
      order: orderId,
      user: userId,
      amount: order.total,
      currency: 'CLP',
      method,
      gateway,
      status: 'pending'
    });

    // Actualizar estado de pago en la orden
    order.payment.status = 'pending';
    await order.save();

    res.status(201).json({
      message: 'Pago creado exitosamente',
      statusCode: 201,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Procesar pago (simulación o integración con gateway)
 * POST /api/payments/:id/process
 */
const processPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transactionId, gatewayResponse } = req.body;

    const payment = await Payment.findById(id).populate('order');
    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }

    if (payment.status !== 'pending') {
      throw new ValidationError('Este pago ya fue procesado');
    }

    // Aquí iría la integración con el gateway de pago real
    // Por ahora simulamos el proceso

    payment.status = 'processing';
    payment.transactionId = transactionId;
    payment.gatewayResponse = gatewayResponse;
    await payment.save();

    res.json({
      message: 'Pago en proceso',
      statusCode: 200,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirmar pago exitoso
 * POST /api/payments/:id/confirm
 */
const confirmPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;

    const payment = await Payment.findById(id).populate('order');
    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }

    await payment.markAsCompleted(transactionId);

    res.json({
      message: 'Pago confirmado exitosamente',
      statusCode: 200,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marcar pago como fallido
 * POST /api/payments/:id/fail
 */
const failPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { errorMessage } = req.body;

    const payment = await Payment.findById(id).populate('order');
    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }

    await payment.markAsFailed(errorMessage);

    res.json({
      message: 'Pago marcado como fallido',
      statusCode: 200,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Procesar reembolso
 * POST /api/payments/:id/refund
 */
const refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findById(id).populate('order');
    if (!payment) {
      throw new NotFoundError('Pago no encontrado');
    }

    await payment.processRefund(amount, reason);

    res.json({
      message: 'Reembolso procesado exitosamente',
      statusCode: 200,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook para notificaciones del gateway
 * POST /api/payments/webhook/:gateway
 */
const handleWebhook = async (req, res, next) => {
  try {
    const { gateway } = req.params;
    const webhookData = req.body;

    // Aquí iría la lógica específica de cada gateway
    // Por ejemplo: Webpay, MercadoPago, etc.

    console.log(`Webhook recibido de ${gateway}:`, webhookData);

    // Procesar según el gateway
    // Buscar el pago y actualizar su estado

    res.json({
      message: 'Webhook procesado',
      statusCode: 200
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener estadísticas de pagos (solo admin)
 * GET /api/payments/stats
 */
const getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [
      totalPayments,
      successfulPayments,
      totalAmount,
      methodBreakdown,
      statusBreakdown
    ] = await Promise.all([
      Payment.countDocuments(filter),
      Payment.countDocuments({ ...filter, status: 'completed' }),
      Payment.aggregate([
        { $match: { ...filter, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: filter },
        { $group: { _id: '$method', count: { $count: {} }, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: filter },
        { $group: { _id: '$status', count: { $count: {} } } }
      ])
    ]);

    res.json({
      message: 'Estadísticas obtenidas exitosamente',
      statusCode: 200,
      data: {
        totalPayments,
        successfulPayments,
        totalAmount: totalAmount[0]?.total || 0,
        successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
        methodBreakdown,
        statusBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  processPayment,
  confirmPayment,
  failPayment,
  refundPayment,
  handleWebhook,
  getPaymentStats
};

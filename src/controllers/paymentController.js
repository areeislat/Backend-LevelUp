const Payment = require('../models/orders/Payment');
const Order = require('../models/orders/Order');
// CORRECCIÓN: Faltaba importar este modelo para dar los puntos
const LoyaltyAccount = require('../models/loyalty/LoyaltyAccount'); 
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
 * Crear y Confirmar pago (Simulación de éxito inmediato)
 * POST /api/payments
 */
const createPayment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { orderId, method, gateway } = req.body;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new NotFoundError('Orden no encontrada');
    if (order.payment.status === 'paid') throw new ValidationError('Esta orden ya ha sido pagada');
    
    // 1. Crear Pago
    const payment = await Payment.create({
      order: orderId,
      user: userId,
      amount: order.total,
      currency: 'CLP',
      method,
      gateway,
      status: 'pending'
    });
    
    // 2. Simular Éxito
    await payment.complete('SIMULATION_SUCCESS', 'AUTH_SIM'); 
    await order.markAsPaid(payment.transactionId, gateway, 'SIMULATION_SUCCESS');
    
    // 3. --- ASIGNAR PUNTOS DE LOYALTY ---
    try {
        const account = await LoyaltyAccount.findOne({ user: userId });
        if (account) {
            // Regla: 1 punto por cada $100 pesos
            const pointsEarned = Math.floor(order.total / 100); 
            if (pointsEarned > 0) {
                await account.addPoints(pointsEarned, `Compra Orden #${order.orderNumber}`, order._id);
            }
        }
    } catch (loyaltyError) {
        console.error("Error asignando puntos (no crítico para la venta):", loyaltyError);
    }
    // ---------------------------------------

    res.status(201).json({
      message: 'Pago exitoso y puntos asignados',
      statusCode: 201,
      data: { payment }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Webhook para notificaciones del gateway (Mínima implementación - STUB)
 * POST /api/payments/webhook/:gateway
 */
const handleWebhook = async (req, res, next) => {
  try {
    console.log(`Webhook recibido de ${req.params.gateway}:`, req.body);
    res.json({ message: 'Webhook procesado (STUB)', statusCode: 200 });
  } catch (error) { next(error); }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  handleWebhook
};
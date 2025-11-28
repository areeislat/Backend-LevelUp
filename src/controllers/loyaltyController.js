const LoyaltyAccount = require('../models/loyalty/LoyaltyAccount');
const PointsTransaction = require('../models/loyalty/PointsTransaction');
const Reward = require('../models/loyalty/Reward');
const RedeemedReward = require('../models/loyalty/RedeemedReward');
const { ValidationError, NotFoundError } = require('../utils/errors');

// ==================== LOYALTY ACCOUNT ====================

/**
 * Obtener cuenta de lealtad del usuario
 * GET /api/loyalty/account
 */
const getMyLoyaltyAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let account = await LoyaltyAccount.findOne({ user: userId });

    // Crear cuenta si no existe
    if (!account) {
      account = await LoyaltyAccount.create({ user: userId });
    }

    res.json({
      message: 'Cuenta de lealtad obtenida exitosamente',
      statusCode: 200,
      data: { account }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de transacciones de puntos
 * GET /api/loyalty/transactions
 */
const getMyTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type, page = 1, limit = 20 } = req.query;

    const filter = { user: userId };
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      PointsTransaction.find(filter)
        .populate('order', 'orderNumber total')
        .populate('reward', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      PointsTransaction.countDocuments(filter)
    ]);

    res.json({
      message: 'Transacciones obtenidas exitosamente',
      statusCode: 200,
      data: {
        transactions,
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
 * Agregar puntos manualmente (solo admin)
 * POST /api/loyalty/add-points
 */
const addPoints = async (req, res, next) => {
  try {
    const { userId, points, reason } = req.body;

    const account = await LoyaltyAccount.findOne({ user: userId });
    if (!account) {
      throw new NotFoundError('Cuenta de lealtad no encontrada');
    }

    await account.addPoints(points, 'adjustment', reason);

    res.json({
      message: 'Puntos agregados exitosamente',
      statusCode: 200,
      data: { account }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Procesar puntos por compra (interno - llamado desde orderController)
 * POST /api/loyalty/process-order-points
 */
const processOrderPoints = async (req, res, next) => {
  try {
    const { userId, orderId, orderAmount } = req.body;

    let account = await LoyaltyAccount.findOne({ user: userId });
    if (!account) {
      account = await LoyaltyAccount.create({ user: userId });
    }

    await account.addPointsFromOrder(orderAmount, orderId);

    res.json({
      message: 'Puntos procesados exitosamente',
      statusCode: 200,
      data: { account }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== REWARDS ====================

/**
 * Obtener todas las recompensas disponibles
 * GET /api/loyalty/rewards
 */
const getRewards = async (req, res, next) => {
  try {
    const { type, available } = req.query;

    const filter = { isActive: true };
    if (type) filter.type = type;

    const rewards = await Reward.find(filter)
      .populate('product', 'name image pricing')
      .sort('pointsCost');

    // Si se solicita solo las disponibles, filtrar por stock
    let filteredRewards = rewards;
    if (available === 'true') {
      filteredRewards = rewards.filter(r => r.isAvailable());
    }

    res.json({
      message: 'Recompensas obtenidas exitosamente',
      statusCode: 200,
      data: { rewards: filteredRewards }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener recompensa por ID
 * GET /api/loyalty/rewards/:id
 */
const getRewardById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reward = await Reward.findById(id).populate('product', 'name image pricing description');

    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    res.json({
      message: 'Recompensa obtenida exitosamente',
      statusCode: 200,
      data: { reward }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear recompensa (solo admin)
 * POST /api/loyalty/rewards
 */
const createReward = async (req, res, next) => {
  try {
    const rewardData = req.body;

    const reward = await Reward.create(rewardData);

    res.status(201).json({
      message: 'Recompensa creada exitosamente',
      statusCode: 201,
      data: { reward }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar recompensa (solo admin)
 * PUT /api/loyalty/rewards/:id
 */
const updateReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const reward = await Reward.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    res.json({
      message: 'Recompensa actualizada exitosamente',
      statusCode: 200,
      data: { reward }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar recompensa (solo admin)
 * DELETE /api/loyalty/rewards/:id
 */
const deleteReward = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reward = await Reward.findByIdAndDelete(id);

    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    res.json({
      message: 'Recompensa eliminada exitosamente',
      statusCode: 200,
      data: { reward }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== REDEEM REWARDS ====================

/**
 * Canjear recompensa
 * POST /api/loyalty/redeem
 */
const redeemReward = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { rewardId } = req.body;

    // Obtener cuenta de lealtad
    const account = await LoyaltyAccount.findOne({ user: userId });
    if (!account) {
      throw new NotFoundError('Cuenta de lealtad no encontrada');
    }

    // Obtener recompensa
    const reward = await Reward.findById(rewardId);
    if (!reward) {
      throw new NotFoundError('Recompensa no encontrada');
    }

    // Verificar disponibilidad
    if (!reward.isAvailable()) {
      throw new ValidationError('Recompensa no disponible');
    }

    // Verificar puntos suficientes
    if (account.points < reward.pointsCost) {
      throw new ValidationError('Puntos insuficientes');
    }

    // Canjear
    const redeemedReward = await reward.redeem(userId);

    // Descontar puntos
    await account.redeemPoints(reward.pointsCost, 'redeem', rewardId);

    res.status(201).json({
      message: 'Recompensa canjeada exitosamente',
      statusCode: 201,
      data: { 
        redeemedReward,
        remainingPoints: account.points
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener mis recompensas canjeadas
 * GET /api/loyalty/my-rewards
 */
const getMyRedeemedRewards = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const redeemedRewards = await RedeemedReward.find(filter)
      .populate('reward', 'name image type')
      .sort('-createdAt');

    res.json({
      message: 'Recompensas canjeadas obtenidas exitosamente',
      statusCode: 200,
      data: { redeemedRewards }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Usar recompensa canjeada
 * POST /api/loyalty/my-rewards/:id/use
 */
const useRedeemedReward = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { orderId } = req.body;

    const redeemedReward = await RedeemedReward.findOne({ _id: id, user: userId });

    if (!redeemedReward) {
      throw new NotFoundError('Recompensa canjeada no encontrada');
    }

    await redeemedReward.use(orderId);

    res.json({
      message: 'Recompensa utilizada exitosamente',
      statusCode: 200,
      data: { redeemedReward }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validar cupón de recompensa
 * POST /api/loyalty/validate-coupon
 */
const validateCoupon = async (req, res, next) => {
  try {
    const { couponCode } = req.body;

    const redeemedReward = await RedeemedReward.findOne({ 
      couponCode,
      status: 'active'
    }).populate('reward', 'name type value');

    if (!redeemedReward) {
      throw new NotFoundError('Cupón no válido o ya utilizado');
    }

    if (redeemedReward.isExpired()) {
      throw new ValidationError('El cupón ha expirado');
    }

    res.json({
      message: 'Cupón válido',
      statusCode: 200,
      data: { 
        valid: true,
        reward: redeemedReward
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  // Account
  getMyLoyaltyAccount,
  getMyTransactions,
  addPoints,
  processOrderPoints,
  // Rewards
  getRewards,
  getRewardById,
  createReward,
  updateReward,
  deleteReward,
  // Redeem
  redeemReward,
  getMyRedeemedRewards,
  useRedeemedReward,
  validateCoupon
};

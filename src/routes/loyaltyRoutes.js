const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/loyaltyController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');

// ==================== LOYALTY ACCOUNT ====================

/**
 * @swagger
 * /api/loyalty/account:
 *   get:
 *     tags: [Loyalty]
 *     summary: Obtener cuenta de lealtad del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuenta de lealtad obtenida
 */
router.get('/account', authenticate, getMyLoyaltyAccount);

/**
 * @swagger
 * /api/loyalty/transactions:
 *   get:
 *     tags: [Loyalty]
 *     summary: Obtener historial de transacciones de puntos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de transacciones
 */
router.get('/transactions', authenticate, getMyTransactions);

/**
 * @route   POST /api/loyalty/add-points
 * @desc    Agregar puntos manualmente
 * @access  Private (Admin)
 */
router.post('/add-points', authenticate, requireRole('admin'), addPoints);

/**
 * @route   POST /api/loyalty/process-order-points
 * @desc    Procesar puntos por compra (interno)
 * @access  Private (Admin)
 */
router.post('/process-order-points', authenticate, requireRole('admin'), processOrderPoints);

// ==================== REWARDS ====================

/**
 * @route   GET /api/loyalty/rewards
 * @desc    Obtener todas las recompensas disponibles
 * @access  Public
 */
router.get('/rewards', getRewards);

/**
 * @route   GET /api/loyalty/rewards/:id
 * @desc    Obtener recompensa por ID
 * @access  Public
 */
router.get('/rewards/:id', getRewardById);

/**
 * @route   POST /api/loyalty/rewards
 * @desc    Crear recompensa
 * @access  Private (Admin)
 */
router.post('/rewards', authenticate, requireRole('admin'), createReward);

/**
 * @route   PUT /api/loyalty/rewards/:id
 * @desc    Actualizar recompensa
 * @access  Private (Admin)
 */
router.put('/rewards/:id', authenticate, requireRole('admin'), updateReward);

/**
 * @route   DELETE /api/loyalty/rewards/:id
 * @desc    Eliminar recompensa
 * @access  Private (Admin)
 */
router.delete('/rewards/:id', authenticate, requireRole('admin'), deleteReward);

// ==================== REDEEM REWARDS ====================

/**
 * @route   POST /api/loyalty/redeem
 * @desc    Canjear recompensa
 * @access  Private
 */
router.post('/redeem', authenticate, redeemReward);

/**
 * @route   GET /api/loyalty/my-rewards
 * @desc    Obtener mis recompensas canjeadas
 * @access  Private
 */
router.get('/my-rewards', authenticate, getMyRedeemedRewards);

/**
 * @route   POST /api/loyalty/my-rewards/:id/use
 * @desc    Usar recompensa canjeada
 * @access  Private
 */
router.post('/my-rewards/:id/use', authenticate, useRedeemedReward);

/**
 * @route   POST /api/loyalty/validate-coupon
 * @desc    Validar cupón de recompensa
 * @access  Public
 */
router.post('/validate-coupon', validateCoupon);

module.exports = router;

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
 * @swagger
 * /api/loyalty/add-points:
 *   post:
 *     tags: [Loyalty]
 *     summary: Agregar puntos manualmente (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               points:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Puntos agregados exitosamente
 */
router.post('/add-points', authenticate, requireRole('admin'), addPoints);

/**
 * @swagger
 * /api/loyalty/process-order-points:
 *   post:
 *     tags: [Loyalty]
 *     summary: Procesar puntos por compra (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               orderId:
 *                 type: string
 *               orderTotal:
 *                 type: number
 *     responses:
 *       200:
 *         description: Puntos procesados exitosamente
 */
router.post('/process-order-points', authenticate, requireRole('admin'), processOrderPoints);

// ==================== REWARDS ====================

/**
 * @swagger
 * /api/loyalty/rewards:
 *   get:
 *     tags: [Loyalty]
 *     summary: Obtener todas las recompensas disponibles
 *     description: Lista todas las recompensas activas
 *     responses:
 *       200:
 *         description: Lista de recompensas
 */
router.get('/rewards', getRewards);

/**
 * @swagger
 * /api/loyalty/rewards/{id}:
 *   get:
 *     tags: [Loyalty]
 *     summary: Obtener recompensa por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recompensa encontrada
 */
router.get('/rewards/:id', getRewardById);

/**
 * @swagger
 * /api/loyalty/rewards:
 *   post:
 *     tags: [Loyalty]
 *     summary: Crear recompensa (Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               pointsCost:
 *                 type: number
 *               value:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Recompensa creada exitosamente
 */
router.post('/rewards', authenticate, requireRole('admin'), createReward);

/**
 * @swagger
 * /api/loyalty/rewards/{id}:
 *   put:
 *     tags: [Loyalty]
 *     summary: Actualizar recompensa (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Recompensa actualizada
 */
router.put('/rewards/:id', authenticate, requireRole('admin'), updateReward);

/**
 * @swagger
 * /api/loyalty/rewards/{id}:
 *   delete:
 *     tags: [Loyalty]
 *     summary: Eliminar recompensa (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recompensa eliminada
 */
router.delete('/rewards/:id', authenticate, requireRole('admin'), deleteReward);

// ==================== REDEEM REWARDS ====================

/**
 * @swagger
 * /api/loyalty/redeem:
 *   post:
 *     tags: [Loyalty]
 *     summary: Canjear recompensa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rewardId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recompensa canjeada exitosamente
 */
router.post('/redeem', authenticate, redeemReward);

/**
 * @swagger
 * /api/loyalty/my-rewards:
 *   get:
 *     tags: [Loyalty]
 *     summary: Obtener mis recompensas canjeadas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de recompensas canjeadas
 */
router.get('/my-rewards', authenticate, getMyRedeemedRewards);

/**
 * @swagger
 * /api/loyalty/my-rewards/{id}/use:
 *   post:
 *     tags: [Loyalty]
 *     summary: Usar recompensa canjeada
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recompensa utilizada exitosamente
 */
router.post('/my-rewards/:id/use', authenticate, useRedeemedReward);

/**
 * @swagger
 * /api/loyalty/validate-coupon:
 *   post:
 *     tags: [Loyalty]
 *     summary: Validar cupón de recompensa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cupón validado
 */
router.post('/validate-coupon', validateCoupon);

module.exports = router;

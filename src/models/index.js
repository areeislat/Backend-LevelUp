// ===================================
// INDEX DE MODELOS - LEVELUPGAMER BACKEND
// ===================================

// Auth & User
const User = require('./auth/User');
const Session = require('./auth/Session');

// Catalog
const Category = require('./catalog/Category');
const Product = require('./catalog/Product');
const Review = require('./catalog/Review');

// Orders
const Cart = require('./orders/Cart');
const Order = require('./orders/Order');
const Payment = require('./orders/Payment');

// Loyalty
const LoyaltyAccount = require('./loyalty/LoyaltyAccount');
const PointsTransaction = require('./loyalty/PointsTransaction');
const Reward = require('./loyalty/Reward');
const RedeemedReward = require('./loyalty/RedeemedReward');

// Support
const Ticket = require('./support/Ticket');
const Notification = require('./support/Notification');

module.exports = {
  // Auth & User
  User,
  Session,
  
  // Catalog
  Category,
  Product,
  Review,
  
  // Orders
  Cart,
  Order,
  Payment,
  
  // Loyalty
  LoyaltyAccount,
  PointsTransaction,
  Reward,
  RedeemedReward,
  
  // Support
  Ticket,
  Notification,
  
  // Tenant
  Tenant
};
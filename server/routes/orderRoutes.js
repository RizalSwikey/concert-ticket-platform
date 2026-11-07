const express = require('express');
const router = express.Router();
const {
  checkout,
  getOrderById,
  getUserOrders
} = require('../controllers/orderController');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

router.post('/checkout', optionalAuth, checkout);
router.get('/:id', optionalAuth, getOrderById);
router.get('/user/:userId', authMiddleware, getUserOrders);

module.exports = router;

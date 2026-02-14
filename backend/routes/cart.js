const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

// All cart routes require authentication
router.use(authMiddleware);

// Cart operations
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove/:productId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

// Coupon operations
router.post('/coupon/apply', cartController.applyCoupon);
router.delete('/coupon/remove', cartController.removeCoupon);

module.exports = router;

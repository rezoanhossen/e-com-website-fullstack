const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { optionalAuthMiddleware } = require('../middleware/auth');

// All routes use optional authentication (guest can add to cart)
router.use(optionalAuthMiddleware);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove/:productId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);

module.exports = router;

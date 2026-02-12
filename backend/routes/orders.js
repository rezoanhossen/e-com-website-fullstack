const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// User routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);
router.delete('/:id/cancel', orderController.cancelOrder);

// Admin routes
router.get('/all', adminMiddleware, orderController.getAllOrders);
router.put('/:id/status', adminMiddleware, orderController.updateOrderStatus);

module.exports = router;

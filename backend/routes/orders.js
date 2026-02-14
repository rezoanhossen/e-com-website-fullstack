const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// User routes
router.get('/', orderController.getUserOrders);
router.get('/summary', orderController.getOrderSummary);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/return', orderController.returnOrder);

// Admin routes
router.get('/admin/all', adminMiddleware, orderController.getAllOrders);
router.get('/admin/stats', adminMiddleware, orderController.getDashboardStats);
router.put('/:id/status', adminMiddleware, orderController.updateOrderStatus);
router.put('/:id/payment-status', adminMiddleware, orderController.updatePaymentStatus);

module.exports = router;

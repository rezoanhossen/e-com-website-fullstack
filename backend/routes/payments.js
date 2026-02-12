const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create PhonePe order for payment (authenticated)
router.post('/create-order', authMiddleware, paymentController.createPaymentOrder);

// Verify payment status (authenticated)
router.post('/verify', authMiddleware, paymentController.verifyPayment);

// PhonePe callback handler (no auth - PhonePe server calls this)
router.post('/callback', paymentController.handlePaymentCallback);

// Handle payment failure (authenticated)
router.post('/failure', authMiddleware, paymentController.handlePaymentFailure);

// Get payment details for an order (authenticated)
router.get('/details/:orderId', authMiddleware, paymentController.getPaymentDetails);

// Refund a payment (authenticated)
router.post('/refund', authMiddleware, paymentController.refundPayment);

module.exports = router;


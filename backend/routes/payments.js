const express = require('express');
const stripePaymentController = require('../controllers/stripePaymentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Stripe payment routes
router.post('/stripe/create-intent', authMiddleware, stripePaymentController.createPaymentIntent);
router.post('/stripe/complete', authMiddleware, stripePaymentController.completePayment);
router.get('/stripe/status/:paymentIntentId', authMiddleware, stripePaymentController.getPaymentStatus);

// Cash on delivery
router.post('/cod', authMiddleware, stripePaymentController.cashOnDelivery);

module.exports = router;


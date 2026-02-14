const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/active', couponController.getActiveCoupons);
router.post('/validate', authMiddleware, couponController.validateCoupon);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, couponController.getAllCoupons);
router.get('/stats', authMiddleware, adminMiddleware, couponController.getCouponStats);
router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);
router.put('/:id', authMiddleware, adminMiddleware, couponController.updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);

module.exports = router;

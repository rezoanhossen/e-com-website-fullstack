const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, adminMiddleware, couponController.getCoupons);
router.post('/validate', couponController.validateCoupon);
router.post('/record-usage', authMiddleware, couponController.recordCouponUsage);
router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);
router.put('/:id', authMiddleware, adminMiddleware, couponController.updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);

module.exports = router;

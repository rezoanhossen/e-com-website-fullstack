const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Authenticated user routes
router.post('/', authMiddleware, reviewController.createReview);
router.put('/:reviewId', authMiddleware, reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);
router.post('/:reviewId/helpful', authMiddleware, reviewController.markHelpful);
router.post('/:reviewId/unhelpful', authMiddleware, reviewController.markUnhelpful);

// Admin routes
router.get('/admin/pending', authMiddleware, adminMiddleware, reviewController.getPendingReviews);
router.post('/:reviewId/approve', authMiddleware, adminMiddleware, reviewController.approveReview);
router.post('/:reviewId/reject', authMiddleware, adminMiddleware, reviewController.rejectReview);

module.exports = router;

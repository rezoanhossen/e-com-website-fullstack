const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification-email', authController.resendVerificationEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Address management
router.post('/address', authMiddleware, authController.addAddress);
router.put('/address/:addressId', authMiddleware, authController.updateAddress);
router.delete('/address/:addressId', authMiddleware, authController.deleteAddress);

// Wishlist
router.post('/wishlist', authMiddleware, authController.addToWishlist);
router.delete('/wishlist/:productId', authMiddleware, authController.removeFromWishlist);
router.get('/wishlist', authMiddleware, authController.getWishlist);

// Recently viewed
router.post('/recently-viewed', authMiddleware, authController.addToRecentlyViewed);
router.get('/recently-viewed', authMiddleware, authController.getRecentlyViewed);

module.exports = router;

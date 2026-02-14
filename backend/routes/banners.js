const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', bannerController.getBanners);
router.get('/hero', bannerController.getHeroBanners);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, bannerController.getAllBanners);
router.post('/', authMiddleware, adminMiddleware, bannerController.createBanner);
router.put('/:id', authMiddleware, adminMiddleware, bannerController.updateBanner);
router.delete('/:id', authMiddleware, adminMiddleware, bannerController.deleteBanner);
router.post('/reorder', authMiddleware, adminMiddleware, bannerController.reorderBanners);

module.exports = router;

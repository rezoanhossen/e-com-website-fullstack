const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/search', productController.searchProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/featured', productController.getFeaturedProducts);
router.get('/flash-sale', productController.getFlashSaleProducts);
router.get('/related/:id', productController.getRelatedProducts);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);
router.get('/admin/low-stock', authMiddleware, adminMiddleware, productController.getLowStockProducts);

module.exports = router;

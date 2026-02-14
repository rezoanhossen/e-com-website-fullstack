const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategory);

// Admin routes
router.get('/admin/all', authMiddleware, adminMiddleware, categoryController.getAllCategories);
router.post('/', authMiddleware, adminMiddleware, categoryController.createCategory);
router.put('/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router;

const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single category with products
exports.getCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const products = await Product.find({ category: category.name })
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await Product.countDocuments({ category: category.name });

    res.json({
      category,
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, icon } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const category = new Category({
      name,
      slug,
      description,
      image,
      icon,
      isActive: true
    });

    await category.save();
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, image, icon, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug: name ? name.toLowerCase().replace(/\s+/g, '-') : undefined,
        description,
        image,
        icon,
        isActive,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

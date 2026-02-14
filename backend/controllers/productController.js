const Product = require('../models/Product');
const Review = require('../models/Review');

// Get all products with filtering and pagination
exports.getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      minPrice, 
      maxPrice, 
      size,
      color,
      rating,
      search,
      sort = '-createdAt',
      isFeatured,
      isNewArrival,
      isTrending
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Size filter
    if (size) {
      filter.sizes = { $in: size.split(',') };
    }

    // Color filter
    if (color) {
      filter.colors = { $in: color.split(',') };
    }

    // Rating filter
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Feature filters
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isNewArrival === 'true') filter.isNewArrival = true;
    if (isTrending === 'true') filter.isTrending = true;

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product with reviews
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get reviews
    const reviews = await Review.find({ productId: req.params.id, isApproved: true })
      .populate('userId', 'name');

    res.json({ ...product._doc, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get related products
exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: req.params.id }
    }).limit(4);

    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get trending products
exports.getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.find({ isTrending: true })
      .limit(8)
      .sort('-rating');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get new arrivals
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .limit(8)
      .sort('-createdAt');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .limit(8)
      .sort('-rating');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get flash sale products
exports.getFlashSaleProducts = async (req, res) => {
  try {
    const now = new Date();
    const products = await Product.find({
      'flashSale.isActive': true,
      'flashSale.startDate': { $lte: now },
      'flashSale.endDate': { $gte: now }
    }).limit(10);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, sizes, colors, stock, material, brand } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice: price,
      category,
      images: images || ['https://via.placeholder.com/300'],
      sizes: sizes || ['S', 'M', 'L', 'XL', 'XXL'],
      colors: colors || [],
      stock: stock || 0,
      material,
      brand
    });

    await product.save();
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, images, sizes, colors, stock, material, brand, discount, isFeatured, isNewArrival, isTrending } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        price, 
        category, 
        images, 
        sizes, 
        colors, 
        stock,
        material,
        brand,
        discount,
        isFeatured,
        isNewArrival,
        isTrending,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete associated reviews
    await Review.deleteMany({ productId: req.params.id });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await Product.find({
      $text: { $search: q }
    }).limit(20);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

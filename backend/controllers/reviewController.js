const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId: req.params.productId, isApproved: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalReviews = await Review.countDocuments({ productId: req.params.productId, isApproved: true });

    res.json({
      reviews,
      totalReviews,
      totalPages: Math.ceil(totalReviews / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      userId: req.user.id,
      'items.productId': productId
    });

    if (!order) {
      return res.status(403).json({ message: 'You can only review products you have purchased' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const user = await require('../models/User').findById(req.user.id);

    const review = new Review({
      productId,
      userId: req.user.id,
      orderId: order._id,
      userName: user.name,
      rating,
      title,
      comment,
      images: images || [],
      isApproved: false // Reviews need admin approval
    });

    await review.save();

    // Update product rating
    const reviews = await Review.find({ productId, isApproved: true });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, { rating: avgRating, totalReviews: reviews.length });
    }

    res.status(201).json({ message: 'Review submitted and is pending approval', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;

    const review = await Review.findOne({
      _id: req.params.reviewId,
      userId: req.user.id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found or you do not have permission to update it' });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;
    
    review.updatedAt = Date.now();
    await review.save();

    // Update product rating
    const reviews = await Review.find({ productId: review.productId, isApproved: true });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(review.productId, { rating: avgRating });
    }

    res.json({ message: 'Review updated successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      userId: req.user.id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.reviewId);

    // Update product rating
    const reviews = await Review.find({ productId, isApproved: true });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(productId, { rating: avgRating, totalReviews: reviews.length });
    } else {
      await Product.findByIdAndUpdate(productId, { rating: 0, totalReviews: 0 });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all reviews pending approval
exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .populate('userId', 'name email')
      .populate('productId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Approve review
exports.approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update product rating
    const reviews = await Review.find({ productId: review.productId, isApproved: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(review.productId, { rating: avgRating, totalReviews: reviews.length });

    res.json({ message: 'Review approved', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Reject/Delete review
exports.rejectReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review rejected and deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    res.json({ message: 'Marked as helpful', helpful: review.helpful });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark review as unhelpful
exports.markUnhelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { unhelpful: 1 } },
      { new: true }
    );

    res.json({ message: 'Marked as unhelpful', unhelpful: review.unhelpful });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

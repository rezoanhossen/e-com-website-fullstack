const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');

// Get all orders for user
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalOrders = await Order.countDocuments({ userId: req.user.id });
    
    res.json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order with full details
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId')
      .populate('userId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalOrders = await Order.countDocuments(filter);
    
    res.json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        trackingNumber: trackingNumber || null,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('items.productId').populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];

    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If payment completed and was pending, change order status to processing
    if (paymentStatus === 'completed' && order.status === 'pending') {
      order.status = 'processing';
      await order.save();
    }

    res.json({ message: 'Payment status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Return order
exports.returnOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    // Check if order is within 30 days
    const daysSinceDelivery = Math.floor((Date.now() - order.createdAt) / (1000 * 60 * 60 * 24));
    if (daysSinceDelivery > 30) {
      return res.status(400).json({ message: 'Return period expired' });
    }

    order.status = 'returned';
    order.updatedAt = Date.now();
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({ message: 'Return request submitted successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } }
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      monthlyRevenue,
      orderStatusBreakdown,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order summary for checkout
exports.getOrderSummary = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    res.json({
      items: cart.items,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      discount: cart.discount,
      total: cart.totalPrice,
      appliedCoupon: cart.appliedCoupon
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

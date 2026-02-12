const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;

    // Validate shipping address
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Missing shipping address or payment method' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify stock and prepare order items
    let totalPrice = cart.totalPrice;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Product ${product?.name} is out of stock or insufficient quantity` 
        });
      }

      orderItems.push({
        productId: item.productId._id,
        productName: item.productId.name,
        quantity: item.quantity,
        price: item.price
      });
    }

    // Apply coupon if provided
    let appliedCoupon = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (coupon && new Date() <= coupon.expiryDate && coupon.active) {
        const discount = (totalPrice * coupon.discountPercentage) / 100;
        totalPrice -= discount;
        appliedCoupon = {
          couponId: coupon._id,
          discount
        };
      }
    }

    // Create order
    const order = new Order({
      userId: req.userId,
      items: orderItems,
      totalPrice,
      shippingAddress,
      paymentMethod,
      appliedCoupon,
      status: 'pending'
    });

    await order.save();

    // Deduct stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear cart
    await Cart.deleteOne({ userId: req.userId });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.status !== 'pending' && order.status !== 'processing') {
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

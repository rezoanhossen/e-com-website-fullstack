const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const Product = require('../models/Product');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// Create Stripe payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete payment and create order
exports.completePayment = async (req, res) => {
  try {
    const { paymentIntentId, shippingAddress, deliveryMethod, paymentMethod, appliedCoupon } = req.body;

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock for all items
    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product?.name || 'Product'}` 
        });
      }
    }

    // Validate coupon if provided
    let discount = 0;
    if (appliedCoupon && appliedCoupon.code) {
      const coupon = await Coupon.findOne({ code: appliedCoupon.code });
      if (coupon && coupon.isActive && new Date() <= coupon.expiryDate) {
        if (coupon.discountType === 'percentage') {
          discount = Math.round(cart.subtotal * (coupon.discountValue / 100) * 100) / 100;
        } else {
          discount = coupon.discountValue;
        }

        // Update coupon usage
        coupon.usageCount += 1;
        coupon.usedByUsers.push({ userId: req.user.id });
        await coupon.save();
      }
    }

    // Calculate final totals
    const TAX_RATE = 0.1;
    const tax = Math.round(cart.subtotal * TAX_RATE * 100) / 100;
    const shipping = deliveryMethod === 'express' ? 25 : deliveryMethod === 'overnight' ? 50 : 10;
    const totalPrice = Math.round((cart.subtotal - discount + tax + shipping) * 100) / 100;

    // Create order
    const order = new Order({
      userId: req.user.id,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        image: item.image
      })),
      subtotal: cart.subtotal,
      tax: tax,
      shippingCost: shipping,
      discount: discount,
      totalPrice: totalPrice,
      shippingAddress: shippingAddress,
      deliveryMethod: deliveryMethod || 'standard',
      paymentMethod: paymentMethod || 'stripe',
      paymentStatus: 'completed',
      stripePaymentId: paymentIntent.id,
      stripeChargeId: paymentIntent.charges.data[0]?.id || null,
      transactionId: paymentIntent.id,
      status: 'processing',
      appliedCoupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discount: discount
      } : null
    });

    await order.save();

    // Update product stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(req.user.email, order);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError.message);
    }

    // Clear cart
    await Cart.updateOne(
      { userId: req.user.id },
      { 
        items: [],
        appliedCoupon: null,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalPrice: 0
      }
    );

    res.json({
      message: 'Order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        status: order.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle cash on delivery
exports.cashOnDelivery = async (req, res) => {
  try {
    const { shippingAddress, deliveryMethod, appliedCoupon } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock
    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product?.name || 'Product'}` 
        });
      }
    }

    // Validate coupon if provided
    let discount = 0;
    if (appliedCoupon && appliedCoupon.code) {
      const coupon = await Coupon.findOne({ code: appliedCoupon.code });
      if (coupon && coupon.isActive && new Date() <= coupon.expiryDate) {
        if (coupon.discountType === 'percentage') {
          discount = Math.round(cart.subtotal * (coupon.discountValue / 100) * 100) / 100;
        } else {
          discount = coupon.discountValue;
        }

        coupon.usageCount += 1;
        coupon.usedByUsers.push({ userId: req.user.id });
        await coupon.save();
      }
    }

    // Calculate totals
    const TAX_RATE = 0.1;
    const tax = Math.round(cart.subtotal * TAX_RATE * 100) / 100;
    const shipping = deliveryMethod === 'express' ? 25 : deliveryMethod === 'overnight' ? 50 : 10;
    const totalPrice = Math.round((cart.subtotal - discount + tax + shipping) * 100) / 100;

    // Create order
    const order = new Order({
      userId: req.user.id,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        image: item.image
      })),
      subtotal: cart.subtotal,
      tax: tax,
      shippingCost: shipping,
      discount: discount,
      totalPrice: totalPrice,
      shippingAddress: shippingAddress,
      deliveryMethod: deliveryMethod || 'standard',
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'pending',
      appliedCoupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discount: discount
      } : null
    });

    await order.save();

    // Update product stock
    for (let item of cart.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(req.user.email, order);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError.message);
    }

    // Clear cart
    await Cart.updateOne(
      { userId: req.user.id },
      { 
        items: [],
        appliedCoupon: null,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalPrice: 0
      }
    );

    res.json({
      message: 'Order created successfully - Payment pending on delivery',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentStatus: 'pending'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

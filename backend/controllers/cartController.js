const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Calculate cart totals
const calculateCartTotals = (cart) => {
  const TAX_RATE = 0.1; // 10% tax
  const SHIPPING_COST = 10; // Flat shipping cost

  let subtotal = 0;
  cart.items.forEach(item => {
    subtotal += item.price * item.quantity;
  });

  let discount = 0;
  if (cart.appliedCoupon) {
    discount = cart.appliedCoupon.discount;
  }

  const afterDiscount = subtotal - discount;
  const tax = Math.round(afterDiscount * TAX_RATE * 100) / 100;
  const shipping = cart.items.length > 0 ? SHIPPING_COST : 0;
  const total = afterDiscount + tax + shipping;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: tax,
    shipping: shipping,
    total: Math.round(total * 100) / 100
  };
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    
    if (!cart || cart.items.length === 0) {
      return res.json({ 
        items: [], 
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0
      });
    }

    const totals = calculateCartTotals(cart);
    
    res.json({
      ...cart._doc,
      ...totals
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid product or quantity' });
    }

    // Get product details
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        totalPrice: 0
      });
    }

    // Check if product already in cart (with same size/color)
    const existingItem = cart.items.find(item => 
      item.productId.toString() === productId && 
      item.size === size && 
      item.color === color
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        productName: product.name,
        image: product.images[0],
        quantity,
        price: product.price - (product.price * product.discount / 100),
        size,
        color,
        addedAt: Date.now()
      });
    }

    // Calculate totals
    const totals = calculateCartTotals(cart);
    cart.subtotal = totals.subtotal;
    cart.tax = totals.tax;
    cart.shipping = totals.shipping;
    cart.totalPrice = totals.total;
    cart.updatedAt = Date.now();

    await cart.save();
    await cart.populate('items.productId');

    res.json({ message: 'Product added to cart', cart: { ...cart._doc, ...totals } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item => 
      item.productId.toString() === productId && 
      item.size === size && 
      item.color === color
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items = cart.items.filter(item => 
        !(item.productId.toString() === productId && item.size === size && item.color === color)
      );
    } else {
      // Check stock
      const product = await Product.findById(productId);
      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      item.quantity = quantity;
    }

    // Recalculate totals
    const totals = calculateCartTotals(cart);
    cart.subtotal = totals.subtotal;
    cart.tax = totals.tax;
    cart.shipping = totals.shipping;
    cart.totalPrice = totals.total;
    cart.updatedAt = Date.now();

    await cart.save();
    await cart.populate('items.productId');

    res.json({ message: 'Cart updated', cart: { ...cart._doc, ...totals } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, color } = req.query;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => 
      !(item.productId.toString() === productId && item.size === size && item.color === color)
    );

    // Recalculate totals
    const totals = calculateCartTotals(cart);
    cart.subtotal = totals.subtotal;
    cart.tax = totals.tax;
    cart.shipping = totals.shipping;
    cart.totalPrice = totals.total;
    cart.updatedAt = Date.now();

    await cart.save();
    await cart.populate('items.productId');

    res.json({ message: 'Item removed from cart', cart: { ...cart._doc, ...totals } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply coupon
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is expired or inactive' });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check min purchase amount
    const subtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    if (subtotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase of $${coupon.minPurchaseAmount} required` });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round(subtotal * (coupon.discountValue / 100) * 100) / 100;
    } else {
      discount = coupon.discountValue;
    }

    cart.appliedCoupon = {
      code: coupon.code,
      discount: discount
    };

    // Recalculate totals
    const totals = calculateCartTotals(cart);
    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.tax = totals.tax;
    cart.shipping = totals.shipping;
    cart.totalPrice = totals.total;
    cart.updatedAt = Date.now();

    await cart.save();

    res.json({ message: `Coupon applied! You saved $${discount}`, cart: { ...cart._doc, ...totals } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove coupon
exports.removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.appliedCoupon = null;

    // Recalculate totals
    const totals = calculateCartTotals(cart);
    cart.subtotal = totals.subtotal;
    cart.discount = totals.discount;
    cart.tax = totals.tax;
    cart.shipping = totals.shipping;
    cart.totalPrice = totals.total;
    cart.updatedAt = Date.now();

    await cart.save();

    res.json({ message: 'Coupon removed', cart: { ...cart._doc, ...totals } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    cart.appliedCoupon = null;
    cart.subtotal = 0;
    cart.tax = 0;
    cart.shipping = 0;
    cart.discount = 0;
    cart.totalPrice = 0;
    cart.updatedAt = Date.now();
    
    await cart.save();

    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

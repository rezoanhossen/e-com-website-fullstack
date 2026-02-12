const Coupon = require('../models/Coupon');

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const { code, userId } = req.body;
    const coupon = await Coupon.findOne({ code, active: true });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Coupon expired' });
    }

    // Check if coupon is one-time per user and user has already used it
    if (coupon.isOneTimePerUser && userId) {
      const userHasUsed = coupon.usedByUsers.some(u => u.userId.toString() === userId);
      if (userHasUsed) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate, isOneTimePerUser } = req.body;

    if (!code || !discountPercentage || !expiryDate) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code,
      discountPercentage,
      expiryDate,
      isOneTimePerUser: isOneTimePerUser || false,
      usedByUsers: []
    });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { code, discountPercentage, expiryDate, active, isOneTimePerUser } = req.body;
    
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { code, discountPercentage, expiryDate, active, isOneTimePerUser },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Record coupon usage for a user
exports.recordCouponUsage = async (req, res) => {
  try {
    const { couponId, userId } = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if coupon is one-time per user
    if (coupon.isOneTimePerUser) {
      const userHasUsed = coupon.usedByUsers.some(u => u.userId.toString() === userId);
      if (userHasUsed) {
        return res.status(400).json({ message: 'User has already used this coupon' });
      }

      // Add user to usedByUsers array
      coupon.usedByUsers.push({ userId });
      await coupon.save();
    }

    res.json({ message: 'Coupon usage recorded successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

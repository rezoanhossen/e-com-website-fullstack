const Coupon = require('../models/Coupon');

// User: Get active coupons
exports.getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() }
    }).select('code description discountType discountValue minPurchaseAmount');

    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User: Validate coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() }
    });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid or expired coupon' });
    }

    // Check minimum purchase amount
    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({ 
        message: `Minimum purchase of $${coupon.minPurchaseAmount} required` 
      });
    }

    // Check max uses
    if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'This coupon has reached its usage limit' });
    }

    // Check user-specific usage
    const userUsageCount = coupon.usedByUsers.filter(
      u => u.userId.toString() === req.user.id
    ).length;

    if (userUsageCount >= coupon.maxUsesPerUser) {
      return res.status(400).json({ 
        message: `You have already used this coupon ${coupon.maxUsesPerUser} time(s)` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round(cartTotal * (coupon.discountValue / 100) * 100) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      message: 'Coupon is valid',
      discount: discountAmount,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 20, isActive } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const coupons = await Coupon.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCoupons = await Coupon.countDocuments(filter);

    res.json({
      coupons,
      totalCoupons,
      totalPages: Math.ceil(totalCoupons / limit),
      currentPage: Number(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Create coupon
exports.createCoupon = async (req, res) => {
  try {
    const { 
      code, 
      description,
      discountType,
      discountValue, 
      minPurchaseAmount,
      maxUses,
      expiryDate,
      applicableCategories 
    } = req.body;

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    // Validate discount value
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({ message: 'Percentage discount cannot exceed 100%' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxUses: maxUses || null,
      expiryDate,
      applicableCategories: applicableCategories || [],
      isActive: true
    });

    await coupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { 
      code, 
      description,
      discountType,
      discountValue, 
      minPurchaseAmount,
      maxUses,
      expiryDate,
      isActive,
      applicableCategories 
    } = req.body;
    
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { 
        code: code ? code.toUpperCase() : undefined,
        description,
        discountType,
        discountValue,
        minPurchaseAmount,
        maxUses,
        expiryDate,
        isActive,
        applicableCategories,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get coupon statistics
exports.getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ 
      isActive: true,
      expiryDate: { $gte: new Date() }
    });

    // Most used coupons
    const mostUsedCoupons = await Coupon.find()
      .sort({ usageCount: -1 })
      .limit(5)
      .select('code discountValue usageCount');

    // Total discount given
    const totalDiscountGiven = await Coupon.aggregate([
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $cond: [
                { $eq: ['$discountType', 'percentage'] },
                0,
                { $multiply: ['$discountValue', '$usageCount'] }
              ]
            }
          }
        }
      }
    ]);

    res.json({
      totalCoupons,
      activeCoupons,
      mostUsedCoupons,
      totalDiscountGiven: totalDiscountGiven[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

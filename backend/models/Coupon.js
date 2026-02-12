const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discountPercentage: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  isOneTimePerUser: {
    type: Boolean,
    default: false,
    description: 'If true, coupon can only be used once per user'
  },
  usedByUsers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      usedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Coupon', couponSchema);

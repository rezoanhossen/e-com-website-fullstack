const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalPrice: {
    type: Number,
    required: true
  },
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['upi', 'google-pay', 'phonepe', 'paytm', 'bhim', 'credit-card', 'debit-card', 'paypal', 'bank-transfer'],
    required: true
  },
  // Payment tracking fields for PhonePe
  paymentStatus: {
    type: String,
    enum: ['pending', 'initiated', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  phonpeTransactionId: String,
  phonpePaymentId: String,
  transactionId: String,
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  appliedCoupon: {
    couponId: mongoose.Schema.Types.ObjectId,
    discount: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);

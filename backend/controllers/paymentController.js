const crypto = require('crypto');
const axios = require('axios');
const Order = require('../models/Order');

// PhonePe Configuration
const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL || 'https://api.phonepe.com/apis/heroku/pg/v1';
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX || '1';
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:5000/api/payments/callback';

// Generate X-VERIFY header for PhonePe API
const generatePhonepeSignature = (body, endpoint) => {
  const payload = Buffer.from(JSON.stringify(body)).toString('base64');
  const string = payload + endpoint + PHONEPE_SALT_KEY;
  const hash = crypto.createHash('sha256').update(string).digest('hex');
  const xVerify = hash + '###' + PHONEPE_SALT_INDEX;
  return { payload, xVerify };
};

// Create PhonePe Payment Order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${orderId}_${Date.now()}`;

    // Prepare PhonePe request body
    const body = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: req.userId,
      amount: Math.round(amount * 100), // Amount in paise
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-confirmation/${orderId}?status=success`,
      redirectMode: 'REDIRECT',
      callbackUrl: CALLBACK_URL,
      mobileNumber: order.shippingAddress?.phone || '9999999999',
      paymentInstrument: {
        type: 'UPI'
      }
    };

    // Generate signature
    const { payload, xVerify } = generatePhonepeSignature(
      body,
      '/pg/v1/pay'
    );

    // Update order with PhonePe transaction ID
    order.phonpeTransactionId = transactionId;
    order.paymentStatus = 'initiated';
    await order.save();

    // Prepare response with payment URL
    const paymentUrl = `${PHONEPE_HOST_URL}/pay`;

    res.json({
      success: true,
      data: {
        transactionId,
        paymentUrl,
        payload,
        xVerify,
        merchantId: PHONEPE_MERCHANT_ID
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify Payment Status from PhonePe
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;

    // Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Prepare status check body
    const statusCheckBody = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId
    };

    // Generate signature for status check
    const string = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}` + PHONEPE_SALT_KEY;
    const hash = crypto.createHash('sha256').update(string).digest('hex');
    const xVerify = hash + '###' + PHONEPE_SALT_INDEX;

    // Call PhonePe status API
    const response = await axios.get(
      `${PHONEPE_HOST_URL}/status/${PHONEPE_MERCHANT_ID}/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': PHONEPE_MERCHANT_ID
        }
      }
    );

    // Check if payment was successful
    if (response.data?.success && response.data?.code === 'PAYMENT_SUCCESS') {
      // Update order with payment details
      const paymentData = response.data?.data;
      
      order.phonpeTransactionId = transactionId;
      order.phonpePaymentId = paymentData?.transactionId || transactionId;
      order.paymentStatus = 'success';
      order.status = 'processing';
      order.transactionId = transactionId;
      await order.save();

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        order
      });
    } else {
      // Payment failed
      order.paymentStatus = 'failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Payment failed',
        details: response.data
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification error',
      error: error.message
    });
  }
};

// PhonePe Callback Handler
exports.handlePaymentCallback = async (req, res) => {
  try {
    const { success, code, data, merchantTransactionId } = req.body;

    // Extract order ID from transaction ID (TXN_orderId_timestamp)
    const orderId = merchantTransactionId.split('_')[1];
    
    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (success && code === 'PAYMENT_SUCCESS') {
      // Payment successful
      order.phonpeTransactionId = merchantTransactionId;
      order.phonpePaymentId = data?.transactionId || merchantTransactionId;
      order.paymentStatus = 'success';
      order.status = 'processing';
      order.transactionId = merchantTransactionId;
      await order.save();

      console.log(`✓ Payment successful for order ${orderId}`);
      return res.json({ success: true, message: 'Payment recorded successfully' });
    } else {
      // Payment failed
      order.paymentStatus = 'failed';
      await order.save();

      console.log(`❌ Payment failed for order ${orderId}`);
      return res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error handling callback:', error);
    res.status(500).json({
      success: false,
      message: 'Callback processing error',
      error: error.message
    });
  }
};



// Handle Payment Failure
exports.handlePaymentFailure = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'failed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.log(`Payment failure recorded for order ${orderId}`);
    res.json({
      success: true,
      message: 'Payment failure recorded',
      order
    });
  } catch (error) {
    console.error('Error handling payment failure:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling payment failure',
      error: error.message
    });
  }
};
// Get Payment Details for an Order
exports.getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({
      success: true,
      payment: {
        paymentStatus: order.paymentStatus,
        phonpeTransactionId: order.phonpeTransactionId,
        phonpePaymentId: order.phonpePaymentId,
        transactionId: order.transactionId,
        amount: order.totalPrice,
        paymentMethod: order.paymentMethod
      },
      order
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details',
      error: error.message
    });
  }
};

// Request Refund via PhonePe
exports.refundPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify user owns this order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Only refund if payment was successful
    if (order.paymentStatus !== 'success' || !order.phonpeTransactionId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot refund - payment not completed'
      });
    }

    // Prepare refund body
    const refundId = `REF_${orderId}_${Date.now()}`;
    const body = {
      merchantId: PHONEPE_MERCHANT_ID,
      originalTransactionId: order.phonpeTransactionId,
      refundTransactionId: refundId,
      refundAmount: Math.round(order.totalPrice * 100), // Amount in paise
      callbackUrl: CALLBACK_URL
    };

    // Generate signature for refund
    const { payload, xVerify } = generatePhonepeSignature(
      body,
      '/pg/v1/refund'
    );

    // Call PhonePe refund API
    const refundResponse = await axios.post(
      `${PHONEPE_HOST_URL}/refund`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify
        }
      }
    );

    if (refundResponse.data?.success) {
      // Update order status
      order.paymentStatus = 'refunded';
      order.status = 'cancelled';
      await order.save();

      console.log(`✓ Refund initiated for order ${orderId}`);
      res.json({
        success: true,
        message: 'Refund initiated successfully',
        refundId,
        amount: order.totalPrice
      });
    } else {
      console.error('PhonePe refund failed:', refundResponse.data);
      res.status(400).json({
        success: false,
        message: 'Refund failed',
        details: refundResponse.data
      });
    }
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};


import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Create a PhonePe payment order
 * @param {string} orderId - The order ID in your system
 * @param {number} amount - Order amount in rupees
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} - { transactionId, paymentUrl, payload, xVerify }
 */
export const createPaymentOrder = async (orderId, amount, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payments/create-order`,
      {
        orderId,
        amount
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      ...response.data.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create payment order',
      error
    };
  }
};

/**
 * Verify payment status with PhonePe
 * @param {string} orderId - The order ID in your system
 * @param {string} transactionId - PhonePe transaction ID
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} - { success, message, order }
 */
export const verifyPayment = async (
  orderId,
  transactionId,
  token
) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payments/verify`,
      {
        orderId,
        transactionId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: response.data.success,
      message: response.data.message,
      order: response.data.order
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Payment verification failed',
      error
    };
  }
};

/**
 * Record payment failure
 * @param {string} orderId - The order ID in your system
 * @param {string} token - JWT authentication token
 * @param {object} errorDetails - Error details from payment gateway
 * @returns {Promise<object>} - { success, message }
 */
export const recordPaymentFailure = async (orderId, token, errorDetails = {}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payments/failure`,
      {
        orderId,
        errorDetails
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: response.data.success,
      message: response.data.message
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to record payment failure',
      error
    };
  }
};

/**
 * Get payment details for an order
 * @param {string} orderId - The order ID in your system
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} - { success, payment, order }
 */
export const getPaymentDetails = async (orderId, token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/payments/details/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return {
      success: true,
      payment: response.data.payment,
      order: response.data.order
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch payment details',
      error
    };
  }
};

/**
 * Request refund for an order
 * @param {string} orderId - The order ID in your system
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} - { success, message, refundId }
 */
export const refundPayment = async (orderId, token) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payments/refund`,
      {
        orderId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: response.data.success,
      message: response.data.message,
      refundId: response.data.refundId
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to process refund',
      error
    };
  }
};


export default {
  createPaymentOrder,
  verifyPayment,
  recordPaymentFailure,
  getPaymentDetails,
  refundPayment
};


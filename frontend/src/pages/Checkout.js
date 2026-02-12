import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Checkout.css';

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [validCoupon, setValidCoupon] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    paymentMethod: 'google-pay',
    couponCode: ''
  });
  
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Load saved address from localStorage on mount
  React.useEffect(() => {
    const savedAddress = localStorage.getItem('shippingAddress');
    if (savedAddress) {
      try {
        setFormData(prev => ({
          ...prev,
          ...JSON.parse(savedAddress)
        }));
      } catch (err) {
        console.error('Error loading saved address:', err);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedFormData);
    
    // Auto-save address fields to localStorage
    if (['fullName', 'email', 'phone', 'address', 'city', 'zipCode', 'country'].includes(name)) {
      const addressData = {
        fullName: updatedFormData.fullName,
        email: updatedFormData.email,
        phone: updatedFormData.phone,
        address: updatedFormData.address,
        city: updatedFormData.city,
        zipCode: updatedFormData.zipCode,
        country: updatedFormData.country
      };
      localStorage.setItem('shippingAddress', JSON.stringify(addressData));
    }
  };

  const handleApplyCoupon = async () => {
    setCouponMessage('');
    
    if (!formData.couponCode.trim()) {
      setCouponMessage('❌ Please enter a coupon code');
      return;
    }

    try {
      const response = await axios.post('/api/coupons/validate', {
        code: formData.couponCode.trim()
      });

      // Backend returns coupon object directly on success
      const coupon = response.data;
      if (coupon && coupon.discountPercentage) {
        const discountPercentage = coupon.discountPercentage;
        const discountAmount = (cart.totalPrice * discountPercentage) / 100;
        
        setCouponDiscount(discountAmount);
        setValidCoupon(coupon);
        setCouponMessage(`✓ Coupon applied! ${discountPercentage}% off - Save ₹${discountAmount.toFixed(2)}`);
        setError('');
      } else {
        setCouponDiscount(0);
        setValidCoupon(null);
        setCouponMessage('❌ Invalid or expired coupon');
      }
    } catch (err) {
      setCouponDiscount(0);
      setValidCoupon(null);
      setCouponMessage(`❌ ${err.response?.data?.message || 'Error validating coupon'}`);
    }
  };

  const handleCancelCoupon = () => {
    setFormData(prev => ({
      ...prev,
      couponCode: ''
    }));
    setCouponDiscount(0);
    setValidCoupon(null);
    setCouponMessage('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!formData.address.trim()) {
      setError('❌ Please add an address to continue');
      return false;
    }
    if (!formData.city.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (!formData.zipCode.trim()) {
      setError('Please enter your ZIP code');
      return false;
    }
    if (!formData.country.trim()) {
      setError('Please enter your country');
      return false;
    }
    return true;
  };

  // Initialize PhonePe payment on checkout
  const initiatePhonePePayment = async (orderData) => {
    try {
      // Create PhonePe payment order
      const paymentOrderResponse = await axios.post('/api/payments/create-order', {
        orderId: orderData._id,
        amount: orderData.totalPrice
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!paymentOrderResponse.data.success) {
        setError('Failed to initiate payment');
        setPaymentProcessing(false);
        return;
      }

      const { data } = paymentOrderResponse.data;
      const { transactionId, payload, xVerify, paymentUrl } = data;

      // Create hidden form for PhonePe redirect
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;
      form.style.display = 'none';

      // Add hidden inputs
      const payloadInput = document.createElement('input');
      payloadInput.type = 'hidden';
      payloadInput.name = 'request';
      payloadInput.value = payload;

      const verifyInput = document.createElement('input');
      verifyInput.type = 'hidden';
      verifyInput.name = 'checksum';
      verifyInput.value = xVerify;

      form.appendChild(payloadInput);
      form.appendChild(verifyInput);
      document.body.appendChild(form);

      // Submit form to PhonePe
      form.submit();
    } catch (err) {
      console.error('Error initiating payment:', err);
      setError(err.response?.data?.message || 'Failed to initiate payment');
      setPaymentProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPaymentProcessing(false);

    // Check if user is logged in
    if (!token || !user) {
      setError('🔐 Please login to proceed with checkout');
      return;
    }

    // Validate form fields
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create order
      const orderResponse = await axios.post('/api/orders', {
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod,
        couponCode: formData.couponCode || undefined
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const orderData = orderResponse.data.order;

      // Check if payment method is UPI (PhonePe handles all UPI apps)
      const upiMethods = ['google-pay', 'phonepe', 'paytm', 'bhim'];
      if (upiMethods.includes(formData.paymentMethod)) {
        // Step 2: For UPI, initiate PhonePe payment
        setLoading(false);
        setPaymentProcessing(true);
        await initiatePhonePePayment(orderData);
      } else {
        // For other payment methods, complete order immediately
        await clearCart();
        setOrderPlaced(true);
        
        // Redirect to order confirmation
        setTimeout(() => {
          window.location.href = `/order-confirmation/${orderData._id}`;
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-container">
        <div className="success-message">
          <h2>✓ Order Placed Successfully!</h2>
          <p>Redirecting to order confirmation...</p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>Please add items to your cart before checking out</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login prompt
  if (!token || !user) {
    return (
      <div className="checkout-container">
        <div className="login-prompt-container">
          <div className="login-prompt">
            <h2>🔐 Login Required</h2>
            <p>Please login to your account to proceed with checkout</p>
            
            <div className="login-actions">
              <button 
                className="login-btn"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
              <button 
                className="register-btn"
                onClick={() => navigate('/register')}
              >
                Create New Account
              </button>
            </div>

            <div className="cart-info">
              <h3>Your Cart ({cart.items.length} items)</h3>
              <p>Total: ₹{cart.totalPrice.toFixed(2)}</p>
              <button 
                className="back-to-cart-btn"
                onClick={() => navigate('/cart')}
              >
                Back to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <div className="checkout-content">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <fieldset>
            <legend>Shipping Information</legend>
            
            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Street Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode">ZIP Code *</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country *</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Payment Method</legend>
            
            <div className="form-group">
              <label htmlFor="paymentMethod">Select Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                required
              >
                <optgroup label="UPI Payments">
                  <option value="google-pay">Google Pay</option>
                  <option value="phonepe">PhonePe</option>
                  <option value="paytm">Paytm</option>
                  <option value="bhim">BHIM</option>
                </optgroup>
                <optgroup label="Card Payments">
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="paypal">PayPal</option>
                  <option value="bank-transfer">Bank Transfer</option>
                </optgroup>
              </select>
            </div>
          </fieldset>

          <fieldset>
            <legend>Coupon Code (Optional)</legend>
            
            <div className="form-group coupon-group">
              <label htmlFor="couponCode">Apply Coupon Code</label>
              <div className="coupon-input-container">
                <input
                  type="text"
                  id="couponCode"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  placeholder="Enter coupon code"
                  disabled={validCoupon !== null}
                />
                {validCoupon ? (
                  <>
                    <button
                      type="button"
                      className="verify-coupon-btn applied"
                      disabled
                    >
                      ✓ Applied
                    </button>
                    <button
                      type="button"
                      className="cancel-coupon-btn"
                      onClick={handleCancelCoupon}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="verify-coupon-btn"
                    onClick={handleApplyCoupon}
                  >
                    ✓ Apply
                  </button>
                )}
              </div>
              {couponMessage && (
                <div className={`coupon-message ${couponMessage.includes('✓') ? 'success' : 'error'}`}>
                  {couponMessage}
                </div>
              )}
            </div>
          </fieldset>

          <button 
            type="submit" 
            className="place-order-btn"
            disabled={loading || paymentProcessing}
          >
            {loading ? 'Creating Order...' : paymentProcessing ? 'Redirecting to PhonePe...' : 'Place Order'}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-items">
            {cart.items.map(item => {
              // Handle both guest cart (product data embedded) and authenticated cart (productId reference)
              const productId = typeof item.productId === 'string' ? item.productId : item.productId?._id;
              const productData = typeof item.productId === 'object' ? item.productId : {};
              const itemName = productData.name || 'Product';
              const itemPrice = item.price || productData.price || 0;

              return (
                <div key={productId} className="summary-item">
                  <div className="summary-item-info">
                    <p className="item-name">{itemName}</p>
                    <p className="item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="item-price">₹{(itemPrice * item.quantity).toFixed(2)}</p>
                </div>
              );
            })}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{cart.totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            {couponDiscount > 0 && (
              <div className="summary-row discount-row">
                <span>Discount ({validCoupon?.discountPercentage}%)</span>
                <span style={{ color: '#28a745' }}>-₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="summary-row final-total">
              <span>Total</span>
              <span>₹{(cart.totalPrice - couponDiscount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

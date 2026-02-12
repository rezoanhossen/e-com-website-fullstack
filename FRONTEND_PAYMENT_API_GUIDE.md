# Frontend Payment Integration Guide

## Quick Start - Using Payment APIs

The frontend payment integration is already implemented in the Checkout component. However, you can also use the payment utilities directly in other components if needed.

## Payment API Functions

All functions are in `frontend/src/utils/paymentAPI.js`

### 1. Create Payment Order

**Purpose:** Create a Razorpay order before initiating payment

```javascript
import { createPaymentOrder } from '../utils/paymentAPI';

// In your component:
const orderId = "65f1234567890abcdef12345";
const amount = 1999.99; // in rupees
const token = "your_jwt_token";

const result = await createPaymentOrder(orderId, amount, token);

if (result.success) {
  console.log("Razorpay Order ID:", result.razorpayOrderId);
  console.log("Your Key ID:", result.keyId);
  console.log("Amount in paise:", result.amount);
} else {
  console.error("Error:", result.message);
}
```

**Response:**
```json
{
  "success": true,
  "razorpayOrderId": "order_1A2B3C4D5E6F",
  "keyId": "rzp_live_your_key",
  "amount": 199999
}
```

### 2. Verify Payment

**Purpose:** Verify payment signature after customer completes payment

```javascript
import { verifyPayment } from '../utils/paymentAPI';

// Called after Razorpay payment successful callback:
const result = await verifyPayment(
  orderId,                    // Your order ID
  razorpayOrderId,           // From createPaymentOrder response
  razorpayPaymentId,         // From payment success callback
  razorpaySignature,         // From payment success callback
  token                      // JWT token
);

if (result.success) {
  console.log("Payment verified successfully!");
  console.log("Order details:", result.order);
  // Redirect to order confirmation
  window.location.href = `/order-confirmation/${orderId}`;
} else {
  console.error("Verification failed:", result.message);
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": {
    "_id": "65f1234567890abcdef12345",
    "paymentStatus": "success",
    "status": "processing",
    "totalPrice": 1999.99
  }
}
```

### 3. Record Payment Failure

**Purpose:** Record when customer cancels payment in Razorpay modal

```javascript
import { recordPaymentFailure } from '../utils/paymentAPI';

// If user closes Razorpay modal without completing payment:
const result = await recordPaymentFailure(
  orderId,
  token,
  { reason: "User cancelled payment" } // optional
);

if (result.success) {
  console.log(result.message);
} else {
  console.error("Error recording failure:", result.message);
}
```

### 4. Get Payment Details

**Purpose:** Retrieve payment info for order confirmation or admin pages

```javascript
import { getPaymentDetails } from '../utils/paymentAPI';

const result = await getPaymentDetails(orderId, token);

if (result.success) {
  console.log("Payment Details:", result.payment);
  console.log("Order:", result.order);
} else {
  console.error("Error fetching details:", result.message);
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "razorpayOrderId": "order_...",
    "razorpayPaymentId": "pay_...",
    "paymentStatus": "success",
    "transactionId": "txn_..."
  },
  "order": { /* full order object */ }
}
```

### 5. Refund Payment

**Purpose:** Process refund for completed payments

```javascript
import { refundPayment } from '../utils/paymentAPI';

const result = await refundPayment(orderId, token);

if (result.success) {
  console.log("Refund processed!");
  console.log("Refund ID:", result.refundId);
} else {
  console.error("Refund failed:", result.message);
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refundId": "rfnd_1A2B3C4D5E6F"
}
```

### 6. Open Razorpay Modal

**Purpose:** Manually open Razorpay checkout modal

```javascript
import { openRazorpayModal } from '../utils/paymentAPI';

const options = {
  key: "your_razorpay_key",
  amount: 199999, // in paise
  currency: "INR",
  order_id: "order_...",
  name: "Your Shop Name",
  description: "Order Payment",
  prefill: {
    name: "Customer Name",
    email: "customer@example.com",
    contact: "9999999999"
  },
  handler: (response) => {
    // Success callback
    console.log("Payment successful:", response);
  },
  theme: {
    color: "#D4AF37"
  }
};

openRazorpayModal(options);
```

---

## Complete Example: Payment in a Custom Component

Here's how to integrate payments in a custom component:

```javascript
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  createPaymentOrder, 
  verifyPayment, 
  recordPaymentFailure 
} from '../utils/paymentAPI';

export function PaymentComponent() {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (orderId, amount) => {
    setLoading(true);
    setError('');

    try {
      // Step 1: Create Razorpay order
      const paymentOrderRes = await createPaymentOrder(orderId, amount, token);
      if (!paymentOrderRes.success) {
        setError(paymentOrderRes.message);
        setLoading(false);
        return;
      }

      const { razorpayOrderId, keyId } = paymentOrderRes;

      // Step 2: Setup Razorpay options
      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency: 'INR',
        order_id: razorpayOrderId,
        name: 'Fashion Store',
        handler: async (response) => {
          // Step 3: Verify payment
          const verifyRes = await verifyPayment(
            orderId,
            razorpayOrderId,
            response.razorpay_payment_id,
            response.razorpay_signature,
            token
          );

          if (verifyRes.success) {
            console.log('Payment successful!');
            // Handle success
          } else {
            setError('Payment verification failed');
          }
        },
        modal: {
          ondismiss: async () => {
            // Step 4: Record failure if user cancels
            await recordPaymentFailure(orderId, token);
            setError('Payment cancelled');
          }
        }
      };

      // Step 5: Open Razorpay modal
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError('Payment error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={() => handlePayment('order_123', 1999.99)}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

---

## Usage in Different Scenarios

### Scenario 1: Order Confirmation Page

```javascript
import { getPaymentDetails } from '../utils/paymentAPI';

export function OrderConfirmation({ orderId }) {
  const { token } = useContext(AuthContext);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      const result = await getPaymentDetails(orderId, token);
      if (result.success) {
        setPayment(result.payment);
      }
    };

    fetchPaymentDetails();
  }, [orderId, token]);

  return (
    <div>
      <h2>Order Confirmation</h2>
      <p>Order ID: {orderId}</p>
      {payment && (
        <div>
          <p>Payment Status: {payment.paymentStatus}</p>
          <p>Transaction ID: {payment.transactionId}</p>
          <p>Razorpay Order: {payment.razorpayOrderId}</p>
        </div>
      )}
    </div>
  );
}
```

### Scenario 2: Admin Refund Panel

```javascript
import { refundPayment } from '../utils/paymentAPI';

export function AdminRefundPanel({ orderId }) {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleRefund = async () => {
    setLoading(true);
    const result = await refundPayment(orderId, token);
    
    if (result.success) {
      alert(`Refund processed! ID: ${result.refundId}`);
    } else {
      alert(`Refund failed: ${result.message}`);
    }
    
    setLoading(false);
  };

  return (
    <button onClick={handleRefund} disabled={loading}>
      {loading ? 'Processing...' : 'Process Refund'}
    </button>
  );
}
```

### Scenario 3: Payment Status Badge

```javascript
export function PaymentStatusBadge({ paymentStatus }) {
  const getColor = (status) => {
    switch(status) {
      case 'success': return '#28a745';      // Green
      case 'pending': return '#ffc107';      // Yellow
      case 'initiated': return '#0096d6';    // Blue
      case 'failed': return '#dc3545';       // Red
      case 'refunded': return '#6c757d';     // Gray
      default: return '#333';
    }
  };

  const getLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span style={{
      backgroundColor: getColor(paymentStatus),
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px'
    }}>
      {getLabel(paymentStatus)}
    </span>
  );
}
```

---

## Error Handling

All payment functions return objects with `success` boolean. Handle errors like this:

```javascript
const result = await createPaymentOrder(orderId, amount, token);

if (!result.success) {
  // Handle error
  console.error('Error message:', result.message);
  console.error('Full error:', result.error);
  
  // Show user-friendly message
  setError(result.message || 'Payment failed. Please try again.');
}
```

---

## Environment Variables

Required in `frontend/.env`:

```
REACT_APP_RAZORPAY_KEY_ID=your_public_key
REACT_APP_API_BASE_URL=http://localhost:5000  # or production URL
```

Access in components:
```javascript
const razorpayKeyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
```

---

## Tips & Best Practices

1. **Always verify on backend**
   - Frontend calls create and verify, but never trust frontend alone
   - Backend performs HMAC signature verification

2. **Show appropriate loading states**
   - Disable buttons during payment processing
   - Show "Processing..." message to users

3. **Handle payment cancellation**
   - User might close Razorpay modal
   - Record failure and allow retry

4. **Display payment status**
   - Show order confirmation only if paymentStatus = 'success'
   - Show pending/failed status if applicable

5. **Test thoroughly**
   - Test successful payments
   - Test cancelled payments
   - Test network errors
   - Test with different UPI apps

6. **Log for debugging**
   - Log API responses
   - Log payment status changes
   - Log errors with full context

---

## Common Issues

### Issue: "window.Razorpay is undefined"
**Solution:** Ensure Razorpay script is loaded before using it
```javascript
if (typeof window !== 'undefined' && window.Razorpay) {
  const razorpay = new window.Razorpay(options);
  razorpay.open();
} else {
  console.error('Razorpay script not loaded');
}
```

### Issue: "Authorization required"
**Solution:** Ensure JWT token is passed
```javascript
const result = await createPaymentOrder(orderId, amount, token);
// token must be valid JWT from AuthContext
```

### Issue: "Invalid order"
**Solution:** Verify order exists and user has access
```javascript
// Ensure order was created successfully
// Ensure user owns the order
db.orders.findOne({_id: ObjectId("..."), userId: ObjectId("...")})
```

### Issue: "Signature verification failed"
**Solution:** Check backend logs
```
Backend logs should show:
✓ Signature verified successfully
OR
❌ Signatures don't match
```

---

## Performance Optimization

### Lazy Load Razorpay Script
```javascript
useEffect(() => {
  if (showPayment) {
    loadRazorpayScript();
  }
}, [showPayment]);
```

### Cache Payment Details
```javascript
const [paymentDetailsCache, setCache] = useState({});

const getPaymentDetails = async (orderId, token, useCache = true) => {
  if (useCache && paymentDetailsCache[orderId]) {
    return paymentDetailsCache[orderId];
  }

  const result = await paymentAPI.getPaymentDetails(orderId, token);
  setCache(prev => ({
    ...prev,
    [orderId]: result
  }));
  return result;
};
```

---

## Testing Payment APIs

### Unit Test Example
```javascript
import * as paymentAPI from '../utils/paymentAPI';

describe('Payment APIs', () => {
  it('should create payment order', async () => {
    const result = await paymentAPI.createPaymentOrder(
      'order_123',
      1999.99,
      'valid_token'
    );
    expect(result.success).toBe(true);
    expect(result.razorpayOrderId).toBeDefined();
  });

  it('should verify payment with valid signature', async () => {
    const result = await paymentAPI.verifyPayment(
      'order_123',
      'razorpay_order_123',
      'razorpay_payment_123',
      'valid_signature',
      'valid_token'
    );
    expect(result.success).toBe(true);
  });
});
```

---

**Status:** ✅ Frontend payment integration complete and ready to use

**Total Integration Time:** 5-10 minutes
**Difficulty:** Easy to Medium
**Dependencies:** Razorpay SDK, JWT token, valid backend endpoints

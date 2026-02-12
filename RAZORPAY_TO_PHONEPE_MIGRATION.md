# Razorpay → PhonePe Migration Guide

## Complete Implementation Changes

This guide shows exactly what changed when migrating from Razorpay to PhonePe.

---

## Backend Changes

### 1. Payment Controller (`backend/controllers/paymentController.js`)

#### Import Changes
```javascript
// ❌ BEFORE (Razorpay)
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ✅ AFTER (PhonePe)
const axios = require('axios');
const crypto = require('crypto');

const PHONEPE_HOST_URL = process.env.PHONEPE_HOST_URL;
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY;
const PHONEPE_SALT_INDEX = process.env.PHONEPE_SALT_INDEX;
```

#### Signature Generation

```javascript
// ❌ BEFORE (Razorpay - Server auto-validates)
// No signature generation needed; Razorpay SDK handles it

// ✅ AFTER (PhonePe - Manual signature)
const generatePhonepeSignature = (body, endpoint) => {
  const payload = Buffer.from(JSON.stringify(body)).toString('base64');
  const string = payload + endpoint + PHONEPE_SALT_KEY;
  const hash = crypto.createHash('sha256').update(string).digest('hex');
  const xVerify = hash + '###' + PHONEPE_SALT_INDEX;
  return { payload, xVerify };
};
```

#### Create Payment Order Function

```javascript
// ❌ BEFORE (Razorpay SDK)
exports.createPaymentOrder = async (req, res) => {
  const { orderId, amount } = req.body;
  
  const razorpayOrder = await razorpayInstance.orders.create({
    amount: amount * 100, // Convert to paise
    currency: 'INR',
    receipt: `receipt_${orderId}`
  });
  
  const order = await Order.findByIdAndUpdate(
    orderId,
    { razorpayOrderId: razorpayOrder.id, paymentStatus: 'initiated' }
  );
  
  res.json({
    razorpayOrderId: razorpayOrder.id,
    razorpayKey: process.env.RAZORPAY_KEY_ID,
    amount: amount * 100
  });
};

// ✅ AFTER (PhonePe HTTP API)
exports.createPaymentOrder = async (req, res) => {
  const { orderId, amount } = req.body;
  
  const requestBody = {
    merchantId: PHONEPE_MERCHANT_ID,
    merchantTransactionId: `TXN_${orderId}_${Date.now()}`,
    merchantUserId: `USER_${userId}`,
    amount: amount * 100, // PhonePe expects amount in paise
    redirectUrl: `${process.env.FRONTEND_URL}/order-details/${orderId}`,
    callbackUrl: process.env.CALLBACK_URL,
    mobileNumber: shippingAddress.phone,
    paymentInstrument: {
      type: 'UPI'
    }
  };
  
  const { payload, xVerify } = generatePhonepeSignature(
    requestBody,
    '/pg/v1/pay'
  );
  
  const order = await Order.findByIdAndUpdate(
    orderId,
    { phonpeTransactionId: requestBody.merchantTransactionId, paymentStatus: 'initiated' }
  );
  
  res.json({
    data: { transactionId: requestBody.merchantTransactionId, payload, xVerify },
    success: true
  });
};
```

#### Verify Payment Function

```javascript
// ❌ BEFORE (Razorpay - Client sends payment details)
exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  const hmac = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');
  
  if (hmac === razorpay_signature) {
    // Payment verified
  }
};

// ✅ AFTER (PhonePe - Server calls PhonePe API)
exports.verifyPayment = async (req, res) => {
  const { orderId, transactionId } = req.body;
  
  const string = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}` + PHONEPE_SALT_KEY;
  const hash = crypto.createHash('sha256').update(string).digest('hex');
  const xVerify = hash + '###' + PHONEPE_SALT_INDEX;
  
  const response = await axios.get(
    `${PHONEPE_HOST_URL}/status/${PHONEPE_MERCHANT_ID}/${transactionId}`,
    {
      headers: { 'X-VERIFY': xVerify }
    }
  );
  
  if (response.data.code === 'PAYMENT_SUCCESS') {
    // Payment verified
  }
};
```

#### New Callback Handler (PhonePe Only)

```javascript
// ❚ NEW (PhonePe Webhook)
exports.handlePaymentCallback = async (req, res) => {
  const { transactionId, code } = req.body;
  
  // Extract orderId from transaction ID: TXN_{orderId}_{timestamp}
  const orderId = transactionId.split('_')[1];
  
  if (code === 'PAYMENT_SUCCESS') {
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'success',
        status: 'processing',
        phonpePaymentId: req.body.paymentId
      }
    );
  }
};
```

### 2. Order Model (`backend/models/Order.js`)

```javascript
// ❌ BEFORE (Razorpay)
const paymentSchema = {
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paymentStatus: { type: String, enum: ['pending', 'success', 'failed'] }
};

// ✅ AFTER (PhonePe)
const paymentSchema = {
  phonpeTransactionId: String,
  phonpePaymentId: String,
  transactionId: String,
  paymentStatus: { type: String, enum: ['pending', 'initiated', 'success', 'failed', 'refunded'] }
};
```

### 3. Environment Variables

```bash
# ❌ BEFORE (.env.example)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# ✅ AFTER (.env.example)
PHONEPE_MERCHANT_ID=M12345ABC
PHONEPE_SALT_KEY=xxxxx
PHONEPE_SALT_INDEX=1
PHONEPE_HOST_URL=https://api-sandbox.phonepe.com/apis/heroku/pg/v1
CALLBACK_URL=http://localhost:5000/api/payments/callback
```

### 4. Routes (`backend/routes/payments.js`)

```javascript
// ❌ BEFORE - No callback route
router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);

// ✅ AFTER - Added callback route with NO auth (PhonePe server calls this)
router.post('/create-order', authenticate, createPaymentOrder);
router.post('/verify', authenticate, verifyPayment);
router.post('/callback', handlePaymentCallback);  // ← NEW, no authenticate middleware
router.post('/failure', authenticate, handlePaymentFailure);
```

### 5. Dependencies (`backend/package.json`)

```json
// ❌ BEFORE
"dependencies": {
  "razorpay": "^2.8.1",
  "express": "^4.18.2"
}

// ✅ AFTER
"dependencies": {
  "axios": "^1.4.0",
  "express": "^4.18.2"
}
```

---

## Frontend Changes

### 1. Payment API Utilities (`frontend/src/utils/paymentAPI.js`)

#### Create Payment Order

```javascript
// ❌ BEFORE (Razorpay)
export const createPaymentOrder = async (orderId, amount, token) => {
  const response = await axios.post(`${API_BASE_URL}/api/payments/create-order`, {
    orderId,
    amount // e.g., 499.99 (will be converted to paise in backend)
  }, { headers: { Authorization: `Bearer ${token}` } });
  
  return {
    success: response.data.success,
    razorpayOrderId: response.data.razorpayOrderId,
    razorpayKey: response.data.razorpayKey,
    amount: response.data.amount
  };
};

// ✅ AFTER (PhonePe)
export const createPaymentOrder = async (orderId, amount, token) => {
  const response = await axios.post(`${API_BASE_URL}/api/payments/create-order`, {
    orderId,
    amount // e.g., 499.99 (no conversion needed)
  }, { headers: { Authorization: `Bearer ${token}` } });
  
  return {
    success: response.data.success,
    transactionId: response.data.data.transactionId,
    paymentUrl: response.data.data.paymentUrl,
    payload: response.data.data.payload,
    xVerify: response.data.data.xVerify
  };
};
```

#### Verify Payment

```javascript
// ❌ BEFORE (Razorpay - from modal response)
export const verifyPayment = async (paymentData, token) => {
  const response = await axios.post(`${API_BASE_URL}/api/payments/verify`, {
    razorpay_order_id: paymentData.razorpay_order_id,
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_signature: paymentData.razorpay_signature
  }, { headers: { Authorization: `Bearer ${token}` } });
  
  return response.data;
};

// ✅ AFTER (PhonePe - from transaction lookup)
export const verifyPayment = async (orderId, transactionId, token) => {
  const response = await axios.post(`${API_BASE_URL}/api/payments/verify`, {
    orderId,
    transactionId
  }, { headers: { Authorization: `Bearer ${token}` } });
  
  return response.data;
};
```

### 2. Checkout Component (`frontend/src/pages/Checkout.js`)

#### Script Loading

```javascript
// ❌ BEFORE (Razorpay script from CDN)
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

useEffect(() => {
  loadRazorpayScript();
}, []);

// ✅ AFTER (PhonePe - No external script needed)
// No script loading required!
```

#### Payment Initiation

```javascript
// ❌ BEFORE (Razorpay Modal)
const initiateRazorpayPayment = async (paymentOrderResponse) => {
  const options = {
    key: paymentOrderResponse.razorpayKey,
    order_id: paymentOrderResponse.razorpayOrderId,
    amount: paymentOrderResponse.amount,
    currency: 'INR',
    handler: async (response) => {
      const verificationResult = await verifyPayment(response);
      if (verificationResult.success) {
        // Payment verified
      }
    }
  };
  
  new window.Razorpay(options).open();
};

// ✅ AFTER (PhonePe Redirect)
const initiatePhonePePayment = async (orderId) => {
  const paymentOrderResponse = await createPaymentOrder(orderId, amount);
  
  // Create hidden form
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = paymentOrderResponse.paymentUrl;
  
  // Add fields
  const requestField = document.createElement('input');
  requestField.type = 'hidden';
  requestField.name = 'request';
  requestField.value = paymentOrderResponse.payload;
  form.appendChild(requestField);
  
  const checksumField = document.createElement('input');
  checksumField.type = 'hidden';
  checksumField.name = 'checksum';
  checksumField.value = paymentOrderResponse.xVerify;
  form.appendChild(checksumField);
  
  // Submit form (redirects to PhonePe)
  document.body.appendChild(form);
  form.submit();
};
```

#### Button Handling

```javascript
// ❌ BEFORE (Razorpay)
<button onClick={() => initiateRazorpayPayment(paymentOrderResponse)}>
  {isProcessing ? 'Processing Payment...' : 'Complete Payment'}
</button>

// ✅ AFTER (PhonePe)
<button onClick={() => initiatePhonePePayment(order._id)}>
  {isProcessing ? 'Redirecting to PhonePe...' : 'Complete Payment'}
</button>
```

### 3. Environment Variables

```bash
# ❌ BEFORE (.env)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxx
REACT_APP_API_BASE_URL=http://localhost:5000

# ✅ AFTER (.env)
REACT_APP_API_BASE_URL=http://localhost:5000
# Razorpay public key removed (PhonePe uses server-side only)
```

---

## Payment Flow Comparison

### Razorpay Flow
```
Frontend Order Creation
    ↓
Backend Creates Razorpay Order
    ↓
Frontend Opens Razorpay Modal
    ↓
User Enters Card/UPI in Modal
    ↓
Razorpay Processes Payment
    ↓
Modal Calls Frontend Handler Function
    ↓
Frontend Verifies Signature with Backend
    ↓
Order Updated (success/failure)
```

### PhonePe Flow
```
Frontend Order Creation
    ↓
Backend Creates PhonePe Request with Signature
    ↓
Backend Generates Base64 Payload
    ↓
Frontend Submits Hidden Form to PhonePe
    ↓
User Redirected to PhonePe Gateway
    ↓
User Selects UPI App & Completes Payment
    ↓
PhonePe Redirects User Back to App
    ↓
Backend Receives Callback Webhook
    ↓
Backend Verifies Signature & Updates Order
    ↓
Order Updated (success/failure)
```

---

## Key Differences

| Aspect | Razorpay | PhonePe |
|--------|----------|---------|
| **Integration Type** | SDK | HTTP API |
| **Checkout Style** | Modal popup | Page redirect |
| **Server-Side Signature** | HMAC SHA256 | SHA256 base64 hash |
| **Amount Units** | Paise (1/100 INR) | Paise (1/100 INR) |
| **Public Key** | Required in frontend | Not needed (server-side only) |
| **Callback** | Webhook only | Webhook + Redirect |
| **Settlement Time** | 2-3 days | Next business day |
| **UPI App Support** | Limited | All UPI apps |

---

## Installation Commands

### Backend Setup
```bash
cd backend
npm uninstall razorpay        # Remove old package
npm install axios             # Add new package
npm install                   # Install all dependencies
```

### Frontend Setup
```bash
cd frontend
npm install                   # Install all dependencies
# No razorpay package to remove
```

---

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads without errors
- [ ] Can add products to cart
- [ ] Checkout page loads with payment methods
- [ ] Can select UPI payment method
- [ ] Form submits correctly to PhonePe
- [ ] PhonePe redirect works
- [ ] Payment status updates in database
- [ ] Order confirmation page shows
- [ ] Cart clears after successful payment

---

## Troubleshooting

### Issue: "Cannot find module 'razorpay'"
**Solution:** Run `npm uninstall razorpay` in backend

### Issue: "axios is not defined"
**Solution:** Run `npm install axios` in backend

### Issue: "PHONEPE_MERCHANT_ID is undefined"
**Solution:** Add credentials to `backend/.env`

### Issue: "Form submission doesn't work"
**Solution:** Check browser console for errors, verify paymentUrl is valid

### Issue: "Callback not received"
**Solution:** 
- Verify CALLBACK_URL in .env
- Check if backend is running
- Check server logs for errors

---

## Rollback Plan (If Needed)

If you need to go back to Razorpay:

1. Restore backup files from git history
2. Reinstall razorpay: `npm install razorpay`
3. Uninstall axios: `npm uninstall axios`
4. Update .env with Razorpay credentials
5. Restart backend and frontend

```bash
git log --oneline | grep -i razorpay
git checkout <commit-hash> -- backend/ frontend/
npm install
```

---

## Summary

✅ **Complete Migration Done:**
- Backend payment controller rewritten for PhonePe
- Order model updated with PhonePe fields
- Frontend checkout refactored for redirect flow
- Dependencies updated
- Environment variables configured

✅ **Ready for:**
- PhonePe sandbox testing
- Production deployment
- Live payment processing

❌ **Still Needed:**
- PhonePe merchant account setup
- Actual merchant credentials
- Sandbox/production testing

---

**Status:** Implementation Complete - Ready for Testing

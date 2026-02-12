# UPI Payment Integration with Razorpay

## Overview
This document outlines the complete UPI payment integration using Razorpay, supporting Google Pay, PhonePe, Paytm, and BHIM with automatic bank deposits.

## Architecture

### Payment Flow
```
1. Customer places order → Order created in DB
2. For UPI payments:
   - Backend creates Razorpay order
   - Razorpay Checkout modal opens (UPI only)
   - Customer selects UPI app (Google Pay, PhonePe, Paytm, BHIM)
   - Payment processed via selected app
   - Razorpay returns signature
3. Frontend verifies signature
4. Backend validates signature using HMAC-SHA256
5. Order status updated to 'processing'
6. Funds automatically deposited to merchant bank account (Razorpay handles this)
7. Customer redirected to order confirmation
```

## Backend Implementation

### 1. Order Model (`backend/models/Order.js`)
- **New Fields Added:**
  - `paymentStatus`: Enum with values ['pending', 'initiated', 'success', 'failed', 'refunded']
  - `razorpayOrderId`: Stores Razorpay order ID
  - `razorpayPaymentId`: Stores Razorpay payment ID
  - `razorpaySignature`: Stores signature for verification
  - `transactionId`: Unique transaction identifier

- **Updated paymentMethod enum:**
  - 'google-pay' (new)
  - 'phonepe' (new)
  - 'paytm' (new)
  - 'bhim' (new)
  - 'credit-card'
  - 'debit-card'
  - 'paypal'
  - 'bank-transfer'

### 2. Payment Controller (`backend/controllers/paymentController.js`)

#### Function: `createPaymentOrder()`
**Endpoint:** `POST /api/payments/create-order`
**Request:**
```json
{
  "orderId": "65f1234567890abcdef12345",
  "amount": 1999.99
}
```
**Response:**
```json
{
  "success": true,
  "razorpayOrderId": "order_1234567890abcd",
  "keyId": "rzp_live_your_key_id",
  "amount": 199999
}
```
**Logic:**
- Validates order exists and user owns it
- Converts amount to paise (multiply by 100)
- Creates Razorpay order with webhook URL
- Stores razorpayOrderId in order document
- Sets paymentStatus to 'initiated'

#### Function: `verifyPayment()`
**Endpoint:** `POST /api/payments/verify`
**Request:**
```json
{
  "orderId": "65f1234567890abcdef12345",
  "razorpayOrderId": "order_1234567890abcd",
  "razorpayPaymentId": "pay_1234567890abcd",
  "razorpaySignature": "aabbccdd..."
}
```
**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "order": { /* updated order object */ }
}
```
**Security:**
- Generates HMAC-SHA256: `sha256(orderId|paymentId)` with RAZORPAY_KEY_SECRET
- Compares with provided signature
- Returns 400 if signature invalid
- Updates order with payment details
- Sets paymentStatus to 'success'
- Updates order status to 'processing'

#### Function: `handlePaymentFailure()`
**Endpoint:** `POST /api/payments/failure`
**Request:**
```json
{
  "orderId": "65f1234567890abcdef12345"
}
```
**Purpose:**
- Records failed payment attempts
- Sets paymentStatus to 'failed'
- Keeps order status as 'pending' (customer can retry)

#### Function: `getPaymentDetails()`
**Endpoint:** `GET /api/payments/details/:orderId`
**Response:**
```json
{
  "payment": {
    "razorpayOrderId": "order_...",
    "razorpayPaymentId": "pay_...",
    "paymentStatus": "success",
    "transactionId": "txn_..."
  },
  "order": { /* full order object */ }
}
```
**Use Case:** Retrieve payment info for order confirmation page

#### Function: `refundPayment()`
**Endpoint:** `POST /api/payments/refund`
**Request:**
```json
{
  "orderId": "65f1234567890abcdef12345"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refundId": "rfnd_1234567890abcd"
}
```
**Logic:**
- Validates order status is 'success'
- Calls Razorpay refund API with full amount
- Updates order: paymentStatus='refunded', status='cancelled'
- Returns Razorpay refund ID

### 3. Payment Routes (`backend/routes/payments.js`)
All routes require JWT authentication via `auth` middleware.

```
POST   /api/payments/create-order    → initiatePayment
POST   /api/payments/verify          → verifyPayment
POST   /api/payments/failure         → handlePaymentFailure
GET    /api/payments/details/:orderId → getPaymentDetails
POST   /api/payments/refund          → refundPayment
```

### 4. Environment Variables

**Required in `.env`:**
```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxx
```

**Get credentials from:**
1. Visit https://dashboard.razorpay.com/
2. Go to Settings → API Keys
3. Copy Key ID (public) and Key Secret (keep secret!)

## Frontend Implementation

### 1. Razorpay Script Loading
Automatically loaded in `Checkout.js`:
```javascript
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};
```

### 2. Checkout Component Updates (`frontend/src/pages/Checkout.js`)

**Payment Method Selection:**
- Default: 'google-pay' (UPI)
- Options organized by category:
  - **UPI Payments:** Google Pay, PhonePe, Paytm, BHIM
  - **Card Payments:** Credit Card, Debit Card
  - **Other:** PayPal, Bank Transfer

**Key Functions:**

#### `initiateRazorpayPayment(orderData)`
```javascript
// 1. Create Razorpay order via backend
// 2. Configure Razorpay options with UPI only method
// 3. Open Razorpay Checkout modal
// 4. On success: Call verifyPayment()
// 5. On cancel: Record failure via handlePaymentFailure()
```

#### `verifyPayment(orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature)`
```javascript
// 1. Call /api/payments/verify endpoint
// 2. If successful:
//    - Clear cart
//    - Redirect to order confirmation
// 3. If failed:
//    - Show error message
//    - Allow retry
```

#### `handleSubmit(e)`
```javascript
// 1. Validate form and user authentication
// 2. Create order via POST /api/orders
// 3. Check payment method:
//    - If UPI: Call initiateRazorpayPayment()
//    - If other: Complete order immediately
```

### 3. Payment API Utilities (`frontend/src/utils/paymentAPI.js`)

**Available Functions:**

1. **`createPaymentOrder(orderId, amount, token)`**
   - Returns: `{success, razorpayOrderId, keyId, amount}`

2. **`verifyPayment(orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, token)`**
   - Returns: `{success, message, order}`

3. **`recordPaymentFailure(orderId, token, errorDetails)`**
   - Returns: `{success, message}`

4. **`getPaymentDetails(orderId, token)`**
   - Returns: `{success, payment, order}`

5. **`refundPayment(orderId, token)`**
   - Returns: `{success, message, refundId}`

6. **`openRazorpayModal(options)`**
   - Opens Razorpay Checkout modal

### 4. Environment Configuration

**`frontend/.env`:**
```
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
REACT_APP_API_BASE_URL=http://localhost:5000
```

**Usage in Components:**
```javascript
const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
```

## Security Considerations

### 1. Signature Verification (CRITICAL)
- **Backend Verification:**
  ```javascript
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (generatedSignature !== razorpaySignature) {
    // Reject payment
  }
  ```
- Always verify on backend, never trust frontend
- Uses HMAC-SHA256 for cryptographic security

### 2. Authorization Checks
- All payment endpoints verify user owns the order
- Orders can only be modified by the user who created them
- Refunds can only be initiated by order owner

### 3. Sensitive Data
- Razorpay Key Secret never exposed to frontend
- Public Key ID stored in frontend .env only
- JWT tokens required for all payment operations
- Payment tokens in Authorization header

### 4. Amount Validation
- Server-side amount verification (prevent frontend manipulation)
- Paise conversion (multiply by 100) happens on server
- Original order totalPrice used as source of truth

## Testing Payment Integration

### Test Cards (Non-UPI)
- **Visa:** 4111 1111 1111 1111 (Any future date, any CVV)
- **Mastercard:** 5555 5555 5555 4444

### Test UPI Handles
- Razorpay Test Mode supports: `success@razorpay` and `failure@razorpay`

### Step-by-Step Test:
1. Login to your account
2. Add products to cart
3. Proceed to checkout
4. Select UPI payment method (Google Pay, PhonePe, etc.)
5. Fill shipping address
6. Click "Place Order"
7. In Razorpay modal, complete payment
8. Verify order created and payment status updated

## Deployment Checklist

### Backend
- [ ] Add Razorpay credentials to production .env
- [ ] Test with production Razorpay keys
- [ ] Verify webhook URL is publicly accessible
- [ ] Enable HTTPS
- [ ] Test refund functionality
- [ ] Monitor payment logs

### Frontend
- [ ] Add REACT_APP_RAZORPAY_KEY_ID to production .env
- [ ] Point REACT_APP_API_BASE_URL to production backend
- [ ] Test payment flow end-to-end
- [ ] Verify error handling works correctly
- [ ] Test across different browsers and devices
- [ ] Test UPI app selection on mobile devices

### Database
- [ ] Backup MongoDB before production deployment
- [ ] Verify Order model migration applied
- [ ] Test order creation with payment fields
- [ ] Verify payment status tracking works

## Troubleshooting

### 1. Razorpay Checkout Not Opening
**Solution:**
- Check if Razorpay script loaded successfully (check browser console)
- Verify script is added before component renders
- Check if `window.Razorpay` is defined

### 2. Signature Verification Fails
**Solution:**
- Verify RAZORPAY_KEY_SECRET is correct
- Check order and payment IDs are correct
- Verify HMAC generation logic matches Razorpay docs

### 3. Payment Status Not Updating
**Solution:**
- Check order ID is valid
- Verify user has access to order
- Check database for paymentStatus values

### 4. Refund Not Processing
**Solution:**
- Order must have paymentStatus='success'
- Razorpay account must have refund capability enabled
- Check Razorpay dashboard for refund status

### 5. Orders Created But Payment Not Completed
**Solution:**
- Customer must click "Place Order" button
- Must select UPI payment method
- Must complete payment in Razorpay modal
- Check error messages in console

## Future Enhancements

1. **Email Notifications:** Send payment confirmation emails
2. **SMS Alerts:** Send payment status via SMS
3. **Analytics:** Track payment success/failure rates
4. **Retry Logic:** Automatic retry for failed payments
5. **Payment Plans:** Support EMI and installment options
6. **Webhooks:** Complete payment tracking via Razorpay webhooks
7. **Admin Dashboard:** View payment analytics and refund requests
8. **Payment History:** Customer can view past payments
9. **Multiple Currencies:** Support international payments
10. **Payment Gateway Fallback:** Support multiple payment providers

## Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Checkout API](https://razorpay.com/docs/checkout/web/)
- [Razorpay Signature Verification](https://razorpay.com/docs/payments/verify-signature/)
- [Razorpay Test Mode](https://razorpay.com/docs/getting-started/test-mode/)
- [UPI Apps Supported](https://razorpay.com/docs/payments/upi/)

## Support

For issues or questions:
1. Check Razorpay dashboard (Settings → API Keys)
2. Review server logs for errors
3. Check browser console for client-side errors
4. Contact Razorpay support if payment gateway issue

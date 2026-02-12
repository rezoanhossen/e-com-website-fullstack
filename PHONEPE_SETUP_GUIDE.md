# PhonePe Payment Integration - Setup Guide

## Overview

Your e-commerce payment system has been switched from Razorpay to **PhonePe**, India's leading UPI payment platform. PhonePe handles:
- ✅ Google Pay, PhonePe, Paytm, BHIM UPI payments
- ✅ Automatic bank account deposits
- ✅ Instant settlement
- ✅ Security & fraud protection

---

## Step 1: Create PhonePe Merchant Account

### For Sandbox (Testing)
1. Visit: https://merchant-dashboard-staging.phonepe.com/
2. Sign up with:
   - Business name
   - Email
   - Phone number
3. Create test merchant account
4. You'll get sandbox credentials immediately

### For Production (Live)
1. Visit: https://merchant.phonepe.com/
2. Sign up with:
   - Legal business name (matches bank account)
   - Business email
   - Phone number
3. Verify business details:
   - PAN card
   - GST certificate (if applicable)
   - Bank account details
4. Complete KYC verification
5. Once approved, you'll get production credentials

---

## Step 2: Get PhonePe Credentials

For **Sandbox Testing:**

1. Login to: https://merchant-dashboard-staging.phonepe.com/
2. Go to **Settings** → **API Keys**
3. You'll see:
   - **Merchant ID** (e.g., M12345ABC)
   - **Salt Key** (secret key)
   - **Salt Index** (usually 1)

For **Production:**

1. Login to: https://merchant.phonepe.com/
2. Go to **Settings** → **API Keys**
3. Copy:
   - **Merchant ID**
   - **Salt Key**
   - **Salt Index**

---

## Step 3: Configure Backend Environment

### 1. Update `backend/.env` file

```bash
# PhonePe Credentials
PHONEPE_MERCHANT_ID=M12345ABC
PHONEPE_SALT_KEY=your_salt_key_here
PHONEPE_SALT_INDEX=1

# Use this URL for Sandbox (testing)
PHONEPE_HOST_URL=https://api-sandbox.phonepe.com/apis/heroku/pg/v1

# OR use this for Production:
# PHONEPE_HOST_URL=https://api.phonepe.com/apis/heroku/pg/v1

# Callback URL (your backend endpoint for payment status)
CALLBACK_URL=http://localhost:5000/api/payments/callback

# Other configs
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

**Required packages:**
- `axios` - For PhonePe API calls (already included)
- `express` - Web framework
- `mongoose` - MongoDB
- `jsonwebtoken` - JWT authentication

### 3. Start Backend

```bash
npm start
# Expected output: Server running on port 5000
```

---

## Step 4: Configure Frontend

### 1. Update `frontend/.env` file

```bash
# API Configuration (pointing to your backend)
REACT_APP_API_BASE_URL=http://localhost:5000

# For Production:
# REACT_APP_API_BASE_URL=https://your-backend-domain.com
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Start Frontend

```bash
npm start
# Expected output: App runs on http://localhost:3000
```

---

## Step 5: Test Payment Flow

### Using Sandbox Credentials

1. **Login** to your app
2. **Add products** to cart
3. Go to **Checkout**
4. Fill shipping address
5. Select **Google Pay, PhonePe, Paytm, or BHIM**
6. Click **Place Order**

### What Happens:

1. Order created in database
2. PhonePe payment link generated
3. You're redirected to PhonePe payment page
4. Select your UPI app
5. Complete payment using test account
6. Redirected back to order confirmation

### Test Credentials (Sandbox):

**For PhonePe Sandbox Testing:**
- Any 10-digit number as UPI ID (e.g., 9999999999@ybl)
- Any 6-digit test PIN
- No real money is deducted in sandbox

---

## Step 6: Verify in Database

### Check Order Payment Status

```bash
mongosh
use ecommerce

# View recent orders
db.orders.find({}).sort({createdAt: -1}).limit(1)

# Should show:
{
  paymentMethod: "google-pay",
  paymentStatus: "success",
  phonpeTransactionId: "TXN_...",
  phonpePaymentId: "...",
  transactionId: "...",
  status: "processing"
}
```

---

## PhonePe Payment Flow (How It Works)

```
Your App (Frontend)
    |
    | 1. Customer clicks "Place Order"
    ↓
Your Backend
    | 2. Create order in database
    | 3. Generate PhonePe transaction request
    | 4. Sign request with SHA256(payload + endpoint + saltKey)
    | 5. Send signature in X-VERIFY header
    ↓
PhonePe Gateway
    | 6. Validate signature
    | 7. Generate payment page URL
    | 8. Return to backend
    ↓
Your App (Frontend)
    | 9. Redirect user to PhonePe payment page
    ↓
PhonePe Payment Page
    | 10. Customer selects UPI app
    | 11. Completes payment in UPI app
    ↓
PhonePe (Backend)
    | 12. Process payment
    | 13. Send callback to your CALLBACK_URL
    | 14. Send redirect to frontend
    ↓
Your Backend
    | 15. Receive callback
    | 16. Verify payment status
    | 17. Update order paymentStatus='success'
    ↓
Your App (Frontend)
    | 18. Show order confirmation
    | 19. Clear shopping cart
    ↓
Customer Bank Account
    | 20. Funds debited (instant)
    ↓
Your Bank Account
    | 21. Funds credited (24-48 hours)
```

---

## Key Differences from Razorpay

| Feature | Razorpay | PhonePe |
|---------|----------|---------|
| **Payment Modal** | Opens modal in app | Redirects to payment page |
| **UPI Apps** | Limited | All UPI apps supported |
| **Settlement** | 2-3 days | Next business day |
| **Signature** | HMAC SHA256 | SHA256 + Base64 |
| **Callback** | Webhook only | Webhook + Redirect |
| **India Focus** | Global | India-first |

---

## Environment Variables Reference

### Backend `.env` - Required

| Variable | Value | Example |
|----------|-------|---------|
| `PHONEPE_MERCHANT_ID` | Your merchant ID | `M12345ABC` |
| `PHONEPE_SALT_KEY` | Your secret key | `abcdef1234...` |
| `PHONEPE_SALT_INDEX` | Usually 1 | `1` |
| `PHONEPE_HOST_URL` | API endpoint | `https://api-sandbox.phonepe.com/apis/heroku/pg/v1` |
| `CALLBACK_URL` | Your callback endpoint | `http://localhost:5000/api/payments/callback` |

### Frontend `.env` - Required

| Variable | Value | Example |
|----------|-------|---------|
| `REACT_APP_API_BASE_URL` | Backend URL | `http://localhost:5000` |

---

## API Endpoints

All endpoints use PhonePe for payment processing:

```
POST   /api/payments/create-order    - Create payment (needs JWT)
POST   /api/payments/verify          - Verify payment (needs JWT)
POST   /api/payments/callback        - PhonePe callback (no auth)
POST   /api/payments/failure         - Record failed payment (needs JWT)
GET    /api/payments/details/:orderId - Get payment info (needs JWT)
POST   /api/payments/refund          - Refund payment (needs JWT)
```

---

## Troubleshooting

### Issue: "Cannot create payment order"
**Solution:** Check if PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY are correct in `.env`

### Issue: "Signature verification failed"
**Solution:**
- Verify PHONEPE_SALT_KEY is correct
- Check if PHONEPE_SALT_INDEX matches your PhonePe dashboard
- Ensure CALLBACK_URL is accessible

### Issue: "Payment redirects to error page"
**Solution:**
- Check if PHONEPE_HOST_URL is correct (sandbox vs production)
- Verify FRONTEND_URL in `.env` matches your actual frontend URL
- Check browser console for errors

### Issue: "Order not updated after payment"
**Solution:**
- Ensure backend is running and accepting callbacks
- Check MongoDB connection
- Review backend logs for callback processing errors

### Issue: "Refund not processing"
**Solution:**
- Only successful payments can be refunded
- Ensure order status is "processing" or higher
- Check PhonePe refund limit in your account settings

---

## Payment Status States

After each payment operation, order has a `paymentStatus`:

- **pending** - Order created, awaiting payment
- **initiated** - Payment link generated, user redirected
- **success** - ✅ Payment completed successfully
- **failed** - ❌ Payment cancelled or failed
- **refunded** - 🔄 Payment refunded to customer

---

## Customer Journey

### When Payment Succeeds

1. ✅ Order created in "processing" state
2. ✅ Cart automatically cleared
3. ✅ Redirected to order confirmation page
4. ✅ Order visible in "My Orders" page
5. ✅ Funds credited to merchant bank account (24-48 hrs)

### When Payment Fails

1. ❌ Order created in "pending" state
2. ❌ User shown error message
3. ❌ Can retry checkout with same cart items
4. ❌ Order can be deleted if not completed

---

## Moving to Production

### Pre-Production Checklist

- [ ] PhonePe production account created & verified
- [ ] Production credentials obtained
- [ ] Backend `.env` updated with production credentials
- [ ] PHONEPE_HOST_URL changed to production
- [ ] CALLBACK_URL updated to production domain
- [ ] FRONTEND_URL updated to production frontend URL
- [ ] Bank account linked to PhonePe account
- [ ] Test payment completed successfully
- [ ] Refund tested
- [ ] Error handling verified

### Production Deployment Steps

```bash
# Backend
cd backend
# Update .env with production credentials
# Update PHONEPE_HOST_URL
npm install
npm start

# Frontend
cd frontend
# Update .env REACT_APP_API_BASE_URL to production
npm run build
# Deploy build/ folder to hosting
```

---

## Support & Resources

- **PhonePe Merchant Dashboard:** https://merchant.phonepe.com/
- **PhonePe API Documentation:** https://developer.phonepe.com/
- **PhonePe Support:** https://support.phonepe.com/

---

## Files Modified for PhonePe Integration

### Backend
- ✅ `backend/controllers/paymentController.js` - Updated for PhonePe API
- ✅ `backend/routes/payments.js` - Added callback route
- ✅ `backend/models/Order.js` - Changed Razorpay fields to PhonePe fields
- ✅ `backend/package.json` - Replaced razorpay with axios
- ✅ `backend/.env.example` - Updated with PhonePe credentials

### Frontend
- ✅ `frontend/src/pages/Checkout.js` - PhonePe redirect implementation
- ✅ `frontend/src/utils/paymentAPI.js` - PhonePe API utilities
- ✅ `frontend/.env` - Removed Razorpay key

---

## Next Steps

1. ✅ Create PhonePe Merchant Account
2. ✅ Get Sandbox Credentials
3. ✅ Update `backend/.env`
4. ✅ Update `frontend/.env`
5. ✅ Run `npm install` in both folders
6. ✅ Start backend & frontend
7. ✅ Test payment flow
8. ✅ Verify database updates
9. ✅ Switch to production credentials when ready
10. ✅ Deploy to production

---

**Status:** ✅ Ready for Testing
**Next:** Run backend and frontend, then test a payment

Good luck! 🚀

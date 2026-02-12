# UPI Payment Integration - Quick Setup Guide

## Step 1: Get Razorpay Credentials (5 minutes)

### Create Razorpay Account
1. Go to [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up with your email and business details
3. Complete email verification
4. Fill in business information

### Get API Keys
1. Login to Razorpay Dashboard
2. Click **Settings** → **API Keys**
3. Copy **Key ID** (public key - safe to share)
4. Copy **Key Secret** (keep this SECRET!)

### Enable UPI
1. Go to **Settings** → **Payment Gateway**
2. Ensure UPI is enabled (usually enabled by default)
3. Verify merchant bank account is linked

## Step 2: Backend Setup

### 2.1 Update `.env` File
Create/update `backend/.env`:
```bash
RAZORPAY_KEY_ID=rzp_live_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here

# ... other existing variables
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

### 2.2 Install Razorpay Package
```bash
cd backend
npm install razorpay
```

### 2.3 Verify Backend Files Updated
Check these files exist and are updated:
- ✅ `backend/models/Order.js` - Has payment tracking fields
- ✅ `backend/controllers/paymentController.js` - Payment logic
- ✅ `backend/routes/payments.js` - Payment endpoints
- ✅ `backend/server.js` - Payment routes registered

### 2.4 Start Backend
```bash
cd backend
npm start
```

Expected output:
```
Server running on port 5000
MongoDB connected
```

## Step 3: Frontend Setup

### 3.1 Update `.env` File
Create `frontend/.env`:
```
REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_key_id_here
REACT_APP_API_BASE_URL=http://localhost:5000
```

**Note:** Use only the KEY ID (public key), never the secret key!

### 3.2 Verify Frontend Files Updated
Check these files exist and are updated:
- ✅ `frontend/src/pages/Checkout.js` - Updated with Razorpay integration
- ✅ `frontend/src/utils/paymentAPI.js` - Payment utilities
- ✅ `frontend/.env` - Razorpay configuration

### 3.3 Install Dependencies
```bash
cd frontend
npm install
```

### 3.4 Start Frontend
```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
You can now view the app in the browser at http://localhost:3000
```

## Step 4: Test Payment Integration

### 4.1 Verify Setup
1. Open http://localhost:3000 in browser
2. Verify no console errors
3. Check Network tab loads Razorpay script

### 4.2 Complete Test Flow
```
1. Create account / Login
2. Add products to cart
3. Go to Checkout
4. Select UPI payment method (Google Pay, PhonePe, Paytm, or BHIM)
5. Fill shipping address
6. Apply coupon (optional)
7. Click "Place Order"
8. Complete payment in Razorpay modal
9. Verify order created with paymentStatus='success'
```

### 4.3 Check Database
```bash
# Connect to MongoDB
mongosh

# Check order created with payment info
use ecommerce
db.orders.findOne({}, {paymentStatus: 1, razorpayOrderId: 1, razorpayPaymentId: 1, razorpaySignature: 1})
```

## Step 5: Test All UPI Apps

### Test with Different UPI Methods
1. **Google Pay** - Complete full payment flow
2. **PhonePe** - Complete full payment flow
3. **Paytm** - Complete full payment flow  
4. **BHIM** - Complete full payment flow
5. **Cards** - Test credit/debit card payment (gateway supports, different flow)

### Test Case: Payment Failure
```
1. Proceed to checkout
2. In Razorpay modal, click X or go back
3. Verify error message shown: "Payment cancelled. Please try again."
4. Verify order created with paymentStatus='failed'
```

### Test Case: Refund
```
1. Complete payment successfully
2. Go to admin panel (if available)
3. Select order
4. Click "Request Refund"
5. Verify refundId created
6. Check order paymentStatus='refunded'
7. Verify funds returned to customer bank account (24-48 hours)
```

## Step 6: Production Deployment

### 6.1 Switch to Production Keys
1. Get Production Key ID and Key Secret from Razorpay
2. Update `backend/.env` with production keys
3. Set `NODE_ENV=production`
4. Update `frontend/.env` with production Key ID
5. Update `REACT_APP_API_BASE_URL` to production backend URL

### 6.2 Production Checklist
- [ ] Environment variables updated
- [ ] MongoDB on production server
- [ ] HTTPS enabled on backend
- [ ] CORS configured for production frontend URL
- [ ] Razorpay webhook URL configured
- [ ] Test with real payments (small amount)
- [ ] Monitor payment logs
- [ ] Setup error tracking/logging

### 6.3 Enable Auto-Deposits
1. Login to Razorpay Dashboard
2. Go to **Settings** → **Settlements**
3. Click **Enable Auto-Transfers**
4. Select bank account
5. Set settlement frequency (daily/weekly)
6. Verify bank account details

Now funds will automatically deposit to your bank account!

## Verification Checklist

### ✅ Backend
- [ ] PORT 5000 accessible
- [ ] MongoDB connected
- [ ] RAZORPAY_KEY_ID set
- [ ] RAZORPAY_KEY_SECRET set
- [ ] Payment routes accessible: `/api/payments/*`
- [ ] JWT authentication working
- [ ] Test payment order creation
- [ ] Test signature verification

### ✅ Frontend
- [ ] PORT 3000 accessible
- [ ] No console errors
- [ ] Razorpay script loads
- [ ] REACT_APP_RAZORPAY_KEY_ID set
- [ ] Payment method dropdown shows all options
- [ ] Checkout form submits successfully
- [ ] Razorpay modal opens on submit
- [ ] Payment methods function correctly
- [ ] Order confirmation page loads

### ✅ Database
- [ ] Orders collection exists
- [ ] Order documents have payment fields
- [ ] paymentStatus values are correct
- [ ] razorpayOrderId saved correctly
- [ ] Signature verification works

### ✅ Payment Flow
- [ ] Order created before payment
- [ ] Razorpay modal opens with correct amount
- [ ] Payment signature verified correctly
- [ ] Order status updated to 'processing'
- [ ] Cart cleared after successful payment
- [ ] User redirected to confirmation page
- [ ] Payment appears in Razorpay dashboard

## Common Issues & Solutions

### Issue: "Razorpay script not loaded"
**Solution:**
```javascript
// Check in browser console
console.log(window.Razorpay) // Should be defined
```

### Issue: "Signature verification failed"
**Solution:**
- Verify RAZORPAY_KEY_SECRET is correct
- Check backend logs for the actual signature values
- Ensure crypto module is imported correctly

### Issue: "Order not created"
**Solution:**
- Verify user is logged in (token valid)
- Check MongoDB connection
- Verify order model has all required fields

### Issue: "Funds not depositing to bank account"
**Solution:**
- Verify bank account in Razorpay linked correctly
- Check if auto-transfer is enabled
- Usually takes 24-48 hours for first transfer
- Check Razorpay dashboard for settlement status

### Issue: "Payment method dropdown empty"
**Solution:**
- Clear browser cache
- Restart React dev server
- Check frontend/.env file exists and has RAZORPAY_KEY_ID

## Next Steps

After successful setup:

1. **Add Email Notifications**
   - Send payment confirmation emails
   - Send order confirmation emails

2. **Admin Dashboard**
   - View all payments
   - Process refunds
   - Download payment reports

3. **Customer Features**
   - View payment history
   - Download invoices
   - Request refunds

4. **Analytics**
   - Track payment success rates
   - Monitor revenue
   - Analyze customer behavior

5. **Security Enhancements**
   - Enable 2FA on Razorpay account
   - Setup IP whitelisting
   - Regular security audits

## Support & Resources

- **Razorpay Support:** [support@razorpay.com](mailto:support@razorpay.com)
- **Razorpay Docs:** [https://razorpay.com/docs/](https://razorpay.com/docs/)
- **API Reference:** [https://razorpay.com/docs/api/payments/](https://razorpay.com/docs/api/payments/)

## Test Account Credentials (if needed)

- **Email:** Any email address
- **Test Mode:** Available in Razorpay dashboard
- **Test Cards:** Use provided test card numbers
- **Real Payments:** Only in live mode with production keys

---

**Setup Time:** ~15 minutes
**Difficulty:** Easy to Medium
**Status:** Ready for Production

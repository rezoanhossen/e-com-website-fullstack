# PhonePe Payment Testing Guide

## Complete Testing Workflow

This guide walks you through testing your PhonePe payment integration from start to finish.

---

## Prerequisites

✅ All code changes completed (Razorpay → PhonePe)
✅ Backend .env configured with PhonePe credentials
✅ Frontend .env configured with API base URL
✅ Both backend and frontend installed (`npm install`)

---

## Phase 1: Environment Setup

### Step 1.1: Verify Backend Environment

```bash
cd backend
```

Check `backend/.env` file has these variables:
```bash
PHONEPE_MERCHANT_ID=M12345ABC        # Your merchant ID
PHONEPE_SALT_KEY=your_salt_key       # Your salt key
PHONEPE_SALT_INDEX=1                 # Usually 1
PHONEPE_HOST_URL=https://api-sandbox.phonepe.com/apis/heroku/pg/v1
CALLBACK_URL=http://localhost:5000/api/payments/callback
MONGODB_URI=mongodb://...            # Your MongoDB URL
JWT_SECRET=your_jwt_secret           # Your JWT secret
FRONTEND_URL=http://localhost:3000   # Frontend URL
NODE_ENV=development
PORT=5000
```

### Step 1.2: Verify Frontend Environment

```bash
cd frontend
```

Check `frontend/.env` file has these variables:
```bash
REACT_APP_API_BASE_URL=http://localhost:5000
```

### Step 1.3: Verify Dependencies

```bash
cd backend
npm list axios          # Should show axios version
npm list express        # Should show express installed
npm list mongoose       # Should show mongoose installed

cd ../frontend
npm list react          # Should show react installed
npm list axios          # Should show axios installed
```

---

## Phase 2: Start Services

### Step 2.1: Start MongoDB (if local)

```bash
# Windows Command Prompt
mongod

# Or if MongoDB installed as service
net start MongoDB
```

### Step 2.2: Start Backend

```bash
cd backend
npm start

# Expected output:
# ✓ Server running on port 5000
# ✓ Connected to MongoDB
# ✓ Payment routes registered
```

### Step 2.3: Start Frontend

Open new terminal:

```bash
cd frontend
npm start

# Expected output:
# ✓ Frontend running on http://localhost:3000
# ✓ Can access app in browser
```

---

## Phase 3: User Registration & Login

### Step 3.1: Create Test Account

1. Open http://localhost:3000
2. Click **Register**
3. Fill details:
   - Name: Test User
   - Email: testuser@example.com
   - Password: Test@123456
4. Click **Register**

### Step 3.2: Verify Registration

Check MongoDB:
```bash
mongosh
use ecommerce
db.users.find({email: "testuser@example.com"})
```

Should show user document with password hash.

### Step 3.3: Login

1. Click **Login**
2. Enter email: testuser@example.com
3. Enter password: Test@123456
4. Click **Login**

Expected: Logged in, navbar shows username, can access Home page.

---

## Phase 4: Add Products & Create Cart

### Step 4.1: Add Test Products (via API)

Use Postman or curl to add products:

```bash
POST http://localhost:5000/api/products
Body: {
  "name": "Test Product 1",
  "price": 499.99,
  "description": "Test product",
  "stock": 10
}
```

Or use Admin panel if available.

### Step 4.2: Add to Cart

1. Go to **Home**
2. Click on any product
3. Click **Add to Cart**
4. Click cart icon (should show 1 item)

### Step 4.3: Verify Cart

```bash
mongosh
db.carts.find({userId: ObjectId("...")})
```

Should show items array with product.

---

## Phase 5: Checkout Process

### Step 5.1: Navigate to Checkout

1. Click **Cart Icon**
2. Click **Proceed to Checkout**
3. Expected: Checkout page loads

### Step 5.2: Fill Shipping Address

1. Fill street address: "123 Test Street"
2. Fill city: "TestCity"
3. Fill state: "TS"
4. Fill postal code: "123456"
5. Fill phone: "9999999999"

### Step 5.3: Select Payment Method

1. Select radio button: **Google Pay** (or PhonePe, Paytm, BHIM)
2. No coupon code needed for this test
3. Review order total

### Step 5.4: Check Backend Logs

Before clicking "Place Order", open Terminal where backend is running.

You should see:
```
Payment order creation starting...
Order: [orderId]
Amount: 499.99
```

---

## Phase 6: Payment Processing

### Step 6.1: Click Place Order

Click **Place Order** button.

Expected behavior:
- Button becomes disabled
- Button text changes to "Redirecting to PhonePe..."
- Page doesn't navigate immediately

### Step 6.2: Observe Backend

Backend console should show:
```
Creating PhonePe payment order...
Merchant ID: M12345ABC
Transaction ID: TXN_[orderId]_[timestamp]
Payload generated
X-VERIFY signature generated
Response sent to frontend
```

### Step 6.3: Check Order in Database

During this time, order should be created:

```bash
mongosh
db.orders.find({}).sort({createdAt: -1}).limit(1)
```

Should show:
```javascript
{
  _id: ObjectId(...),
  userId: ObjectId(...),
  items: [...],
  totalPrice: 499.99,
  paymentMethod: "google-pay",
  paymentStatus: "initiated",
  phonpeTransactionId: "TXN_[orderId]_[timestamp]",
  phonpePaymentId: null,
  transactionId: null,
  status: "pending",
  shippingAddress: {...},
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

---

## Phase 7: PhonePe Sandbox Payment

### Step 7.1: Form Submission

Frontend should automatically submit hidden form to PhonePe:

```javascript
form.action = "https://api-sandbox.phonepe.com/apis/heroku/pg/v1/pay";
form.method = "POST";
// Contains: request (payload), checksum (xVerify)
```

Browser redirects to PhonePe sandbox page.

### Step 7.2: PhonePe Sandbox Payment Page

You should see:
- PhonePe branded payment page
- Test payment options
- UPI app selection screen

### Step 7.3: Complete Test Payment

In PhonePe sandbox:
1. Select **Google Pay** (or any UPI option)
2. You may see test UPI ID: 9999999999@ybl
3. Enter test PIN: any 6 digits
4. Click **Pay** or **Confirm**

PhonePe will process test transaction instantly (no real money).

### Step 7.4: Verify Payment Processing

PhonePe redirects back. Your frontend might show loading state briefly.

Check browser: Should see order confirmation page or back to app.

---

## Phase 8: Verify Payment Success

### Step 8.1: Check Order Status

Navigate to **My Orders**:
1. Click account menu
2. Click **My Orders**
3. Should see new order in list

Order status might show:
- Still "pending" (if callback not processed yet)
- Or "processing" (if callback processed)

### Step 8.2: Check Database Order

```bash
mongosh
db.orders.findOne({_id: ObjectId("...")})
```

Should show updated fields:
```javascript
{
  paymentStatus: "success",  // ← CHANGED from "initiated"
  phonpePaymentId: "...",    // ← POPULATED from callback
  status: "processing",      // ← CHANGED from "pending"
  // ... other fields
}
```

### Step 8.3: Check Backend Callback Logs

Backend console should show callback received:
```
PhonePe Callback Received
Transaction ID: TXN_[orderId]_[timestamp]
Code: PAYMENT_SUCCESS
Order Updated: [orderId]
Payment Status: success
```

### Step 8.4: Verify Cart Cleared

1. Check cart icon
2. Should show "0" items or be empty
3. Go to **Cart** page
4. Should show "Your cart is empty"

---

## Phase 9: Test Payment Failure Path

### Step 9.1: Go Back to Home

Click home or back button.

### Step 9.2: Add Another Product

1. Add different product to cart
2. Go to checkout
3. Fill shipping address
4. Select payment method

### Step 9.3: Cancel Payment

At PhonePe sandbox:
1. Don't complete payment
2. Click **Cancel** or close page
3. You're redirected back to app

OR in PhonePe, select a failed test transaction option if available.

### Step 9.4: Check Order Status

In database:
```bash
mongosh
db.orders.findOne({})  // Latest order
```

Should show:
```javascript
{
  paymentStatus: "failed",
  status: "pending",  // NOT updated to processing
  phonpePaymentId: null
}
```

### Step 9.5: Retry Payment

On failure, user should be able to:
1. Return to cart
2. Retry checkout
3. Same items should still be in cart
4. Create new order with new payment attempt

---

## Phase 10: Additional Test Cases

### Test Case: Multiple Payments

✅ Complete 2-3 successful payments
✅ Verify each has unique transaction ID
✅ Verify all show in "My Orders"
✅ Check database: 3 separate order documents

### Test Case: Different UPI Methods

✅ Try "Google Pay" payment method
✅ Try "PhonePe" payment method  
✅ Try "Paytm" payment method
✅ Try "BHIM" payment method

Each should:
- Submit to PhonePe gateway
- Allow test payment
- Update payment status

### Test Case: Refund Functionality

If refund API implemented:

```bash
POST http://localhost:5000/api/payments/refund
Body: {
  "orderId": "[successful_order_id]"
}
Headers: {
  "Authorization": "Bearer [jwt_token]"
}
```

Should:
- Call PhonePe refund API
- Update order.paymentStatus = "refunded"
- Update order.status = "cancelled"

### Test Case: Amount Variations

✅ Test with amount: 100 (₹100)
✅ Test with amount: 999.99 (₹999.99)
✅ Test with amount: 10000 (₹10,000)

Each should:
- Create order with correct amount
- Process payment correctly
- Update database with amount

### Test Case: Login & Logout

✅ Login → Add to cart → Checkout
✅ Logout → Try to access checkout (should redirect to login)
✅ Login with different user → Previous orders not visible
✅ Verify order belongs to correct user in database

---

## Debugging Commands

### Check Backend Status

```bash
# Check if backend running
curl http://localhost:5000/api/health
# Should return: {"status":"ok"}

# Check if payment routes exist
curl http://localhost:5000/api/payments/test
# Should return some response or error
```

### Check MongoDB Connection

```bash
mongosh

# Check if database exists
show databases
# Should show "ecommerce" database

# Check orders collection
use ecommerce
db.orders.count()
# Should show number of orders

# Check latest order
db.orders.findOne({}, {sort: {createdAt: -1}})
```

### Check Frontend Logs

Open browser DevTools → Console

Look for:
```javascript
// Success:
Initiating PhonePe payment
Payment order created successfully
Form submitted to PhonePe

// Errors:
Error creating payment order
Error: PHONEPE_MERCHANT_ID not configured
Signature verification failed
```

### Check Backend Logs

Terminal where backend running should show:
```
POST /api/payments/create-order
Creating PhonePe payment order...
[Merchant ID: M12345ABC]
[Transaction ID: TXN_...]
Payment order created successfully

POST /api/payments/callback
PhonePe Callback received
[Code: PAYMENT_SUCCESS]
Order updated
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot POST /api/payments/..." | Backend not running | Run `npm start` in backend |
| "PHONEPE_MERCHANT_ID is undefined" | Missing .env variables | Add to `backend/.env` |
| Form not submitting to PhonePe | Wrong paymentUrl | Check PHONEPE_HOST_URL is correct |
| Callback not received | Backend offline or wrong CALLBACK_URL | Check backend running, verify URL |
| Order not updating after payment | Order ID not matching | Check transaction ID format |
| Cart not clearing | Frontend not calling API | Check Checkout.js handleSubmit |
| "Network error" in browser | Backend CORS issue | Add CORS headers if needed |

---

## Test Results Checklist

Use this checklist to verify everything works:

### Registration & Login
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] JWT token generated
- [ ] User info shown in navbar

### Product & Cart
- [ ] Can view products
- [ ] Can add to cart
- [ ] Cart icon shows count
- [ ] Can go to checkout
- [ ] Can modify cart quantities

### Checkout
- [ ] Shipping form appears
- [ ] Can select payment method
- [ ] Payment button visible
- [ ] Form validation works

### PhonePe Payment
- [ ] Form submits to PhonePe
- [ ] PhonePe sandbox page loads
- [ ] Can complete test payment
- [ ] Redirected back to app

### Order Confirmation
- [ ] Order confirmation page shows
- [ ] Order details displayed
- [ ] Right amount shown
- [ ] Order date shown

### Database Verification
- [ ] Order created in database
- [ ] paymentStatus changed to "success"
- [ ] phonpeTransactionId populated
- [ ] status changed to "processing"

### Post-Payment
- [ ] Cart cleared
- [ ] Order appears in "My Orders"
- [ ] Cannot add to cart again from same session
- [ ] Can start new order

### Error Handling
- [ ] Can cancel payment
- [ ] Can retry payment
- [ ] Failed orders show in history
- [ ] Error messages display

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Move to production credentials
2. Update PHONEPE_HOST_URL to production
3. Add production merchant ID and salt key
4. Deploy to production server
5. Enable monitoring/logging

### If Tests Fail ❌
1. Check specific test case that failed
2. Review error logs in browser console
3. Review error logs in backend terminal
4. Check MongoDB for order state
5. Verify .env variables are set correctly
6. Post error in PhonePe forum/docs

---

## Performance Testing

Once basic functionality works:

### Load Testing
```bash
# Test multiple concurrent orders
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/payments/create-order \
    -H "Authorization: Bearer $TOKEN" \
    -d "{orderId: order_$i}" &
done
```

### Performance Checks
- [ ] Payment creation < 1 second
- [ ] Callback processing < 500ms
- [ ] Database updates instant
- [ ] No memory leaks

---

## Monitoring in Production

After successful testing and before going live:

1. **Set up error logging** (Sentry, LogRocket)
2. **Enable payment monitoring** (PhonePe dashboard)
3. **Set up database backups** (MongoDB Atlas)
4. **Enable HTTPS** (SSL certificate)
5. **Set up alerts** for failed payments
6. **Monitor transaction success rate** (target >95%)

---

## Testing Session Summary

**Estimated Time:** 30-45 minutes
**Products Tested:** 5-10
**Payments Tested:** 3-5
**Users Tested:** 1-2

**Outcomes:**
- ✅ Full payment flow verified
- ✅ Database updates confirmed
- ✅ Callback processing validated
- ✅ Error handling tested
- ✅ Ready for production

---

**Status:** Ready to Start Testing
**Next:** Follow Phase 1 → Phase 10 in order

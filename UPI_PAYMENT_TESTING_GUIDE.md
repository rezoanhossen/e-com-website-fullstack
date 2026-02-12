# UPI Payment Integration - Testing Guide

## Test Environment Setup

### Prerequisites
- Backend running on http://localhost:5000
- Frontend running on http://localhost:3000
- MongoDB connected
- Razorpay test credentials configured

### Browser DevTools
Keep these open during testing:
- **Console Tab:** Watch for JavaScript errors
- **Network Tab:** Monitor API calls
- **Application Tab:** Check localStorage for tokens

---

## Test Case 1: Complete Payment Flow - Google Pay

### Test Steps
1. **Homepage** 
   - [ ] Load http://localhost:3000
   - [ ] Verify no console errors
   - [ ] Verify Razorpay script loads (Network tab)

2. **Login/Register**
   - [ ] Create new account or login
   - [ ] Verify JWT token in localStorage
   - [ ] Verify user context shows logged-in state

3. **Add to Cart**
   - [ ] Browse products on home page
   - [ ] Click "Add to Cart" on 2-3 products
   - [ ] Verify cart count updates in navbar
   - [ ] Verify CartContext shows items

4. **Proceed to Checkout**
   - [ ] Click cart icon → "Go to Checkout"
   - [ ] Verify order summary displays all items
   - [ ] Verify total price is correct
   - [ ] Verify cart items shown in summary

5. **Fill Shipping Address**
   - [ ] Full Name: `Test User`
   - [ ] Email: `test@example.com`
   - [ ] Phone: `9999999999`
   - [ ] Address: `123 Main Street`
   - [ ] City: `Bangalore`
   - [ ] ZIP Code: `560001`
   - [ ] Country: `India`
   - [ ] Click "Continue"
   - [ ] Verify address saved (should pre-fill next time)

6. **Select Payment Method**
   - [ ] Verify dropdown shows "UPI Payments" section
   - [ ] Verify options: Google Pay, PhonePe, Paytm, BHIM
   - [ ] Verify Card Payments section exists
   - [ ] Select "Google Pay"

7. **Apply Coupon (Optional)**
   - [ ] Enter valid coupon code (e.g., "SAVE10")
   - [ ] Click "Apply" button
   - [ ] Verify discount applied if coupon valid
   - [ ] Verify fixed total with discount

8. **Place Order**
   - [ ] Click "Place Order" button
   - [ ] Verify button shows "Creating Order..."
   - [ ] Check Network tab - POST to `/api/orders`
   - [ ] Verify order created in browser console logs

9. **Razorpay Modal Opens**
   - [ ] Verify modal appears overlaying page
   - [ ] Verify correct amount shown (with discount if applied)
   - [ ] Verify order ID in modal
   - [ ] Verify "Google Pay" option visible

10. **Complete Payment**
    - [ ] Click on Google Pay option
    - [ ] In test mode: payment auto-completes or use test handle
    - [ ] Verify button changes to "Processing Payment..."
    - [ ] Check Network tab - POST to `/api/payments/verify`

11. **Order Confirmation**
    - [ ] Verify redirect to `/order-confirmation/{orderId}`
    - [ ] Verify order details displayed
    - [ ] Verify payment status shows "success"
    - [ ] Verify email matches user
    - [ ] Verify address matches input

### Expected Database State
```javascript
// Check MongoDB
db.orders.findOne({_id: ObjectId("...")}, {
  paymentMethod: 1,
  paymentStatus: 1,
  razorpayOrderId: 1,
  razorpayPaymentId: 1,
  status: 1,
  items: 1,
  totalPrice: 1
})

// Should show:
{
  paymentMethod: "google-pay",
  paymentStatus: "success",
  razorpayOrderId: "order_...",
  razorpayPaymentId: "pay_...",
  status: "processing",
  items: [...],
  totalPrice: 1999.99
}
```

### Expected API Calls (Network Tab)
1. **POST /api/orders** → 201 Created
   - Request body includes paymentMethod: "google-pay"
   - Response includes order object with _id

2. **POST /api/payments/create-order** → 200 OK
   - Request: {orderId, amount}
   - Response: {razorpayOrderId, keyId, amount}

3. **POST /api/payments/verify** → 200 OK
   - Request: {orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature}
   - Response: {success: true, order: {...}}

---

## Test Case 2: PhonePe Payment Method

### Quick Test
```
1. Repeat Test Case 1 but select "PhonePe" instead
2. Everything should work identically
3. Only difference: paymentMethod = "phonepe" in database
```

### Verification
```javascript
db.orders.findOne({_id: ObjectId("...")}, {paymentMethod: 1})
// Should show: {paymentMethod: "phonepe"}
```

---

## Test Case 3: Paytm Payment Method

### Quick Test
```
1. Repeat Test Case 1 but select "Paytm"
2. Everything should work identically
3. Only difference: paymentMethod = "paytm" in database
```

---

## Test Case 4: BHIM Payment Method

### Quick Test
```
1. Repeat Test Case 1 but select "BHIM"
2. Everything should work identically
3. Only difference: paymentMethod = "bhim" in database
```

---

## Test Case 5: Coupon Code Validation

### Setup
Before test, create a test coupon in MongoDB:
```javascript
db.coupons.insertOne({
  code: "TESTSAVE20",
  discountPercentage: 20,
  maxDiscountAmount: 500,
  minOrderAmount: 1000,
  validFrom: new Date("2024-01-01"),
  validUntil: new Date("2025-12-31"),
  maxUses: 100,
  currentUses: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Test Steps
1. **Add Products** - Total ≥ ₹1000
2. **Proceed to Checkout** - Don't fill address yet
3. **Enter Coupon Code**
   - [ ] Enter "TESTSAVE20"
   - [ ] Click "Apply" button
   - [ ] Verify success message: "✓ Coupon applied! 20% off - Save ₹..."
   - [ ] Verify discount shown in order summary
   - [ ] Verify button shows "✓ Applied" (disabled)

4. **Verify Calculation**
   - [ ] Subtotal = Original total
   - [ ] Discount = Subtotal × 20% (but ≤ ₹500)
   - [ ] Final Total = Subtotal - Discount
   - [ ] Example: ₹2000 → Save ₹400 → Final ₹1600

5. **Complete Payment**
   - [ ] Proceed with checkout
   - [ ] Verify coupon applied in order
   - [ ] Check database: appliedCoupon = "TESTSAVE20"

### Invalid Coupon Test
1. **Enter Invalid Code**
   - [ ] Enter "INVALIDCODE"
   - [ ] Click "Apply"
   - [ ] Verify error message appears
   - [ ] Verify "Apply" button stays enabled

---

## Test Case 6: Payment Failure Handling

### Scenario A: User Cancels Payment
1. **Start Checkout**
   - [ ] Add products to cart
   - [ ] Proceed to checkout
   - [ ] Fill shipping address
   - [ ] Select "Google Pay"
   - [ ] Click "Place Order"

2. **In Razorpay Modal**
   - [ ] Verify modal opens
   - [ ] Click X button or click outside to cancel
   - [ ] Verify modal closes

3. **Expected Behavior**
   - [ ] Error message shows: "Payment cancelled. Please try again."
   - [ ] Page stays on checkout
   - [ ] Can try again with same form data
   - [ ] Check database: paymentStatus = "failed"

### Network Verification
```
Network tab should show:
1. POST /api/orders → 201 (order created)
2. POST /api/payments/create-order → 200 (Razorpay order created)
3. POST /api/payments/failure → 200 (failure recorded)
4. NO /api/payments/verify call (because payment cancelled)
```

---

## Test Case 7: Signature Verification

### Test Invalid Signature
This is a SECURITY test - tests backend signature validation.

1. **Intercept Network Request** (Using browser DevTools)
   - [ ] Open Network tab
   - [ ] Start payment flow
   - [ ] When `/api/payments/verify` request appears, intercept it
   - [ ] Modify `razorpaySignature` field to wrong value
   - [ ] Send request

2. **Expected Response**
   - [ ] Status 400 Bad Request
   - [ ] Error message: "Payment verification failed"
   - [ ] Order NOT updated to success
   - [ ] No order confirmation redirect

### Backend Verification
Check server logs:
```
Payment verification failed: Signatures don't match
```

---

## Test Case 8: Empty Cart Edge Case

### Test Steps
1. **Add products to cart**
2. **Go to checkout**
3. **In another tab, clear cart** (simulate concurrent shopping)
4. **Try to place order**
   - [ ] Verify error message or behavior
   - [ ] Check if order creation fails appropriately

---

## Test Case 9: Insufficient Data Validation

### Test: Missing Shipping Address Field
1. **Proceed to checkout**
2. **Skip address, click "Place Order"**
   - [ ] Verify error: "Please add an address to continue"
   - [ ] Verify form still displayed
   - [ ] Verify can fill address and retry

### Test: Missing Email
1. **Fill form, clear email field**
2. **Click "Place Order"**
   - [ ] Verify error message for email
   - [ ] Verify other fields retained

---

## Test Case 10: Multiple Orders by Same User

### Test Steps
1. **Complete Payment** (Test Case 1) → Order A ID
2. **Go Home** - Restart shopping
3. **Add different products**
4. **Complete Another Payment** → Order B ID
5. **Go to Orders Page**
   - [ ] Verify both Order A and Order B listed
   - [ ] Verify different products in each
   - [ ] Verify payment status for both = "success"

### Database Check
```javascript
db.orders.find({userId: ObjectId("...")}).toArray()
// Should show both orders with different items
```

---

## Test Case 11: Unauthenticated User

### Test Steps
1. **Logout** (if logged in)
2. **Navigate to `/checkout`**
   - [ ] Verify redirected to login page
   - [ ] OR verify error message
   - [ ] Verify cannot proceed

3. **Or try to access payment endpoints directly**
   ```
   curl -X POST http://localhost:5000/api/payments/create-order \
     -H "Content-Type: application/json" \
     -d '{"orderId":"...", "amount": 1000}'
   ```
   - [ ] Verify 401 Unauthorized response
   - [ ] Verify error: "Authentication required"

---

## Test Case 12: Card Payment (Non-UPI)

### Test Steps
1. **Proceed to checkout**
2. **Select "Credit Card"** from dropdown
3. **Fill shipping address**
4. **Click "Place Order"**

### Expected Behavior
- [ ] NO Razorpay modal opens (card payments not implemented in this phase)
- [ ] Order created directly
- [ ] Verify message: "Order placed successfully"
- [ ] Check database: paymentStatus = "pending" (not success, since payment not processed)
- [ ] Note: Card implementation separate from UPI; this confirms UPI-specific flow works

---

## Test Case 13: Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari iOS
- [ ] UC Browser
- [ ] Samsung Browser

### Test on Mobile
- [ ] Verify responsive checkout form
- [ ] Verify Razorpay modal opens
- [ ] Verify UPI app selection works
- [ ] Verify payment flow completes

---

## Test Case 14: Network Error Handling

### Simulate Network Failure
1. **Open DevTools**
2. **Go to Network tab** → check "Offline"
3. **Try to checkout**
   - [ ] Verify appropriate error message
   - [ ] Verify can retry when back online

### Simulate API Error
1. **Stop backend server**
2. **Try payment flow**
   - [ ] Verify connection error message
   - [ ] Verify user-friendly error display

---

## Test Case 15: Data Security

### Test Data Exposure
1. **Check localStorage**
   - [ ] Should contain: JWT token, cart items
   - [ ] Should NOT contain: RAZORPAY_KEY_SECRET
   - [ ] Should NOT contain: password or sensitive data

2. **Check Network Tab**
   - [ ] Verify API calls use Authorization header
   - [ ] Verify no sensitive data in request bodies (except amounts)
   - [ ] Verify HTTPS used in production (http OK for localhost)

3. **Check Response Data**
   - [ ] Verify payment responses don't include KEY_SECRET
   - [ ] Verify refund responses secure
   - [ ] Verify order details authorization checked

---

## Performance Testing

### Test Case 16: Load Time

**Metrics to Check:**
- [ ] Page load < 3 seconds
- [ ] Checkout form renders < 2 seconds
- [ ] Razorpay script loads < 2 seconds
- [ ] Payment verify completes < 5 seconds

### Test Case 17: Concurrent Payments

1. **Open checkout in 2 tabs**
2. **Place order in both simultaneously**
3. **Verify both process correctly**
4. **Check database: both orders created with correct data**

---

## Regression Testing Suite

Run this after any code changes:

### Quick Test (5 minutes)
```
1. Login
2. Add product
3. Checkout with UPI
4. Complete payment
5. Verify order created
6. Check status = "success"
```

### Full Test (20 minutes)
```
1. Test Case 1: Complete Google Pay flow
2. Test Case 2: PhonePe payment
3. Test Case 5: Coupon validation
4. Test Case 6: Payment cancellation
5. Test Case 13: Mobile compatibility
```

---

## Test Data Reference

### Test User Credentials
```
Email: test@example.com
Password: TestPassword123!

Name: Test User
Phone: 9999999999
Address: 123 Test Street
City: Test City
ZIP: 560001
Country: India
```

### Test Product
```
Product: Basic T-Shirt
Price: ₹499.99
Quantity: 2
Subtotal: ₹999.98
```

### Test Coupon
```
Code: TESTSAVE20
Discount: 20%
Min Amount: ₹1000
```

---

## Logging & Debugging

### Backend Logs
Check logs during payment:
```bash
cd backend
npm start

# Look for:
# ✓ Order created: order_123
# ✓ Payment initiated: razorpay_order_456  
# ✓ Signature verified successfully
# ✓ Order status updated to processing
```

### Browser Console
```javascript
// Check for these log messages
console.log("Razorpay script loaded")
console.log("Creating payment order...")
console.log("Payment initiated: ", razorpayOrderId)
console.log("Verifying payment signature...")
console.log("Payment verified, redirecting...")
```

### Database Queries
```javascript
// Quick verification
db.orders.findOne(
  {_id: ObjectId("...")},
  {paymentStatus: 1, razorpayOrderId: 1, razorpayPaymentId: 1, status: 1}
)

// Expected output
{
  _id: ObjectId("..."),
  paymentStatus: "success",
  razorpayOrderId: "order_...",
  razorpayPaymentId: "pay_...",
  status: "processing"
}
```

---

## Completion Checklist

### All Tests Passed
- [ ] Test Case 1: Google Pay ✓
- [ ] Test Case 2: PhonePe ✓
- [ ] Test Case 3: Paytm ✓
- [ ] Test Case 4: BHIM ✓
- [ ] Test Case 5: Coupons ✓
- [ ] Test Case 6: Payment Failure ✓
- [ ] Test Case 7: Signature Verification ✓
- [ ] Test Case 8: Empty Cart ✓
- [ ] Test Case 9: Validation ✓
- [ ] Test Case 10: Multiple Orders ✓
- [ ] Test Case 11: Auth Check ✓
- [ ] Test Case 12: Card Payment ✓
- [ ] Test Case 13: Browsers ✓
- [ ] Test Case 14: Error Handling ✓
- [ ] Test Case 15: Security ✓
- [ ] Test Case 16: Performance ✓
- [ ] Test Case 17: Concurrency ✓

### Ready for Production
- [ ] All manual tests passed
- [ ] No console errors
- [ ] All API calls successful
- [ ] Database transactions correct
- [ ] Security checks passed
- [ ] Performance acceptable
- [ ] Error handling works
- [ ] Production environment configured

---

**Test Duration:** 2-3 hours (comprehensive)
**Difficulty:** Medium
**Automation:** Can be automated with Cypress or Playwright

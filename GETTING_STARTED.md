# E-Commerce System - Getting Started Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js installed
- MongoDB running
- Backend and frontend already set up

### Step 1: Start Backend Server
```bash
cd backend
npm start
```
Expected output:
```
Server running on port 5000
MongoDB connected
```

### Step 2: Start Frontend Server
```bash
# In a new terminal
cd frontend
npm start
```
Expected output:
```
Compiled successfully!
On Your Network: http://192.168.x.x:3000
```

### Step 3: Open Browser
Navigate to: `http://localhost:3000`

### Step 4: Test the System
1. Register a new account (or login if you have one)
2. Click on a product → Click "Add to Cart"
3. Click cart icon (🛒) in navbar
4. Click "Proceed to Checkout"
5. Fill in shipping information
6. Select payment method
7. Click "Place Order"
8. View order in "Orders" page

---

## 📖 Detailed Setup Guide

### Backend Setup

#### 1. Ensure Models Exist
Check that these files exist:
```
backend/
├── models/
│   ├── Cart.js ✓
│   ├── Order.js ✓
│   ├── Product.js ✓
│   └── User.js ✓
```

#### 2. Ensure Controllers Exist
```
backend/
└── controllers/
    ├── cartController.js ✓
    ├── orderController.js ✓
    ├── authController.js ✓
    └── productController.js ✓
```

#### 3. Ensure Routes Exist
```
backend/
└── routes/
    ├── cart.js ✓
    ├── orders.js ✓
    ├── auth.js ✓
    ├── products.js ✓
    └── coupons.js ✓
```

#### 4. Check Server Configuration
Verify `backend/server.js` includes:
```javascript
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
```

#### 5. Start Backend
```bash
cd backend
npm start
```

Test the API:
```bash
# In another terminal
curl http://localhost:5000/api/health
# Response: {"status":"Backend running"}
```

---

### Frontend Setup

#### 1. Verify CartContext Exists
```
frontend/src/context/CartContext.js ✓
```

#### 2. Verify Pages Exist
```
frontend/src/pages/
├── Cart.js ✓
├── Checkout.js ✓
├── Orders.js ✓
└── AdminOrders.js ✓
```

#### 3. Verify Styles Exist
```
frontend/src/styles/
├── Cart.css ✓
├── Checkout.css ✓
├── Orders.css ✓
├── AdminOrders.css ✓
└── EcommerceEnhancements.css ✓
```

#### 4. Check App.js Configuration
Verify `frontend/src/App.js` includes:
```javascript
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

// In return statement:
<CartProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      {/* other routes */}
    </Routes>
  </BrowserRouter>
</CartProvider>
```

#### 5. Check Component Updates
Verify `frontend/src/components/Navbar.js` imports CartContext:
```javascript
import { CartContext } from '../context/CartContext';
```

#### 6. Start Frontend
```bash
cd frontend
npm start
```

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] Home page loads with products
- [ ] "Add to Cart" button is functional
- [ ] Cart icon shows item count
- [ ] Cart icon has badge notification

### Shopping Cart
- [ ] Can view cart page
- [ ] Cart shows all items
- [ ] Can adjust quantities (+/- buttons)
- [ ] Total price updates correctly
- [ ] Can remove items (✕ button)
- [ ] "Continue Shopping" returns to home
- [ ] Empty cart shows proper message

### Checkout Process
- [ ] "Proceed to Checkout" button works
- [ ] Checkout form appears
- [ ] Shipping form accepts data
- [ ] Payment method dropdown works
- [ ] Coupon code field is present
- [ ] "Place Order" button submits

### Order Management
- [ ] Order confirmation appears
- [ ] Orders page accessible from navbar
- [ ] Can view all user orders
- [ ] Order details expand/collapse
- [ ] Can see order status
- [ ] Can cancel pending orders
- [ ] Can view order items and totals

### Admin Functions
- [ ] Can access Admin panel
- [ ] Orders tab appears in Admin panel
- [ ] Can view all orders (admin view)
- [ ] Can filter by status
- [ ] Can update order status
- [ ] Modal shows order details
- [ ] Changes save correctly

---

## 🐛 Troubleshooting

### Issue: "Cart" page shows blank/errors
**Solution**:
1. Check browser console for errors (F12)
2. Verify CartContext is imported in App.js
3. Check that cart routes exist in backend
4. Verify MongoDB is running

### Issue: Add to cart doesn't work
**Solution**:
1. Login first (authentication required)
2. Check browser console for error messages
3. Verify backend is running on port 5000
4. Check that cartController.js exists

### Issue: Checkout form doesn't submit
**Solution**:
1. Fill in all required fields
2. Select a payment method
3. Check browser console for validation errors
4. Verify order routes exist in backend

### Issue: Orders don't appear
**Solution**:
1. Make sure you placed an order successfully
2. Wait for page to load (check loading spinner)
3. Check that orderController.js exists
4. Verify user is logged in

### Issue: Admin orders page is empty
**Solution**:
1. Login with admin account (isAdmin: true)
2. Make sure orders exist in database
3. Check that order routes have admin middleware
4. Verify AdminOrders.js component is imported

### Issue: "Cannot find module" errors
**Solution**:
1. Run `npm install` in backend folder
2. Run `npm install` in frontend folder
3. Check that all imported files exist
4. Verify import paths are correct

### Issue: Styles are not applying
**Solution**:
1. Check that CSS files exist in `frontend/src/styles/`
2. Verify CSS is imported in components
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check browser console for CSS errors

---

## 📱 Testing on Mobile

### Using Chrome DevTools
1. Open browser
2. Press F12
3. Click device icon (top-left of DevTools)
4. Select iPhone/Android model
5. Test cart, checkout, and orders

### Responsive Breakpoints
- **Mobile**: < 480px ✓
- **Tablet**: 480px - 768px ✓
- **Desktop**: > 768px ✓

---

## 🔍 Verification Checklist

### Backend Files Exist
```bash
ls backend/models/Cart.js
ls backend/models/Order.js
ls backend/controllers/cartController.js
ls backend/controllers/orderController.js
ls backend/routes/cart.js
ls backend/routes/orders.js
```

### Frontend Files Exist
```bash
ls frontend/src/context/CartContext.js
ls frontend/src/pages/Cart.js
ls frontend/src/pages/Checkout.js
ls frontend/src/pages/Orders.js
ls frontend/src/pages/AdminOrders.js
ls frontend/src/styles/Cart.css
ls frontend/src/styles/Checkout.css
ls frontend/src/styles/Orders.css
ls frontend/src/styles/AdminOrders.css
ls frontend/src/styles/EcommerceEnhancements.css
```

### API Endpoints Working
```bash
# Terminal 1: Start backend
cd backend && npm start

# Terminal 2: Test API
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/cart
```

---

## 📚 Documentation Guide

### For Quick Overview
👉 Read: **ECOMMERCE_SUMMARY.md**

### For Technical Details
👉 Read: **ECOMMERCE_IMPLEMENTATION.md**

### For Quick Reference
👉 Read: **ECOMMERCE_QUICK_REFERENCE.md**

### For User Flows
👉 Read: **USER_EXPERIENCE_FLOW.md**

### For File Details
👉 Read: **FILE_MANIFEST.md**

---

## 🆘 Getting Help

### Check These First
1. Browser console (F12) for JavaScript errors
2. Backend terminal for server errors
3. Network tab (F12) to see API requests
4. Documentation files for feature details

### Common Commands
```bash
# Clear frontend cache
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear backend cache
cd backend
rm -rf node_modules package-lock.json
npm install

# Check if ports are in use
lsof -i :3000    # Frontend
lsof -i :5000    # Backend
```

### MongoDB Check
```bash
# Verify MongoDB is running
# Windows: Check Services
# Mac/Linux: brew services list | grep mongodb
```

---

## ✅ Success Checklist

After completing setup, you should have:

- [x] Backend running on port 5000
- [x] Frontend running on port 3000
- [x] MongoDB connected
- [x] Can register/login
- [x] Can add items to cart
- [x] Can view shopping cart
- [x] Can complete checkout
- [x] Can view orders
- [x] Admin can view all orders
- [x] Cart updates in real-time
- [x] Stock management works
- [x] Responsive design works
- [x] All CSS styling applied

---

## 🎉 You're Ready!

If all checklist items are complete, your e-commerce system is fully functional and ready for use!

### Next Actions
1. **Test thoroughly** - Try all features
2. **Deploy** - When satisfied, deploy to production
3. **Monitor** - Watch for errors in logs
4. **Enhance** - Add features from "Next Steps" as needed

---

## 📞 Quick Reference

| Issue | Solution |
|-------|----------|
| Blank cart page | Clear cache, restart frontend |
| Add to cart not working | Login first, check token |
| Checkout form won't submit | Fill all fields, check console |
| Orders don't show | Wait for load, check user is logged in |
| Admin page empty | Login as admin, check database |
| Styles missing | Import CSS in component, clear cache |
| API errors | Verify backend running, check MongoDB |

---

**Version**: 1.0
**Last Updated**: February 2, 2026
**Status**: Ready for Production ✅

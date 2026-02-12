# Complete Setup Instructions

## 🎯 Overview

**LUXE** is a full-stack luxury e-commerce platform built with:
- **Frontend:** React 18 with responsive CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Authentication:** JWT

---

## 📋 Prerequisites

Install these before starting:

1. **Node.js** (v14+)
   - Download: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB**
   - Option A: Local installation
     - Download: https://www.mongodb.com/try/download/community
     - Start service (Windows): `mongod`
   - Option B: MongoDB Atlas (Cloud - Recommended)
     - Sign up: https://www.mongodb.com/cloud/atlas
     - Create free cluster
     - Get connection string

3. **Git** (Optional but recommended)
   - Download: https://git-scm.com/

4. **Code Editor** (VS Code recommended)
   - Download: https://code.visualstudio.com/

---

## 🚀 Installation Steps

### Step 1: Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

**Edit `backend/.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/luxury-ecommerce
JWT_SECRET=change_me_to_random_string_12345
PORT=5000
NODE_ENV=development
```

If using MongoDB Atlas, your URI will look like:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luxury-ecommerce
```

### Step 2: Start MongoDB (if local)

```powershell
# In a separate terminal/PowerShell window
mongod
```

You should see: `waiting for connections on port 27017`

### Step 3: Start Backend Server

```powershell
# In your backend directory
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB connected
```

✅ **Backend is ready!** Test it: http://localhost:5000/api/health

### Step 4: Frontend Setup

```powershell
# Open new terminal/PowerShell and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

✅ **Frontend will open automatically** at http://localhost:3000

---

## 🔐 Create Test Users

### Method 1: Direct Register (Easy)

1. Go to http://localhost:3000/register
2. Create account with:
   - Email: `testuser@example.com`
   - Password: `testpass123`
3. Account created! You can now login.

### Method 2: Make User Admin (MongoDB Compass)

1. Download and install [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to your MongoDB instance
3. Navigate to `luxury-ecommerce` → `users` collection
4. Find your user and add/set: `"isAdmin": true`
5. Save and refresh website

### Method 3: Insert via Script (Advanced)

Use [mongosh](https://www.mongodb.com/docs/mongodb-shell/) or Compass Query editor:

```javascript
db.users.updateOne(
  { email: "testuser@example.com" },
  { $set: { isAdmin: true } }
)
```

---

## 🎨 Add Sample Products

### Via Admin Panel:

1. Login with admin account
2. Click **Admin** in navbar
3. Under **Products Tab**, fill out:
   - Name: "Silk Evening Gown"
   - Description: "Elegant black silk..."
   - Price: 1299.99
   - Category: "Dresses"
   - Stock: 15
   - Image URL: (leave blank for placeholder)
4. Click **Add Product**

### Via Database (SAMPLE_DATA.js):

```powershell
# In MongoDB Compass, create database/collections first, then:
# Open mongosh terminal and run the contents of SAMPLE_DATA.js
```

---

## 💳 Create Test Coupons

**Admin Panel → Coupons Tab:**

1. Code: `LUXURY20`
2. Discount: `20`
3. Type: `Percentage`
4. Expiry: (Select future date)
5. Click **Add Coupon**

---

## 🧪 Test the Application

### User Flow:
1. Register new account → `/register`
2. Login → `/login`
3. Browse products → `/`
4. View in admin: Click **Admin** (if admin user)

### Admin Flow:
1. Login with admin account
2. Click **Admin** in navbar
3. **Products Tab:**
   - ✅ View all products
   - ✅ Add new product
   - ✅ Delete product
4. **Coupons Tab:**
   - ✅ View all coupons
   - ✅ Add new coupon
   - ✅ Delete coupon

---

## 🛠️ Troubleshooting

### ❌ Backend won't start - "EADDRINUSE"

Port 5000 is already in use.

**Solution:**
```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### ❌ MongoDB connection error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Make sure `mongod` is running
- Check `MONGODB_URI` in `.env` is correct
- For MongoDB Atlas, ensure IP whitelist includes your IP (or use 0.0.0.0/0 for testing)

### ❌ Frontend can't reach backend

**Solution:**
- Verify backend is running on http://localhost:5000/api/health
- Check `proxy` in `frontend/package.json` is set to `http://localhost:5000`
- Clear frontend cache: `npm cache clean --force`

### ❌ "Cannot GET /api/products"

**Solution:**
- Ensure backend server is running
- Check you're using correct API endpoints
- Frontend proxy might not be working - restart frontend server

### ❌ Login/Register fails

**Solution:**
- Check MongoDB connection
- Verify JWT_SECRET is set in `.env`
- Check browser console for error messages
- Ensure email format is valid

---

## 📁 Project Structure Overview

```
web1site/
├── backend/
│   ├── models/
│   │   ├── User.js            (User schema with password hashing)
│   │   ├── Product.js         (Product schema)
│   │   └── Coupon.js          (Coupon schema)
│   ├── routes/
│   │   ├── auth.js            (Auth endpoints)
│   │   ├── products.js        (Product CRUD)
│   │   └── coupons.js         (Coupon CRUD)
│   ├── controllers/
│   │   ├── authController.js  (Auth logic)
│   │   ├── productController.js
│   │   └── couponController.js
│   ├── middleware/
│   │   └── auth.js            (JWT verification & admin check)
│   ├── server.js              (Express app setup)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js      (Navigation bar)
│   │   ├── pages/
│   │   │   ├── Home.js        (Product list)
│   │   │   ├── Login.js       (Login page)
│   │   │   ├── Register.js    (Register page)
│   │   │   └── Admin.js       (Admin dashboard)
│   │   ├── context/
│   │   │   └── AuthContext.js (Auth state management)
│   │   ├── utils/
│   │   │   └── api.js         (API calls with axios)
│   │   ├── App.js             (Main app component)
│   │   ├── App.css            (Luxury styling)
│   │   └── index.js           (React entry point)
│   ├── public/
│   │   └── index.html
│   └── package.json
├── README.md                   (Full documentation)
├── QUICKSTART.md              (Quick setup guide)
├── SETUP.md                   (This file)
├── SAMPLE_DATA.js             (Test data script)
└── .gitignore
```

---

## 🔗 API Endpoints Reference

**Base URL:** `http://localhost:5000/api`

### Authentication
```
POST   /auth/register           Create new user
POST   /auth/login              User login
GET    /auth/profile            Get logged-in user (needs token)
```

### Products
```
GET    /products                Get all products
GET    /products/:id            Get single product
POST   /products                Create product (admin only)
PUT    /products/:id            Update product (admin only)
DELETE /products/:id            Delete product (admin only)
```

### Coupons
```
GET    /coupons                 Get all coupons (admin only)
POST   /coupons/validate        Validate coupon code
POST   /coupons                 Create coupon (admin only)
PUT    /coupons/:id             Update coupon (admin only)
DELETE /coupons/:id             Delete coupon (admin only)
```

---

## 🎨 Design Features

- **Color Scheme:**
  - Primary: `#1a1a1a` (dark luxury)
  - Accent: `#d4af37` (gold)
  - Light: `#f5f5f5`

- **Typography:**
  - Clean, minimal fonts
  - Letter spacing for elegance
  - Responsive text sizes

- **Components:**
  - Smooth hover effects
  - Elegant shadows
  - Responsive grid layouts
  - Mobile-first design

---

## 📚 Next Steps

### Immediate:
1. ✅ Follow setup steps
2. ✅ Create test accounts
3. ✅ Add sample products
4. ✅ Test admin features

### Enhancement Ideas:
- [ ] Shopping cart (localStorage)
- [ ] Product images upload
- [ ] User profile page
- [ ] Order history
- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] Product reviews
- [ ] Wishlist feature
- [ ] Search & filter

### Deployment:
- **Frontend:** Vercel, Netlify
- **Backend:** Heroku, Railway, Render
- **Database:** MongoDB Atlas

---

## 🆘 Need Help?

### Common Issues:

**Q: How do I make someone an admin?**
A: Use MongoDB Compass to set `isAdmin: true` on a user document

**Q: Can I use MongoDB Atlas instead of local?**
A: Yes! Just update `MONGODB_URI` in `.env` with your Atlas connection string

**Q: How do I deploy this?**
A: See deployment guides in README.md

**Q: Can I customize the UI?**
A: Yes! Edit `frontend/src/App.css` for styling

---

## ✨ You're All Set!

Your luxury e-commerce platform is ready to use. Start with the QUICKSTART.md for a 5-minute setup, or follow this guide for detailed instructions.

**Happy coding!** 🚀

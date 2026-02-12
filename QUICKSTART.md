# LUXE E-Commerce - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Backend Dependencies
```powershell
cd backend
npm install
```

### Step 2: Setup MongoDB
- Install MongoDB Community: https://docs.mongodb.com/manual/installation/
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Step 3: Create Backend .env file
```powershell
# Copy the example
copy .env.example .env

# Edit .env with your MongoDB URI
```

Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/luxury-ecommerce
JWT_SECRET=your_secret_key_12345
PORT=5000
NODE_ENV=development
```

### Step 4: Start Backend
```powershell
npm run dev
```
✅ Backend runs on http://localhost:5000

### Step 5: Install Frontend Dependencies (new terminal)
```powershell
cd frontend
npm install
```

### Step 6: Start Frontend
```powershell
npm start
```
✅ Frontend opens at http://localhost:3000

---

## 🔐 Create Admin User

### Option 1: Using MongoDB Compass
1. Connect to your MongoDB
2. Create database: `luxury-ecommerce`
3. Create collection: `users`
4. Insert document:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "isAdmin": true,
  "createdAt": new Date()
}
```

### Option 2: Quick Register & Promote
1. Register normally on http://localhost:3000/register
2. Connect to MongoDB and update user: `{ isAdmin: true }`

---

## 📋 Test Credentials (After Setup)

**Normal User:**
- Email: user@example.com
- Password: password123

**Admin User:**
- Email: admin@example.com
- Password: admin123

---

## 🎯 Features to Test

### User Features
- ✅ Register account
- ✅ Login
- ✅ View products
- ✅ Logout

### Admin Features (After login as admin)
- ✅ Click "Admin" in navbar
- ✅ **Products Tab:** Add/Delete products
- ✅ **Coupons Tab:** Create/Delete coupons with expiry dates

---

## 🛠️ Common Issues

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
**Fix:** 
- Ensure MongoDB is running: `mongod`
- Or update `MONGODB_URI` in `.env` with correct connection string

### Port 5000 Already in Use
```
Error: listen EADDRINUSE
```
**Fix:** Change `PORT` in `.env` to 5001 or kill process using port 5000

### Frontend can't reach backend
**Fix:** Ensure `proxy: "http://localhost:5000"` is in `frontend/package.json`

### Dependencies not installed
```bash
# Clear cache and reinstall
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

---

## 📱 Project Structure

```
web1site/
├── backend/
│   ├── models/              (User, Product, Coupon schemas)
│   ├── routes/              (API endpoints)
│   ├── controllers/          (Business logic)
│   ├── middleware/           (Authentication)
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/       (Navbar, etc.)
    │   ├── pages/            (Home, Login, Register, Admin)
    │   ├── context/          (Auth context)
    │   ├── utils/            (API calls)
    │   └── App.js
    ├── package.json
    └── public/
```

---

## 🎨 Design Features

- 🌟 Minimal luxury aesthetic
- 🏆 Gold accents (#d4af37)
- 📱 Fully responsive
- ⚡ Fast load times
- 🔒 Secure authentication

---

## 📚 API Endpoints Reference

**Base URL:** `http://localhost:5000/api`

```
POST   /auth/register          Register user
POST   /auth/login             Login user
GET    /auth/profile           Get profile (needs token)

GET    /products               All products
GET    /products/:id           Single product
POST   /products               Create (admin only)
PUT    /products/:id           Update (admin only)
DELETE /products/:id           Delete (admin only)

GET    /coupons                All coupons (admin only)
POST   /coupons/validate       Check coupon validity
POST   /coupons                Create (admin only)
PUT    /coupons/:id            Update (admin only)
DELETE /coupons/:id            Delete (admin only)
```

---

## 🚀 Next Steps

After testing:
1. **Add products** in Admin panel
2. **Create coupons** with discount codes
3. **Test checkout flow** (ready for payment integration)
4. **Customize** styling in `frontend/src/App.css`
5. **Deploy** to Vercel (frontend) + Heroku/Railway (backend)

---

**Need help?** Check the main README.md for detailed documentation.

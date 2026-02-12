# 🐛 Troubleshooting Guide

## Common Issues & Solutions

---

## Backend Issues

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:27017"

**Problem:** MongoDB is not running

**Solution:**
```powershell
# Start MongoDB
mongod

# Or if using MongoDB Atlas, update .env with correct URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luxury-ecommerce
```

---

### ❌ "Error: listen EADDRINUSE :::5000"

**Problem:** Port 5000 is already in use

**Solution Option 1 - Change Port:**
```env
# In backend/.env
PORT=5001
```

**Solution Option 2 - Kill Process:**
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number from above)
taskkill /PID 12345 /F
```

---

### ❌ Backend starts but crashes immediately

**Problem:** Missing dependencies or configuration

**Solution:**
```powershell
cd backend
npm cache clean --force
rm package-lock.json
rm -r node_modules
npm install
npm run dev
```

---

### ❌ "Cannot find module 'express'" or similar

**Problem:** Dependencies not installed

**Solution:**
```powershell
cd backend
npm install

# If that doesn't work, clear cache
npm cache clean --force
npm install --legacy-peer-deps
```

---

### ❌ "TypeError: Cannot read property 'connect' of undefined"

**Problem:** MongoDB connection string is invalid

**Solution:**
1. Check `.env` file exists in `backend/` directory
2. Verify MongoDB is running: `mongod`
3. Test connection string:
   - Local: `mongodb://localhost:27017/luxury-ecommerce`
   - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/luxury-ecommerce`
4. If using Atlas, check IP whitelist

---

### ❌ "jwt malformed" or "invalid token"

**Problem:** JWT_SECRET changed or token corrupted

**Solution:**
1. Clear browser localStorage:
   - Open DevTools (F12)
   - Application → LocalStorage → Delete token
2. Clear cookies
3. Logout and login again
4. Check JWT_SECRET is set in `.env`

---

## Frontend Issues

### ❌ "Error: Cannot GET /api/products"

**Problem:** Backend not running or API path wrong

**Solution:**
```powershell
# 1. Check backend is running
http://localhost:5000/api/health

# 2. If not running, start backend
cd backend
npm run dev

# 3. Verify proxy in frontend/package.json
"proxy": "http://localhost:5000"

# 4. Restart frontend dev server
cd frontend
npm start
```

---

### ❌ Frontend won't start - "Port 3000 in use"

**Problem:** Port 3000 already in use

**Solution Option 1 - Use Different Port:**
```powershell
# Windows PowerShell
$env:PORT=3001
npm start
```

**Solution Option 2 - Kill Process:**
```powershell
netstat -ano | findstr :3000
taskkill /PID 12345 /F
npm start
```

---

### ❌ "npm ERR! code ENOSPC"

**Problem:** Disk space issue or npm cache problem

**Solution:**
```powershell
npm cache clean --force
npm install
```

---

### ❌ Frontend shows "Cannot GET /"

**Problem:** React not compiled or public/index.html missing

**Solution:**
```powershell
cd frontend
npm cache clean --force
rm -r node_modules
rm package-lock.json
npm install
npm start
```

---

### ❌ Login/Register button does nothing

**Problem:** API call failed or error hidden in console

**Solution:**
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify backend is running on port 5000
5. Check .env file in backend

---

### ❌ Login works but can't access admin panel

**Problem:** User not marked as admin in database

**Solution:**
1. MongoDB Compass → Connect to your MongoDB
2. Navigate to `luxury-ecommerce` → `users`
3. Find your user
4. Edit document and add: `"isAdmin": true`
5. Save and refresh browser

---

## Database Issues

### ❌ "MongoServerSelectionError"

**Problem:** Cannot connect to MongoDB

**Solutions:**
```powershell
# 1. Check MongoDB is running
mongod

# 2. Check connection string in .env
# For local: mongodb://localhost:27017/luxury-ecommerce
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/luxury-ecommerce

# 3. For Atlas, verify:
# - Username and password are correct
# - IP is whitelisted (or use 0.0.0.0/0 for testing)
# - Network is available

# 4. Test connection with mongosh
mongosh "your_connection_string"
```

---

### ❌ "Collection not found" or "Cannot create collection"

**Problem:** Database or collection doesn't exist

**Solution:**
MongoDB will auto-create on first use. If issues persist:
```powershell
# Create manually in mongosh
mongosh

# In mongosh shell
use luxury-ecommerce
db.createCollection("users")
db.createCollection("products")
db.createCollection("coupons")
```

---

### ❌ No data appears after adding products

**Problem:** Data saved to wrong database or collection

**Solution:**
```powershell
# Check which database you're using
mongosh
show dbs
use luxury-ecommerce
show collections
db.products.find()

# Verify MONGODB_URI in .env matches
```

---

## Authentication Issues

### ❌ "Token not valid" when trying to access protected routes

**Problem:** Token expired, corrupted, or secret mismatch

**Solution:**
1. Logout completely
2. Clear browser cache:
   - DevTools → Application → Clear storage
3. Login again with valid credentials
4. Check JWT_SECRET is set in `.env`

---

### ❌ "Admin access required" error even though you're admin

**Problem:** Token doesn't include isAdmin flag

**Solution:**
1. Logout
2. Go to MongoDB and verify `isAdmin: true` in database
3. Login again (new token will be created)
4. Refresh page

---

### ❌ Registration fails with "Email already exists"

**Problem:** Email already registered

**Solution:**
1. Use different email
2. Or delete user from MongoDB:
   ```javascript
   // In mongosh
   db.users.deleteOne({ email: "test@example.com" })
   ```

---

## CORS Issues

### ❌ "CORS policy: No 'Access-Control-Allow-Origin' header"

**Problem:** CORS not configured properly

**Solution - For Development:**
Already enabled in `server.js`:
```javascript
app.use(cors());
```

**Solution - For Production:**
```javascript
app.use(cors({
  origin: "https://yourdomain.com",
  credentials: true
}));
```

---

## Performance Issues

### ❌ Application is slow or unresponsive

**Problem:** 
- Large dataset
- Unindexed queries
- Missing database indexes

**Solutions:**
```powershell
# 1. In mongosh, add indexes
db.users.createIndex({ email: 1 })
db.products.createIndex({ category: 1 })
db.coupons.createIndex({ code: 1 })

# 2. Check backend console for slow queries
# 3. Limit results in queries

# 4. Clear old data
db.products.deleteMany({ createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } })
```

---

## Environment Variable Issues

### ❌ "Cannot read property of undefined" (JWT_SECRET)

**Problem:** .env file not loaded or .env doesn't exist

**Solution:**
```powershell
# Create .env from example
cd backend
copy .env.example .env

# Edit .env with your values
# Restart backend: npm run dev
```

---

### ❌ Environment variables not taking effect

**Problem:** Cache issue or require('dotenv') call missing

**Solution:**
```javascript
// Ensure this is at TOP of server.js
require('dotenv').config();

// Then restart
npm run dev
```

---

## Deployment Issues

### ❌ Works locally but not on production

**Problem:** 
- Environment variables not set
- Port configuration
- Database connection

**Solution:**
1. Set all environment variables in production:
   ```
   MONGODB_URI=your_atlas_uri
   JWT_SECRET=production_secret
   NODE_ENV=production
   PORT=3000 (for backend)
   ```

2. Update frontend API URL (if not using proxy)
3. Ensure CORS allows production domain
4. Test endpoints with Postman/Insomnia

---

## Testing Endpoints

### Use REST Client Tools

**Option 1 - Postman:**
1. Download [Postman](https://www.postman.com/)
2. Create new request
3. Test endpoints

**Option 2 - VS Code REST Client:**
Create `test.http` in backend folder:
```http
### Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Products
GET http://localhost:5000/api/products
```

---

## Quick Diagnostics Checklist

### ✅ Before asking for help, verify:

- [ ] Node.js is installed: `node --version`
- [ ] npm is installed: `npm --version`
- [ ] MongoDB is running: `mongod` starts without errors
- [ ] .env file exists in backend/
- [ ] Backend dependencies installed: `npm install` in backend/
- [ ] Frontend dependencies installed: `npm install` in frontend/
- [ ] Backend starts: `npm run dev` in backend/
- [ ] Frontend starts: `npm start` in frontend/
- [ ] Can access http://localhost:3000 (frontend)
- [ ] Can access http://localhost:5000/api/health (backend)
- [ ] Can register new user
- [ ] Can login
- [ ] MongoDB has data: Check in MongoDB Compass

---

## Getting More Help

### Resources:
1. **Check console errors:** DevTools → Console tab
2. **Check network:** DevTools → Network tab
3. **Read logs:** Check backend terminal output
4. **Test API:** Use Postman to test backend endpoints
5. **Review docs:** See README.md, SETUP.md, ARCHITECTURE.md

### If still stuck:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check all environment variables
4. Restart both servers
5. Clear browser cache and localStorage
6. Try in incognito/private window

---

## Known Limitations

- localStorage limited to ~5MB (fine for JWT tokens)
- No real payment processing yet (placeholder)
- No image upload (use external URLs)
- No email notifications yet
- Cart only in frontend state (no persistence)

---

**Still having issues? Review the architecture diagram in ARCHITECTURE.md to understand the flow better!**

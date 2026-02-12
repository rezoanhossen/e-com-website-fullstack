# Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   React Frontend                         │  │
│  │  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │  │
│  │  │   Pages    │ │ Components │ │  Auth Context        │ │  │
│  │  │ - Home     │ │ - Navbar   │ │  - User State        │ │  │
│  │  │ - Login    │ │ - Forms    │ │  - Token Storage     │ │  │
│  │  │ - Register │ │            │ │                      │ │  │
│  │  │ - Admin    │ └────────────┘ └──────────────────────┘ │  │
│  │  └────────────┘                                          │  │
│  │         │                                                │  │
│  │         │ HTTP/JSON                                      │  │
│  │         ▼                                                │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │      Axios API Client (+ JWT Token)             │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────────────┘
                           │ HTTP Requests (port 3000)
                           │ http://localhost:3000
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                   Express Backend (Node.js)                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  API Routes                             │   │
│  │  ┌─────────────┐ ┌──────────────┐ ┌──────────────────┐ │   │
│  │  │ /auth       │ │ /products    │ │ /coupons         │ │   │
│  │  │ - register  │ │ - GET all    │ │ - GET (admin)    │ │   │
│  │  │ - login     │ │ - GET one    │ │ - POST (admin)   │ │   │
│  │  │ - profile   │ │ - POST (admin)│ │ - PUT (admin)    │ │   │
│  │  │             │ │ - PUT (admin)│ │ - DELETE (admin) │ │   │
│  │  │             │ │ - DELETE     │ │ - VALIDATE       │ │   │
│  │  │             │ │   (admin)    │ │                  │ │   │
│  │  └─────────────┘ └──────────────┘ └──────────────────┘ │   │
│  └─────────────┬───────────────────────────────────────────┘   │
│                │                                                │
│  ┌─────────────▼───────────────────────────────────────────┐   │
│  │              Middleware Layer                           │   │
│  │  - JWT Authentication                                  │   │
│  │  - Admin Authorization Check                          │   │
│  │  - CORS & Body Parser                                 │   │
│  └──────────────┬────────────────────────────────────────┘   │
│                 │                                              │
│  ┌──────────────▼────────────────────────────────────────┐   │
│  │         Controllers (Business Logic)                  │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │   │
│  │  │authController│ │productCtrl   │ │couponCtrl    │  │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘  │   │
│  └──────────────┬────────────────────────────────────────┘   │
│                 │                                              │
│  ┌──────────────▼────────────────────────────────────────┐   │
│  │           MongoDB Models (Schemas)                    │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │   │
│  │  │ User Model   │ │ Product Model│ │ Coupon Model │  │   │
│  │  │ - name       │ │ - name       │ │ - code       │  │   │
│  │  │ - email      │ │ - price      │ │ - discount   │  │   │
│  │  │ - password   │ │ - stock      │ │ - expiryDate │  │   │
│  │  │ - isAdmin    │ │ - category   │ │ - isActive   │  │   │
│  │  │ - createdAt  │ │ - image      │ │ - createdAt  │  │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘  │   │
│  └──────────────┬────────────────────────────────────────┘   │
│                 │                                              │
└─────────────────┼──────────────────────────────────────────────┘
                  │ Query/Write (port 27017)
                  │ mongodb://localhost:27017/luxury-ecommerce
                  ▼
         ┌─────────────────────────┐
         │                         │
         │   MongoDB Database      │
         │                         │
         │ Collections:            │
         │ - users                 │
         │ - products              │
         │ - coupons               │
         │                         │
         └─────────────────────────┘
```

---

## User Authentication Flow

```
┌──────────────┐
│   Visitor    │
└──────┬───────┘
       │
       ├─────────────────────────┐
       │                         │
       ▼                         ▼
  ┌─────────┐            ┌─────────────┐
  │ Register│            │   Login     │
  └────┬────┘            └──────┬──────┘
       │                        │
       │ POST /auth/register    │ POST /auth/login
       │ {name, email, pass}    │ {email, password}
       │                        │
       ▼                        ▼
  ┌─────────────────────────────────────┐
  │      Backend: authController        │
  │                                     │
  │  1. Hash password with bcryptjs    │
  │  2. Create user in MongoDB         │
  │  3. OR check credentials           │
  │  4. Generate JWT token             │
  └────────────────┬────────────────────┘
                   │
                   ▼ JWT Token
       ┌───────────────────────────┐
       │   Frontend: localStorage  │
       │   - Save JWT token        │
       │   - Update auth context   │
       └───────────────┬───────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
     ┌──────────────┐      ┌──────────────┐
     │ Regular User │      │ Admin User   │
     │              │      │              │
     │ - Browse     │      │ - Browse     │
     │ - View cart  │      │ - Products   │
     │ - View coupon│      │ - Coupons    │
     │              │      │ - Manage all │
     └──────────────┘      └──────────────┘
```

---

## Admin Product Management Flow

```
┌──────────────────────┐
│   Admin User Logged  │
└──────────┬───────────┘
           │
           ▼
     ┌─────────────┐
     │  Admin Page │
     └──────┬──────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌──────────┐  ┌─────────────┐
│ Products │  │  Coupons    │
└────┬─────┘  └──────┬──────┘
     │               │
     ▼               ▼
┌──────────────────────────────────┐
│  Form Submit with JWT Token      │
│  Authorization: Bearer <token>   │
└──────────────────┬───────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   [ADD] [UPDATE] [DELETE]
        │          │          │
        ▼          ▼          ▼
 ┌────────────────────────────────────┐
 │  Middleware: authMiddleware        │
 │  1. Verify JWT token               │
 │  2. Check if user is admin         │
 │  3. Pass to controller             │
 └────────────────┬───────────────────┘
                  │
                  ▼
 ┌────────────────────────────────────┐
 │  Controller: productController     │
 │  - validateInput()                 │
 │  - createProduct() / updateProduct │
 │  - deleteProduct()                 │
 └────────────────┬───────────────────┘
                  │
                  ▼
 ┌────────────────────────────────────┐
 │  MongoDB: Update Collections       │
 │  db.products.insertOne()           │
 │  db.products.updateOne()           │
 │  db.products.deleteOne()           │
 └────────────────┬───────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Success Response│
         │ (200/201 status)│
         └─────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Frontend: Fetch│
         │  Updated List   │
         └─────────────────┘
```

---

## Data Flow: Product Purchase & Coupon Validation

```
User Browsing                    Admin Setup
┌──────────────┐               ┌──────────────┐
│   GET /api   │               │    POST      │
│   /products  │               │  /coupons    │
└──────┬───────┘               └──────┬───────┘
       │                              │
       │ Returns all products         │ Create coupon
       │ from MongoDB                 │ LUXURY20: 20% off
       │                              │ Expires: 2024-12-31
       ▼                              ▼
┌─────────────────────┐    ┌────────────────────┐
│  Frontend: Display  │    │ MongoDB Coupons    │
│  Product Grid       │    │ Collection Updated │
└────────┬────────────┘    └────────────────────┘
         │
         │ User Adds to Cart
         │ (localStorage)
         │
         ▼
┌──────────────────┐
│  Checkout Page   │
│ (Ready to build) │
└────────┬─────────┘
         │
         │ User enters coupon code
         │ "LUXURY20"
         │
         │ POST /api/coupons/validate
         │ { code: "LUXURY20" }
         │
         ▼
┌────────────────────────────┐
│  Backend: Check Coupon     │
│  1. Find in MongoDB        │
│  2. Check if active        │
│  3. Check expiry date      │
│  4. Return discount info   │
└────────┬───────────────────┘
         │
         ▼
    ┌────────────────┐
    │ 20% Discount   │
    │ Applied ✓      │
    └────────────────┘
         │
         ▼
┌──────────────────────┐
│  Calculate Total     │
│  Original: $100      │
│  Discount: -$20      │
│  Final: $80          │
└──────────────────────┘
```

---

## Security Layer

```
┌────────────────────────────────────────┐
│        Frontend Security               │
├────────────────────────────────────────┤
│ ✓ JWT stored in localStorage           │
│ ✓ Auto-attached to all API requests    │
│ ✓ HTTP-only not possible in React      │
│ ✓ Clear token on logout                │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│       Network Layer (HTTPS)            │
│ (In production deployment)             │
├────────────────────────────────────────┤
│ ✓ SSL/TLS encryption                   │
│ ✓ CORS policy enabled                  │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│        Backend Security                │
├────────────────────────────────────────┤
│ ✓ JWT Verification Middleware          │
│   - Validate token signature           │
│   - Check expiration                   │
│   - Extract user info                  │
│                                        │
│ ✓ Admin Authorization Middleware       │
│   - Check isAdmin flag                 │
│   - Deny non-admin access              │
│                                        │
│ ✓ Password Security                    │
│   - Hash with bcryptjs (10 salt rounds)│
│   - Never store plaintext              │
│                                        │
│ ✓ Input Validation                     │
│   - Check required fields              │
│   - Validate data types                │
│   - Prevent injection attacks          │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│     Database Level (MongoDB)           │
├────────────────────────────────────────┤
│ ✓ Unique constraints on email          │
│ ✓ Password never logged                │
│ ✓ isAdmin flag for authorization       │
└────────────────────────────────────────┘
```

---

## File Request-Response Cycle Example

### Create Product Request:

```
REQUEST:
┌──────────────────────────────────────┐
│ POST /api/products                   │
│                                      │
│ Headers:                             │
│ Authorization: Bearer <JWT_TOKEN>    │
│ Content-Type: application/json       │
│                                      │
│ Body:                                │
│ {                                    │
│   "name": "Silk Gown",               │
│   "description": "Elegant...",       │
│   "price": 1299.99,                  │
│   "category": "Dresses",             │
│   "stock": 15,                       │
│   "image": "https://..."             │
│ }                                    │
└──────────────────────────────────────┘
              │
              ▼
      MIDDLEWARE CHECK
┌──────────────────────────────────────┐
│ authMiddleware:                      │
│ ✓ Token valid?                       │
│ ✓ User exists?                       │
│ Pass req.user = {id, email, isAdmin} │
│                                      │
│ adminMiddleware:                     │
│ ✓ Is admin?                          │
│ YES → Proceed                        │
└──────────────────────────────────────┘
              │
              ▼
      CONTROLLER LOGIC
┌──────────────────────────────────────┐
│ productController.createProduct():   │
│ 1. Validate inputs                   │
│ 2. Create new Product document       │
│ 3. Save to MongoDB                   │
│ 4. Return saved product              │
└──────────────────────────────────────┘
              │
              ▼
       RESPONSE:
┌──────────────────────────────────────┐
│ Status: 201 Created                  │
│                                      │
│ Body:                                │
│ {                                    │
│   "_id": "507f1f77bcf86cd799439011", │
│   "name": "Silk Gown",               │
│   "price": 1299.99,                  │
│   "category": "Dresses",             │
│   "createdAt": "2024-02-02T...",     │
│   ...                                │
│ }                                    │
└──────────────────────────────────────┘
              │
              ▼
       FRONTEND UPDATE
┌──────────────────────────────────────┐
│ React State Updated                  │
│ Products list refreshed              │
│ New product appears in admin list    │
└──────────────────────────────────────┘
```

---

## Deployment Overview (Optional)

```
Development Environment
─────────────────────────
┌─────────────────────────────────────┐
│ Local Machine                       │
├─────────────────────────────────────┤
│ Frontend: npm start (port 3000)     │
│ Backend: npm run dev (port 5000)    │
│ Database: mongod (port 27017)       │
└─────────────────────────────────────┘

                    │
                    ▼ (Ready to deploy)

Production Environment
──────────────────────
┌────────────────────────────────────────────┐
│            Internet (HTTPS)                │
├────────────────────────────────────────────┤
│                                            │
│  Frontend: Vercel/Netlify               │
│  ├─ Optimized React build               │
│  ├─ CDN distribution                    │
│  └─ Auto SSL/TLS                        │
│                                            │
│  Backend: Railway/Heroku/Render         │
│  ├─ Node.js server                       │
│  ├─ Auto scaling                         │
│  └─ Environment variables                │
│                                            │
│  Database: MongoDB Atlas                │
│  ├─ Managed MongoDB cluster             │
│  ├─ Automatic backups                   │
│  └─ Connection pooling                  │
│                                            │
└────────────────────────────────────────────┘
```

---

This architecture ensures:
- **Scalability:** Separated frontend and backend
- **Security:** JWT, password hashing, middleware protection
- **Maintainability:** Clean separation of concerns
- **Performance:** Optimized database queries and API calls

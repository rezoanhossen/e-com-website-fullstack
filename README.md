# LUXE - Luxury Clothing E-Commerce Platform

A minimal luxury feel e-commerce website with admin panel for managing products and coupons. Features user registration, login, and a beautiful admin dashboard.

## Features

✨ **User Features:**
- User registration and login with JWT authentication
- Browse luxury clothing products
- Responsive, minimal luxury UI design
- Secure authentication

🛠️ **Admin Features:**
- Add, edit, and delete products
- Manage inventory and pricing
- Create and manage coupon codes
- Percentage and fixed amount discounts
- Coupon expiry date management

## Project Structure

```
web1site/
├── backend/
│   ├── models/           # MongoDB schemas (User, Product, Coupon)
│   ├── routes/           # API routes (auth, products, coupons)
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth middleware
│   ├── server.js         # Express server entry
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components (Navbar)
│   │   ├── pages/         # Pages (Home, Login, Register, Admin)
│   │   ├── context/       # Auth context
│   │   ├── utils/         # API utilities
│   │   ├── App.js         # Main app component
│   │   ├── App.css        # Luxury styling
│   │   └── index.js
│   ├── public/
│   └── package.json
└── README.md
```

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- React Router
- Axios
- Custom CSS (no build-time CSS framework needed)

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and add your MongoDB URI:
   ```
   MONGODB_URI=mongodb://localhost:27017/luxury-ecommerce
   JWT_SECRET=your_secure_secret_key
   PORT=5000
   ```

4. **Start MongoDB** (if local):
   ```bash
   mongod
   ```

5. **Run backend:**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **In a new terminal, navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start React development server:**
   ```bash
   npm start
   ```
   Frontend will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Coupons
- `GET /api/coupons` - Get all coupons (admin only)
- `POST /api/coupons/validate` - Validate coupon code
- `POST /api/coupons` - Create coupon (admin only)
- `PUT /api/coupons/:id` - Update coupon (admin only)
- `DELETE /api/coupons/:id` - Delete coupon (admin only)

## Default Admin Setup

To create an admin user, modify the `register` function in backend or directly create a user with `isAdmin: true` in MongoDB.

### Example admin user in MongoDB:
```javascript
db.users.insertOne({
  name: "Admin User",
  email: "admin@luxe.com",
  password: "$2a$10...", // bcrypted password
  isAdmin: true,
  createdAt: new Date()
})
```

## Usage

### For Users:
1. Register an account
2. Login
3. Browse products on home page
4. Add items to cart (feature ready for expansion)

### For Admins:
1. Login with admin account
2. Navigate to Admin panel (accessible if `isAdmin: true`)
3. **Products Tab:**
   - Add new products with name, description, price, category, stock, image URL
   - View all products
   - Delete products
4. **Coupons Tab:**
   - Create discount coupons (percentage or fixed amount)
   - Set expiry dates
   - Delete expired or invalid coupons

## Styling

The site features a minimal luxury aesthetic with:
- Dark primary colors (#1a1a1a)
- Gold accents (#d4af37)
- Clean typography
- Smooth transitions and hover effects
- Responsive design for all devices

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Protected admin routes
- Secure token storage in localStorage
- Authorization middleware for admin operations

## Future Enhancements

- Shopping cart functionality
- Order management
- Payment integration (Stripe/PayPal)
- Product reviews and ratings
- User profile management
- Email notifications
- Advanced product filtering
- Wishlist feature

## Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/luxury-ecommerce
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend
Uses `proxy: "http://localhost:5000"` in package.json for API calls

## License

MIT

---

**LUXE** - Minimal Luxury E-Commerce Platform
Built with React, Node.js, and MongoDB

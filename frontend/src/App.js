require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const couponRoutes = require('./routes/coupons');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const categoryRoutes = require('./routes/categories');
const bannerRoutes = require('./routes/banners');

require('./utils/emailService');

const app = express();

// --------------------
// Security middleware
// --------------------
app.use(helmet());

// --------------------
// CORS (FIXED)
// --------------------
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Your deployed frontend URL
  credentials: true
}));

// --------------------
// Rate limiting
// --------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// --------------------
// Body parsing
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// MongoDB Connection
// --------------------
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --------------------
// Routes
// --------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);

// --------------------
// Health check
// --------------------
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Backend running', 
    timestamp: new Date().toISOString() 
  });
});

// --------------------
// Error handling
// --------------------
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    status: err.status || 500
  });
});

// --------------------
// 404 handler
// --------------------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// --------------------
// Start server
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

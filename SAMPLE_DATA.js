// Sample test data - Run this in MongoDB to populate initial data
// Use MongoDB Compass or mongosh

// Create database: luxury-ecommerce
// Create collections and insert data

// Users Collection
db.users.insertMany([
  {
    name: "Admin User",
    email: "admin@luxe.com",
    password: "$2a$10$YourBcryptedPasswordHere",
    isAdmin: true,
    createdAt: new Date()
  }
]);

// Products Collection
db.products.insertMany([
  {
    name: "Silk Evening Gown",
    description: "Elegant black silk evening gown with hand-sewn details and premium finishing",
    price: 1299.99,
    category: "Dresses",
    image: "https://images.unsplash.com/photo-1595777707802-e176b61b939b?w=500",
    stock: 15,
    createdAt: new Date()
  },
  {
    name: "Cashmere Sweater",
    description: "Premium 100% cashmere sweater in neutral tones, perfect for everyday luxury",
    price: 599.99,
    category: "Tops",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500",
    stock: 25,
    createdAt: new Date()
  },
  {
    name: "Tailored Blazer",
    description: "Perfectly tailored wool blazer with Italian lining and custom buttons",
    price: 799.99,
    category: "Outerwear",
    image: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500",
    stock: 10,
    createdAt: new Date()
  },
  {
    name: "Premium Denim",
    description: "High-quality Japanese denim with distressed styling and premium finish",
    price: 399.99,
    category: "Bottoms",
    image: "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500",
    stock: 30,
    createdAt: new Date()
  },
  {
    name: "Leather Handbag",
    description: "Italian leather handbag with gold hardware and luxury lining",
    price: 1899.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500",
    stock: 8,
    createdAt: new Date()
  }
]);

// Coupons Collection
db.coupons.insertMany([
  {
    code: "LUXURY20",
    discount: 20,
    discountType: "percentage",
    expiryDate: new Date(Date.now() + 30*24*60*60*1000), // 30 days from now
    isActive: true,
    createdAt: new Date()
  },
  {
    code: "WELCOME50",
    discount: 50,
    discountType: "fixed",
    expiryDate: new Date(Date.now() + 7*24*60*60*1000), // 7 days from now
    isActive: true,
    createdAt: new Date()
  },
  {
    code: "SUMMER30",
    discount: 30,
    discountType: "percentage",
    expiryDate: new Date(Date.now() + 60*24*60*60*1000), // 60 days from now
    isActive: true,
    createdAt: new Date()
  }
]);

console.log("Sample data inserted successfully!");

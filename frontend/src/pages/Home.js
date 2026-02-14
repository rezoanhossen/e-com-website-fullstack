import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { productAPI } from '../utils/api';
import '../styles/Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartMessage, setCartMessage] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Hero banner content
  const heroBanners = [
    {
      title: "Up to 50% off on Summer Collection",
      subtitle: "Shop the latest trends",
      backgroundColor: "#FF9900"
    },
    {
      title: "Premium Quality Products",
      subtitle: "Handpicked collection just for you",
      backgroundColor: "#146EB4"
    },
    {
      title: "Free Shipping on Orders over ₹500",
      subtitle: "Fast delivery to your doorstep",
      backgroundColor: "#37475A"
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, productName, productDetails) => {
    const result = await addToCart(productId, 1, productDetails);
    
    if (result.success) {
      setAddedProduct({
        name: productName,
        price: productDetails.price
      });
      setShowCartModal(true);
      setCartMessage(result.message);
      setTimeout(() => setCartMessage(''), 3000);
    }
  };

  const handleContinueShopping = () => {
    setShowCartModal(false);
  };

  const handleViewCart = () => {
    setShowCartModal(false);
    navigate('/cart');
  };

  const handleCheckout = () => {
    setShowCartModal(false);
    navigate('/checkout');
  };

  const getRandomDiscount = () => Math.floor(Math.random() * 40) + 10;
  const getRandomRating = () => (Math.random() * 1.5 + 3.5).toFixed(1);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home-container">
      {/* Hero Banner with Auto-Rotation */}
      <div className="hero-banner-container">
        <div 
          className="hero-banner"
          style={{ backgroundColor: heroBanners[heroIndex].backgroundColor }}
        >
          <div className="hero-content">
            <h1>{heroBanners[heroIndex].title}</h1>
            <p>{heroBanners[heroIndex].subtitle}</p>
            <button className="hero-cta">Shop Now</button>
          </div>
        </div>
        <div className="hero-indicators">
          {heroBanners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === heroIndex ? 'active' : ''}`}
              onClick={() => setHeroIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="deals-section">
        <div className="deals-header">
          <h2>Today's Deals & Offers</h2>
          <a href="#" className="see-all">See all deals →</a>
        </div>

        {cartMessage && <div className="cart-message">{cartMessage}</div>}

        <div className="products-grid">
          {products.length === 0 ? (
            <p className="no-products">No products available</p>
          ) : (
            products.map((product) => {
              const discount = getRandomDiscount();
              const originalPrice = Math.round(product.price / (1 - discount / 100));
              const rating = getRandomRating();
              const reviews = Math.floor(Math.random() * 5000) + 100;

              return (
                <div 
                  key={product._id} 
                  className="product-card-amazon cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="product-card-image">
                    <img src={product.image || product.images?.[0]} alt={product.name} />
                    {product.stock === 0 && <div className="out-of-stock-badge">Out of Stock</div>}
                    {discount > 0 && <div className="discount-badge">-{discount}%</div>}
                    {product.stock > 50 && <div className="deal-badge">Prime Eligible</div>}
                  </div>
                  
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    
                    {/* Rating */}
                    <div className="rating">
                      <span className="stars">⭐ {rating}</span>
                      <span className="review-count">({reviews.toLocaleString()} reviews)</span>
                    </div>

                    {/* Price Section */}
                    <div className="price-section">
                      <div className="price-row">
                        <span className="current-price">₹{product.price.toLocaleString()}</span>
                        {discount > 0 && (
                          <>
                            <span className="original-price">₹{originalPrice.toLocaleString()}</span>
                            <span className="discount-percent">-{discount}%</span>
                          </>
                        )}
                      </div>
                      <p className="emi-text">No Cost EMI available</p>
                    </div>

                    {/* Stock Info */}
                    <div className="stock-badge-section">
                      {product.stock > 0 ? (
                        <span className={`stock-badge ${product.stock > 10 ? 'in-stock' : 'limited'}`}>
                          {product.stock > 10 ? `In Stock (${product.stock})` : `Only ${product.stock} left`}
                        </span>
                      ) : (
                        <span className="stock-badge out-of-stock-text">Out of Stock</span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      className="add-to-cart-btn-amazon"
                      disabled={product.stock === 0}
                      onClick={() => handleAddToCart(product._id, product.name, product)}
                    >
                      🛒 Add to Cart
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="footer-banner">
        <div className="footer-banner-content">
          <h3>&copy; 2025 Sk Rezoan Hossen. All rights reserved.</h3>
          <p>Subscribe to our newsletter for exclusive offers and discounts</p>
        </div>
      </div>

      {/* Cart Modal */}
      {showCartModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>✅ Added to Cart!</h2>
              <button 
                className="modal-close"
                onClick={handleContinueShopping}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="product-added">{addedProduct?.name}</p>
              <p className="product-price">₹{addedProduct?.price.toFixed(2)}</p>
              <p className="modal-message">What would you like to do next?</p>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-continue-shopping"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
              <button 
                className="btn-view-cart"
                onClick={handleViewCart}
              >
                View Cart
              </button>
              <button 
                className="btn-checkout"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

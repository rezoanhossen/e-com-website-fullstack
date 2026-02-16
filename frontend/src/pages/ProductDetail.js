import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { productAPI } from '../utils/api';
import { FiShoppingCart, FiHeart, FiShare2, FiTruck, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import '../styles/ProductDetail.css';

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [wishlist, setWishlist] = useState(false);
  const [mainImage, setMainImage] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProduct(productId);
      const productData = response.data.product || response.data;
      setProduct(productData);
      setMainImage(productData.images?.[0] || productData.image);
      setReviews(productData.reviews || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      toast.error('Please login to add to cart');
      return;
    }

    const result = await addToCart(productId, quantity, {
      size: selectedSize,
      color: selectedColor,
      price: product.price
    });

    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setWishlist(!wishlist);
    toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist');
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loader"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  const discount = product.discount || 0;
  const originalPrice = Math.round(product.price / (1 - discount / 100));
  const rating = product.rating || 4.5;
  const reviewCount = reviews.length || 0;
  const inStock = product.stock > 0;

  return (
    <div className="product-detail-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/')}>Home</span>
        <span>/</span>
        <span onClick={() => navigate('/products')}>Products</span>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="product-detail-wrapper">
        {/* Left - Images */}
        <div className="product-images">
          <div className="main-image">
            <img src={mainImage} alt={product.name} />
            {discount > 0 && (
              <div className="discount-badge large">-{discount}%</div>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="thumbnail-images">
            {product.images?.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name} ${idx + 1}`}
                className={`thumbnail ${mainImage === img ? 'active' : ''}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Right - Details */}
        <div className="product-details">
          {/* Title */}
          <h1 className="product-title">{product.name}</h1>

          {/* Brand and Category */}
          {product.brand && (
            <p className="product-brand">Brand: <strong>{product.brand}</strong></p>
          )}

          {/* Rating */}
          <div className="rating-section">
            <div className="stars">
              {'★'.repeat(Math.floor(rating))}
              {'☆'.repeat(5 - Math.floor(rating))}
            </div>
            <span className="rating-number">{rating}</span>
            <span className="review-count">({reviewCount} reviews)</span>
          </div>

          {/* Price */}
          <div className="price-section">
            <div className="current-price">₹{product.price.toLocaleString()}</div>
            {discount > 0 && (
              <>
                <div className="original-price">₹{originalPrice.toLocaleString()}</div>
                <div className="discount-percent">-{discount}% off</div>
              </>
            )}
          </div>

          {/* Features */}
          <div className="features-highlight">
            <div className="feature">
              <FiTruck size={20} />
              <div>
                <strong>Free Delivery</strong>
                <p>On orders above ₹500</p>
              </div>
            </div>
            <div className="feature">
              <FiShield size={20} />
              <div>
                <strong>Secure Purchase</strong>
                <p>100% authentic guarantee</p>
              </div>
            </div>
          </div>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="size-section">
              <label>Size:</label>
              <div className="size-options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="color-section">
              <label>Color:</label>
              <div className="color-options">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    <span className="color-swatch" style={{ backgroundColor: color.toLowerCase() }}></span>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="quantity-section">
            <label>Quantity:</label>
            <div className="quantity-selector">
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>−</button>
              <input type="number" value={quantity} min="1" max={product.stock} readOnly />
              <button onClick={() => quantity < product.stock && setQuantity(quantity + 1)}>+</button>
            </div>
            <span className="stock-status">
              {inStock ? (
                <span style={{ color: 'green' }}>✓ In Stock ({product.stock} available)</span>
              ) : (
                <span style={{ color: 'red' }}>Out of Stock</span>
              )}
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="cta-buttons">
            <button
              className="btn btn-secondary add-to-cart"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              <FiShoppingCart size={20} />
              Add to Cart
            </button>
            <button
              className={`btn btn-outline wishlist-btn ${wishlist ? 'wishlisted' : ''}`}
              onClick={handleAddToWishlist}
            >
              <FiHeart size={20} fill={wishlist ? 'currentColor' : 'none'} />
              Wishlist
            </button>
            <button className="btn btn-ghost share-btn">
              <FiShare2 size={20} />
              Share
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="description-section">
              <h3>About this item</h3>
              <p>{product.description}</p>
            </div>
          )}

          {/* Specifications */}
          {product.material && (
            <div className="specifications">
              <h3>Specifications</h3>
              <dl>
                {product.brand && (
                  <>
                    <dt>Brand</dt>
                    <dd>{product.brand}</dd>
                  </>
                )}
                {product.material && (
                  <>
                    <dt>Material</dt>
                    <dd>{product.material}</dd>
                  </>
                )}
                {product.category && (
                  <>
                    <dt>Category</dt>
                    <dd>{product.category}</dd>
                  </>
                )}
                <dt>SKU</dt>
                <dd>{product._id}</dd>
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {reviewCount > 0 && (
        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-list">
            {reviews.slice(0, 5).map((review, idx) => (
              <div key={idx} className="review-item">
                <div className="review-header">
                  <div className="reviewer-info">
                    <strong>{review.userName || 'Anonymous'}</strong>
                    <div className="stars">{'★'.repeat(review.rating)}</div>
                  </div>
                  <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="review-text">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

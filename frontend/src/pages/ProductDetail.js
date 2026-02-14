import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { productAPI } from '../utils/api';
import { FiShoppingCart, FiHeart, FiShare2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import toast from 'react-hot-toast';
import '../styles/ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getProduct(id);
      setProduct(response.data.data || response.data);
      
      // Fetch related products
      try {
        const relatedRes = await productAPI.getRelatedProducts?.(id);
        if (relatedRes?.data) {
          setRelatedProducts(relatedRes.data.data || []);
        }
      } catch (err) {
        console.log('Related products not available');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      toast.error('Please select a size');
      return;
    }

    try {
      const result = await addToCart(id, quantity, {
        size: selectedSize,
        color: selectedColor
      });

      if (result.success) {
        toast.success('Added to cart!');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate('/checkout'), 500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : ['/placeholder.jpg']);
  const rating = product.rating || 4.5;
  const discount = product.discount || 0;
  const originalPrice = product.price && discount > 0 ? Math.round(product.price / (1 - discount / 100)) : product.price;

  return (
    <div className="product-detail-container">
      {/* Breadcrumb */}
      <div className="breadcrumb py-4">
        <button onClick={() => navigate('/')} className="text-secondary hover:text-primary">
          Home
        </button>
        <span className="mx-2">/</span>
        <button onClick={() => navigate('/products')} className="text-secondary hover:text-primary">
          Products
        </button>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
        {/* Image Gallery */}
        <div className="product-gallery">
          {/* Main Image */}
          <div className="main-image-container mb-4 relative bg-light rounded-lg overflow-hidden group">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-bold">
                {discount}% OFF
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="thumbnail-container flex gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                  selectedImage === idx ? 'border-secondary' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          {/* Category */}
          {product.category && (
            <p className="text-sm text-gray-500 mb-2 uppercase tracking-wider">{product.category}</p>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <AiFillStar
                  key={i}
                  size={18}
                  className={i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {rating.toFixed(1)} ({product.totalReviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="price-section mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
              {discount > 0 && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {discount > 0 && (
              <p className="text-green-600 font-semibold">Save ₹{(originalPrice - product.price).toLocaleString()}</p>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-3">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                      selectedSize === size
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-gray-300 text-gray-700 hover:border-secondary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-primary mb-3">Select Color</label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 rounded-lg font-semibold transition ${
                      selectedColor === color
                        ? 'border-secondary bg-secondary text-white'
                        : 'border-gray-300 text-gray-700 hover:border-secondary'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-primary mb-3">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:border-secondary transition"
              >
                −
              </button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:border-secondary transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <p className="text-green-600 font-semibold">✓ In Stock ({product.stock} available)</p>
            ) : (
              <p className="text-red-600 font-semibold">✗ Out of Stock</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 btn btn-secondary flex items-center justify-center gap-2 py-4 text-lg font-bold disabled:opacity-50"
            >
              <FiShoppingCart size={24} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="flex-1 btn btn-primary py-4 text-lg font-bold disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* Additional Actions */}
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-secondary transition">
              <FiHeart size={20} />
              Wishlist
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-secondary transition">
              <FiShare2 size={20} />
              Share
            </button>
          </div>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-primary mb-4">Key Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Premium Quality Material</li>
              <li>✓ Free Shipping on Orders over ₹500</li>
              <li>✓ Easy Returns & Exchanges</li>
              <li>✓ 1 Year Warranty</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <div className="tabs flex gap-8 mb-6 border-b border-gray-200">
          {['details', 'reviews', 'shipping'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-semibold capitalize transition ${
                activeTab === tab
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">Product Details</h3>
              <p className="text-gray-700">{product.description}</p>
              {product.material && (
                <div>
                  <p className="font-semibold text-primary">Material:</p>
                  <p className="text-gray-700">{product.material}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">Customer Reviews</h3>
              <p className="text-gray-600">No reviews yet. Be the first to review!</p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-primary">Shipping Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Free shipping on orders over ₹500</li>
                <li>Standard delivery: 5-7 business days</li>
                <li>Express delivery: 2-3 business days (Additional charges apply)</li>
                <li>Cash on Delivery available</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-primary mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <div
                key={relatedProduct._id}
                onClick={() => navigate(`/product/${relatedProduct._id}`)}
                className="product-card-small cursor-pointer hover:shadow-lg transition"
              >
                <img
                  src={relatedProduct.images?.[0] || '/placeholder.jpg'}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-primary line-clamp-2">{relatedProduct.name}</h3>
                <p className="text-secondary font-bold mt-2">₹{relatedProduct.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

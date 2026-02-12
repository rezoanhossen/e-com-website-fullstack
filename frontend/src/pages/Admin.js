import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { productAPI, couponAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import AdminOrders from './AdminOrders';
import '../styles/Admin.css';


export default function Admin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Product form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });

  // Coupon form
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercentage: '',
    expiryDate: '',
    isOneTimePerUser: false
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchCoupons();
    }
  }, [activeTab, user, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponAPI.getCoupons();
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productAPI.createProduct(productForm);
      setProductForm({ name: '', description: '', price: '', category: '', stock: '', image: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await productAPI.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      await couponAPI.createCoupon(couponForm);
      setCouponForm({ code: '', discountPercentage: '', expiryDate: '', isOneTimePerUser: false });
      fetchCoupons();
    } catch (error) {
      console.error('Error adding coupon:', error);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await couponAPI.deleteCoupon(id);
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-button ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          Coupons
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="admin-content">
          <div className="admin-form-section">
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct} className="admin-form">
              <input
                type="text"
                placeholder="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              />
              <input
                type="text"
                placeholder="Image URL"
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
              />
              <button type="submit" className="submit-btn">Add Product</button>
            </form>
          </div>

          <div className="admin-list-section">
            <h2>Products List ({products.length})</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="products-table">
                {products.map(product => (
                  <div key={product._id} className="product-row">
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <p>₹{product.price} • Stock: {product.stock}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="admin-content">
          <div className="admin-form-section">
            <h2>Add New Coupon</h2>
            <form onSubmit={handleAddCoupon} className="admin-form">
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponForm.code}
                onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Discount Percentage (%)"
                value={couponForm.discountPercentage}
                onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: e.target.value })}
                required
              />
              <input
                type="date"
                value={couponForm.expiryDate}
                onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                required
              />
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={couponForm.isOneTimePerUser}
                    onChange={(e) => setCouponForm({ ...couponForm, isOneTimePerUser: e.target.checked })}
                  />
                  Single Use Per User (User can only use this coupon once)
                </label>
              </div>
              <button type="submit" className="submit-btn">Add Coupon</button>
            </form>
          </div>

          <div className="admin-list-section">
            <h2>Coupons List ({coupons.length})</h2>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="coupons-table">
                {coupons.map(coupon => (
                  <div key={coupon._id} className="coupon-row">
                    <div className="coupon-info">
                      <h4>{coupon.code}</h4>
                      <p>{coupon.discountPercentage}% off • Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                      {coupon.isOneTimePerUser && (
                        <p className="one-time-badge">🔒 Single Use Per User • Used by {coupon.usedByUsers?.length || 0} user(s)</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <AdminOrders />
      )}
    </div>
  );
}

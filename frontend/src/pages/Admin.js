import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { productAPI, couponAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import AdminOrders from './AdminOrders';
import toast from 'react-hot-toast';
import '../styles/Admin.css';


export default function Admin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Product form with all fields
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '0',
    category: 'Men',
    subcategory: '',
    images: [''],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [''],
    stock: '',
    lowStockThreshold: '10',
    material: '',
    brand: ''
  });

  // Coupon form
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercentage: '',
    validityStartDate: '',
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
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    }
    // Orders tab has its own data fetching in AdminOrders.js
  }, [activeTab, user, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts();
      setProducts(response.data.products || response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponAPI.getCoupons();
      // API returns { coupons: [...], totalCoupons, totalPages, currentPage }
      setCoupons(response.data.coupons || response.data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      discount: '0',
      category: 'Men',
      subcategory: '',
      images: [''],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [''],
      stock: '',
      lowStockThreshold: '10',
      material: '',
      brand: ''
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    // Ensure product has all required fields
    const productData = product || {};
    
    setEditingProduct(product._id);
    setProductForm({
      name: productData.name || '',
      description: productData.description || '',
      price: productData.price || '',
      originalPrice: productData.originalPrice || '',
      discount: productData.discount || '0',
      category: productData.category || 'Men',
      subcategory: productData.subcategory || '',
      images: (productData.images && productData.images.length > 0) ? productData.images : [''],
      sizes: (productData.sizes && productData.sizes.length > 0) ? productData.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
      colors: (productData.colors && productData.colors.length > 0) ? productData.colors : [''],
      stock: productData.stock || '',
      lowStockThreshold: productData.lowStockThreshold || '10',
      material: productData.material || '',
      brand: productData.brand || ''
    });
    setShowProductForm(true);
    
    // Scroll to form
    setTimeout(() => {
      document.querySelector('.product-form-expanded')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.price || !productForm.category || productForm.stock === '') {
      toast.error('Please fill in all required fields (Name, Price, Category, Stock)');
      return;
    }

    // Validate at least one image
    const validImages = productForm.images.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      toast.error('Please add at least one product image');
      return;
    }

    // Validate at least one size
    if (productForm.sizes.length === 0) {
      toast.error('Please select at least one size');
      return;
    }

    try {
      const productData = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : null,
        discount: Math.min(100, Math.max(0, parseFloat(productForm.discount) || 0)),
        category: productForm.category,
        subcategory: productForm.subcategory.trim() || null,
        images: validImages,
        sizes: [...new Set(productForm.sizes)],  // Remove duplicates
        colors: productForm.colors.filter(color => color.trim() !== ''),
        stock: Math.max(0, parseInt(productForm.stock)),
        lowStockThreshold: Math.max(1, parseInt(productForm.lowStockThreshold) || 10),
        material: productForm.material.trim() || null,
        brand: productForm.brand.trim() || null
      };

      if (editingProduct) {
        await productAPI.updateProduct(editingProduct, productData);
        toast.success('✅ Product updated successfully!');
      } else {
        await productAPI.createProduct(productData);
        toast.success('✅ Product added successfully!');
      }
      
      resetProductForm();
      setShowProductForm(false);
      await fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await productAPI.deleteProduct(id);
        toast.success('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    
    if (!couponForm.code || !couponForm.discountPercentage || !couponForm.validityStartDate || !couponForm.expiryDate) {
      toast.error('Please fill in all required coupon fields');
      return;
    }

    if (new Date(couponForm.validityStartDate) >= new Date(couponForm.expiryDate)) {
      toast.error('Expiry date must be after validity start date');
      return;
    }

    try {
      const couponData = {
        code: couponForm.code.trim().toUpperCase(),
        discountType: 'percentage',
        discountValue: Math.min(100, Math.max(0, parseInt(couponForm.discountPercentage))),
        validityStartDate: couponForm.validityStartDate,
        expiryDate: couponForm.expiryDate,
        maxUsesPerUser: couponForm.isOneTimePerUser ? 1 : 999999,
        isActive: true
      };

      await couponAPI.createCoupon(couponData);
      toast.success('✅ Coupon added successfully!');
      setCouponForm({ code: '', discountPercentage: '', validityStartDate: '', expiryDate: '', isOneTimePerUser: false });
      fetchCoupons();
    } catch (error) {
      console.error('Error adding coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to add coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await couponAPI.deleteCoupon(id);
        toast.success('✅ Coupon deleted successfully!');
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        toast.error('Failed to delete coupon');
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🛠️ Admin Panel</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products
        </button>
        <button
          className={`tab-button ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          🎟️ Coupons
        </button>
        <button
          className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📋 Orders
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="admin-content">
          {!showProductForm && (
            <div className="admin-form-section">
              <button 
                onClick={() => {
                  resetProductForm();
                  setShowProductForm(true);
                }}
                className="add-new-btn"
              >
                ➕ Add New Product
              </button>
            </div>
          )}

          {showProductForm && (
            <div className="admin-form-section product-form-expanded">
              <div className="form-header">
                <h2>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
                <button 
                  onClick={() => {
                    setShowProductForm(false);
                    resetProductForm();
                  }}
                  className="close-form-btn"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddOrUpdateProduct} className="admin-form product-form">
                {/* Basic Information */}
                <div className="form-section">
                  <h3>📝 Basic Information</h3>
                  
                  <input
                    type="text"
                    placeholder="Product Name *"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    required
                    className="form-input"
                  />

                  <textarea
                    placeholder="Product Description *"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    required
                    className="form-input"
                    rows="4"
                  />

                  <div className="form-row">
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="form-input"
                      required
                    >
                      <option value="Men">👔 Men</option>
                      <option value="Women">👗 Women</option>
                      <option value="Kids">👶 Kids</option>
                      <option value="Accessories">👜 Accessories</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Sub-category (optional)"
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm({ ...productForm, subcategory: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Brand (optional)"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Material (e.g., Cotton, Polyester)"
                      value={productForm.material}
                      onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="form-section">
                  <h3>💰 Pricing</h3>
                  
                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Selling Price (₹) *"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      required
                      step="0.01"
                      min="0"
                      className="form-input"
                    />
                    <input
                      type="number"
                      placeholder="Original Price (₹) (optional)"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      step="0.01"
                      min="0"
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Discount (%)"
                      min="0"
                      max="100"
                      value={productForm.discount}
                      onChange={(e) => setProductForm({ ...productForm, discount: Math.min(100, Math.max(0, e.target.value)) })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="form-section">
                  <h3>🖼️ Product Images</h3>
                  <p className="section-help">Add image URLs (comma-separated or one per field)</p>
                  
                  {productForm.images.map((image, idx) => (
                    <div key={idx} className="form-row image-input-row">
                      <input
                        type="url"
                        placeholder={`Image URL ${idx + 1}`}
                        value={image}
                        onChange={(e) => {
                          const newImages = [...productForm.images];
                          newImages[idx] = e.target.value;
                          setProductForm({ ...productForm, images: newImages });
                        }}
                        className="form-input"
                      />
                      {productForm.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = productForm.images.filter((_, i) => i !== idx);
                            setProductForm({ ...productForm, images: newImages });
                          }}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, images: [...productForm.images, ''] })}
                    className="add-field-btn"
                  >
                    + Add Another Image
                  </button>

                  {productForm.images.filter(img => img.trim()).length > 0 && (
                    <div className="image-preview">
                      <h4>Preview:</h4>
                      <div className="preview-grid">
                        {productForm.images.filter(img => img.trim()).map((img, idx) => (
                          <img key={idx} src={img} alt={`Preview ${idx}`} className="preview-img" onError={(e) => e.target.style.display = 'none'} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sizes */}
                <div className="form-section">
                  <h3>📏 Sizes</h3>
                  <p className="section-help">Available sizes</p>
                  
                  <div className="size-checkbox-group">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(size => (
                      <label key={size} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={productForm.sizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Only add if not already present (prevent duplicates)
                              if (!productForm.sizes.includes(size)) {
                                setProductForm({ ...productForm, sizes: [...productForm.sizes, size] });
                              }
                            } else {
                              setProductForm({ ...productForm, sizes: productForm.sizes.filter(s => s !== size) });
                            }
                          }}
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="form-section">
                  <h3>🎨 Colors</h3>
                  <p className="section-help">Add available colors</p>
                  
                  {productForm.colors.map((color, idx) => (
                    <div key={idx} className="form-row color-input-row">
                      <input
                        type="text"
                        placeholder={`Color ${idx + 1} (e.g., Red, Blue)`}
                        value={color}
                        onChange={(e) => {
                          const newColors = [...productForm.colors];
                          newColors[idx] = e.target.value;
                          setProductForm({ ...productForm, colors: newColors });
                        }}
                        className="form-input"
                      />
                      {productForm.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newColors = productForm.colors.filter((_, i) => i !== idx);
                            setProductForm({ ...productForm, colors: newColors });
                          }}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => setProductForm({ ...productForm, colors: [...productForm.colors, ''] })}
                    className="add-field-btn"
                  >
                    + Add Another Color
                  </button>
                </div>

                {/* Inventory */}
                <div className="form-section">
                  <h3>📦 Inventory</h3>
                  
                  <div className="form-row">
                    <input
                      type="number"
                      placeholder="Stock Quantity *"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Math.max(0, e.target.value) })}
                      required
                      min="0"
                      className="form-input"
                    />
                    <input
                      type="number"
                      placeholder="Low Stock Threshold"
                      value={productForm.lowStockThreshold}
                      onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: Math.max(1, e.target.value) })}
                      min="1"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editingProduct ? '✅ Update Product' : '➕ Add Product'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowProductForm(false);
                      resetProductForm();
                    }}
                    className="cancel-btn"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products List */}
          <div className="admin-list-section">
            <h2>📦 Products List ({products.length})</h2>
            {loading ? (
              <p className="loading-text">Loading products...</p>
            ) : products.length === 0 ? (
              <p className="no-data-text">No products found. Add one to get started!</p>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product._id} className="product-card-admin">
                    <div className="product-image-admin">
                      <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} />
                      {product.discount > 0 && (
                        <div className="discount-badge">{product.discount}% OFF</div>
                      )}
                    </div>
                    <div className="product-details-admin">
                      <h4>{product.name || 'Unnamed Product'}</h4>
                      <div className="product-meta">
                        <span className="price">₹{(product.price || 0).toLocaleString()}</span>
                        <span className="category">{product.category || 'N/A'}</span>
                      </div>
                      <div className="product-specs">
                        <span>📏 Sizes: {(product.sizes?.length || 0)}</span>
                        <span>🎨 Colors: {(product.colors?.length || 0)}</span>
                        <span>📦 Stock: {product.stock || 0}</span>
                      </div>
                      {product.stock <= (product.lowStockThreshold || 10) && (
                        <div className="low-stock-warning">⚠️ Low Stock!</div>
                      )}
                      <div className="product-actions">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="edit-btn"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="delete-btn"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
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
            <h2>🎟️ Create New Coupon</h2>
            <form onSubmit={handleAddCoupon} className="admin-form">
              <div className="form-section">
                <h3>💳 Coupon Details</h3>
                
                <input
                  type="text"
                  placeholder="Coupon Code (e.g., SAVE50) *"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  required
                  className="form-input"
                />

                <div className="form-row">
                  <input
                    type="number"
                    placeholder="Discount Percentage (%) *"
                    value={couponForm.discountPercentage}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: Math.min(100, Math.max(0, e.target.value)) })}
                    required
                    min="0"
                    max="100"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>Valid From *</label>
                    <input
                      type="date"
                      value={couponForm.validityStartDate}
                      onChange={(e) => setCouponForm({ ...couponForm, validityStartDate: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#333' }}>Expires To *</label>
                    <input
                      type="date"
                      value={couponForm.expiryDate}
                      onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-section" style={{ padding: '15px', margin: '15px 0' }}>
                  <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={couponForm.isOneTimePerUser}
                      onChange={(e) => setCouponForm({ ...couponForm, isOneTimePerUser: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span>Single Use Per User (User can only use this coupon once)</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  🎟️ Create Coupon
                </button>
              </div>
            </form>
          </div>

          <div className="admin-list-section">
            <h2>🎟️ Active Coupons ({coupons.length})</h2>
            {loading ? (
              <p className="loading-text">Loading coupons...</p>
            ) : coupons.length === 0 ? (
              <p className="no-data-text">No coupons created yet. Create one to get started!</p>
            ) : (
              <div className="coupons-grid">
                {coupons.map(coupon => (
                  <div key={coupon._id} className="coupon-card">
                    <div className="coupon-header">
                      <h3 className="coupon-code">{coupon.code}</h3>
                      <div className="discount-badge-coupon">
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF
                      </div>
                    </div>
                    <div className="coupon-details">
                      <p className="validity-date">
                        📅 Valid: {new Date(coupon.validityStartDate || coupon.createdAt).toLocaleDateString()} - {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                      {new Date(coupon.expiryDate) < new Date() && (
                        <p className="expired-badge">⏱️ EXPIRED</p>
                      )}
                      {new Date(coupon.validityStartDate || new Date()) > new Date() && (
                        <p className="upcoming-badge">⏳ COMING SOON</p>
                      )}
                      {coupon.maxUsesPerUser === 1 && (
                        <p className="one-time-badge">
                          🔒 Single Use • Used by {coupon.usedByUsers?.length || 0} user(s)
                        </p>
                      )}
                      {coupon.maxUses && (
                        <p className="quota-badge">
                          📊 Usage: {coupon.usageCount || 0} / {coupon.maxUses}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="delete-btn"
                      style={{ width: '100%', marginTop: '10px' }}
                    >
                      🗑️ Delete
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

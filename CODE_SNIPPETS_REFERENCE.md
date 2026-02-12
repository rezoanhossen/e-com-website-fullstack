# Code Snippets Reference

## CartContext.js - Key Implementation

### Guest Cart Storage
```javascript
const GUEST_CART_KEY = 'guestCart';

const saveGuestCart = (cartData) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cartData));
};
```

### Load Cart (Dual Mode)
```javascript
const loadCart = async () => {
  try {
    if (token) {
      // Authenticated - fetch from backend
      const response = await axios.get('/api/cart', axiosConfig);
      setCart(response.data);
    } else {
      // Guest - load from localStorage
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      if (guestCart) {
        setCart(JSON.parse(guestCart));
      } else {
        setCart({ items: [], totalPrice: 0 });
      }
    }
  } catch (error) {
    // Fallback to localStorage
    const guestCart = localStorage.getItem(GUEST_CART_KEY);
    if (guestCart) {
      setCart(JSON.parse(guestCart));
    }
  }
};
```

### Add to Cart (Dual Mode)
```javascript
const addToCart = async (productId, quantity = 1, productDetails = {}) => {
  try {
    if (token) {
      // Authenticated
      const response = await axios.post('/api/cart/add', 
        { productId, quantity }, 
        axiosConfig
      );
      setCart(response.data.cart);
    } else {
      // Guest
      const newCart = { ...cart };
      const existingItem = newCart.items.find(item => 
        item.productId === productId || 
        (typeof item.productId === 'object' && item.productId._id === productId)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        newCart.items.push({
          productId: productDetails._id ? productDetails : productId,
          quantity,
          price: productDetails.price || 0
        });
      }

      // Recalculate total
      newCart.totalPrice = newCart.items.reduce((total, item) => {
        const price = item.price || 
          (typeof item.productId === 'object' ? item.productId.price : 0);
        return total + (price * item.quantity);
      }, 0);

      setCart(newCart);
      saveGuestCart(newCart);
    }

    return { success: true, message: '✅ Added to cart!' };
  } catch (error) {
    return { success: false, message: 'Failed to add to cart' };
  }
};
```

---

## Home.js - Add to Cart Handler

### Before (Login Required)
```javascript
const handleAddToCart = async (productId, productName, productDetails) => {
  if (!user) {
    alert('Please login to add items to cart');
    return;
  }
  const result = await addToCart(productId, 1, productDetails);
  setCartMessage(result.message);
  setTimeout(() => setCartMessage(''), 3000);
};
```

### After (No Login Required)
```javascript
const handleAddToCart = async (productId, productName, productDetails) => {
  const result = await addToCart(productId, 1, productDetails);
  
  setCartMessage(result.message);
  setTimeout(() => setCartMessage(''), 3000);
};
```

### Button Implementation
```javascript
<button 
  className="add-to-cart-btn"
  disabled={product.stock === 0}
  onClick={() => handleAddToCart(product._id, product.name, product)}
>
  Add to Cart
</button>
```

---

## Checkout.js - Login Check & Address Validation

### Authentication Check
```javascript
if (!token || !user) {
  return (
    <div className="checkout-container">
      <div className="login-prompt-container">
        <div className="login-prompt">
          <h2>🔐 Login Required</h2>
          <p>Please login to your account to proceed with checkout</p>
          
          <div className="login-actions">
            <button 
              className="login-btn"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
            <button 
              className="register-btn"
              onClick={() => navigate('/register')}
            >
              Create New Account
            </button>
          </div>

          <div className="cart-info">
            <h3>Your Cart ({cart.items.length} items)</h3>
            <p>Total: ${cart.totalPrice.toFixed(2)}</p>
            <button 
              className="back-to-cart-btn"
              onClick={() => navigate('/cart')}
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Address Validation
```javascript
const validateForm = () => {
  if (!formData.fullName.trim()) {
    setError('Please enter your full name');
    return false;
  }
  if (!formData.email.trim()) {
    setError('Please enter your email');
    return false;
  }
  if (!formData.phone.trim()) {
    setError('Please enter your phone number');
    return false;
  }
  if (!formData.address.trim()) {
    setError('❌ Please add an address to continue');
    return false;
  }
  if (!formData.city.trim()) {
    setError('Please enter your city');
    return false;
  }
  if (!formData.zipCode.trim()) {
    setError('Please enter your ZIP code');
    return false;
  }
  if (!formData.country.trim()) {
    setError('Please enter your country');
    return false;
  }
  return true;
};
```

### Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Check if user is logged in
  if (!token || !user) {
    setError('🔐 Please login to proceed with checkout');
    return;
  }

  // Validate form fields
  if (!validateForm()) {
    return;
  }

  setLoading(true);

  try {
    const response = await axios.post('/api/orders', {
      shippingAddress: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        zipCode: formData.zipCode,
        country: formData.country
      },
      paymentMethod: formData.paymentMethod,
      couponCode: formData.couponCode || undefined
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    await clearCart();
    setOrderPlaced(true);
    
    setTimeout(() => {
      window.location.href = `/order-confirmation/${response.data.order._id}`;
    }, 2000);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to place order');
  } finally {
    setLoading(false);
  }
};
```

---

## Cart.js - Dual Format Handling

### Item Rendering
```javascript
{cart.items.map(item => {
  // Handle both guest cart and authenticated cart
  const productId = typeof item.productId === 'string' 
    ? item.productId 
    : item.productId?._id;
    
  const productData = typeof item.productId === 'object' 
    ? item.productId 
    : {};
    
  const itemName = productData.name || 'Product';
  const itemImage = productData.image || '';
  const itemCategory = productData.category || 'Category';
  const itemDescription = productData.description || 'No description';
  const itemPrice = item.price || productData.price || 0;

  return (
    <div key={productId} className="cart-item">
      {itemImage && (
        <div className="item-image">
          <img src={itemImage} alt={itemName} />
        </div>
      )}
      
      <div className="item-details">
        <h3>{itemName}</h3>
        {itemCategory && <p className="item-category">{itemCategory}</p>}
        <p className="item-description">
          {itemDescription.substring(0, 80)}...
        </p>
      </div>

      <div className="item-price">
        <p>${itemPrice.toFixed(2)}</p>
      </div>

      <div className="item-quantity">
        <button 
          className="qty-btn"
          onClick={() => handleQuantityChange(productId, item.quantity - 1)}
        >
          −
        </button>
        <input 
          type="number" 
          value={item.quantity}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            handleQuantityChange(productId, val);
          }}
          className="qty-input"
        />
        <button 
          className="qty-btn"
          onClick={() => handleQuantityChange(productId, item.quantity + 1)}
        >
          +
        </button>
      </div>

      <div className="item-total">
        <p className="total-price">
          ${(itemPrice * item.quantity).toFixed(2)}
        </p>
      </div>

      <button 
        className="remove-btn"
        onClick={() => handleRemove(productId)}
      >
        ✕
      </button>
    </div>
  );
})}
```

---

## Checkout.css - Login Prompt Styling

### Container & Prompt
```css
.login-prompt-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
  padding: 20px;
}

.login-prompt {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.login-prompt h2 {
  margin: 0 0 15px 0;
  font-size: 28px;
  color: white;
}

.login-prompt p {
  margin: 0 0 30px 0;
  font-size: 16px;
  opacity: 0.9;
}
```

### Buttons
```css
.login-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.login-btn,
.register-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn {
  background-color: white;
  color: #667eea;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.register-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.register-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
```

### Cart Info
```css
.cart-info {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  border-top: 2px solid rgba(255, 255, 255, 0.3);
}

.cart-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.cart-info p {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: bold;
}

.back-to-cart-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.back-to-cart-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
```

---

## Type Detection Helper

### For Product ID Extraction
```javascript
// Universal type detection pattern used in multiple files
const productId = typeof item.productId === 'string' 
  ? item.productId 
  : item.productId?._id;
```

### For Product Data Extraction
```javascript
// Extract full product object if exists
const productData = typeof item.productId === 'object' 
  ? item.productId 
  : {};

// Safe property access
const name = productData.name || 'Product';
const price = productData.price || item.price || 0;
```

---

## Error Messages Pattern

### Implementation
```javascript
// Always include emoji and clear message
if (!address) {
  setError('❌ Please add an address to continue');
}

if (!token || !user) {
  setError('🔐 Please login to proceed with checkout');
}

if (success) {
  setMessage('✅ Added to cart!');
}
```

### Display
```jsx
{error && <div className="error-message">{error}</div>}
{cartMessage && <div className="cart-message">{cartMessage}</div>}
```

---

## localStorage Usage Pattern

### Save
```javascript
const guestCart = { items: [], totalPrice: 0 };
localStorage.setItem('guestCart', JSON.stringify(guestCart));
```

### Load
```javascript
const guestCart = localStorage.getItem('guestCart');
if (guestCart) {
  setCart(JSON.parse(guestCart));
}
```

### Clear
```javascript
localStorage.removeItem('guestCart');
```

---

## Complete Feature Integration

### Authentication Flow
```
AuthContext (token, user)
    ↓
CartContext (checks token)
    ↓
   YES → Use backend API
    NO → Use localStorage
    ↓
Home.js (allows add without token)
    ↓
Cart.js (displays both formats)
    ↓
Checkout.js (enforces token + address)
```

---

**All code snippets are production-ready and tested.**  
**Ready for deployment.**

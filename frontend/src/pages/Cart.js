import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';

export default function Cart() {
  const { cart, loading, updateCartItem, removeFromCart, getCartCount } = useContext(CartContext);
  const navigate = useNavigate();

  if (loading) return <div className="loading">Loading...</div>;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateCartItem(productId, newQuantity);
    }
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const handleCheckout = () => {
    if (cart.items.length > 0) {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/home')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="cart-content">
            <div className="cart-items">
              {cart.items.map(item => {
                // Handle both guest cart (product data embedded) and authenticated cart (productId reference)
                const productId = typeof item.productId === 'string' ? item.productId : item.productId?._id;
                const productData = typeof item.productId === 'object' ? item.productId : {};
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
                      <p className="item-description">{itemDescription.substring(0, 80)}...</p>
                    </div>

                    <div className="item-price">
                      <p>₹{itemPrice.toFixed(2)}</p>
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
                      <p className="total-price">₹{(itemPrice * item.quantity).toFixed(2)}</p>
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
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({getCartCount()} items)</span>
                <span>₹{cart.totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{cart.totalPrice.toFixed(2)}</span>
              </div>

              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>

              <button 
                className="continue-shopping-btn"
                onClick={() => navigate('/home')}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

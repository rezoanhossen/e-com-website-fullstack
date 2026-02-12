import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/orders/${orderId}/cancel`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      processing: '#2196f3',
      shipped: '#4caf50',
      delivered: '#8bc34a',
      cancelled: '#f44336'
    };
    return colors[status] || '#757575';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="orders-container">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order._id.substring(0, 8)}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-items">
                <h4>Items ({order.items.length})</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.productName}</span>
                    <span>x{item.quantity}</span>
                    <span className="item-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{order.totalPrice.toFixed(2)}</span>
                </div>
                {order.appliedCoupon && (
                  <div className="total-row discount">
                    <span>Discount</span>
                    <span>-₹{order.appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="total-row final">
                  <span>Total</span>
                  <span>₹{order.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="order-footer">
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                >
                  {selectedOrder === order._id ? 'Hide Details' : 'View Details'}
                </button>
                
                {(order.status === 'pending' || order.status === 'processing') && (
                  <button 
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              {selectedOrder === order._id && (
                <div className="order-details">
                  <h4>Shipping Address</h4>
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p>Email: {order.shippingAddress.email}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>

                  <h4>Payment Method</h4>
                  <p>{order.paymentMethod.replace('-', ' ').charAt(0).toUpperCase() + order.paymentMethod.slice(1)}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

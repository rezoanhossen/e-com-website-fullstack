import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminOrders.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders/all', {
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/orders/${orderId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchAllOrders();
      setSelectedOrder(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

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
    <div className="admin-orders-container">
      <h1>Order Management</h1>

      <div className="filter-section">
        <label htmlFor="statusFilter">Filter by Status:</label>
        <select 
          id="statusFilter"
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span className="order-count">Total: {filteredOrders.length}</span>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found</p>
        </div>
      ) : (
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className="order-row">
                  <td className="order-id">{order._id.substring(0, 8)}</td>
                  <td>{order.userId?.name || 'Unknown'}</td>
                  <td>{order.items.length}</td>
                  <td className="total-price">₹{order.totalPrice.toFixed(2)}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="view-btn"
                      onClick={() => setSelectedOrder(selectedOrder === order._id ? null : order._id)}
                    >
                      {selectedOrder === order._id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="order-detail-modal">
          <div className="modal-content">
            {(() => {
              const order = orders.find(o => o._id === selectedOrder);
              return (
                <>
                  <div className="modal-header">
                    <h2>Order Details - {order._id.substring(0, 8)}</h2>
                    <button 
                      className="close-btn"
                      onClick={() => setSelectedOrder(null)}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="detail-section">
                      <h3>Order Items</h3>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.productName}</td>
                              <td>{item.quantity}</td>
                              <td>₹{item.price.toFixed(2)}</td>
                              <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="items-total">
                        <span>Subtotal:</span>
                        <span>₹{order.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>Customer Information</h3>
                      <p><strong>Name:</strong> {order.userId?.name}</p>
                      <p><strong>Email:</strong> {order.userId?.email}</p>
                    </div>

                    <div className="detail-section">
                      <h3>Shipping Address</h3>
                      <p>{order.shippingAddress?.fullName}</p>
                      <p>{order.shippingAddress?.address}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</p>
                      <p>{order.shippingAddress?.country}</p>
                      <p><strong>Phone:</strong> {order.shippingAddress?.phone}</p>
                    </div>

                    <div className="detail-section">
                      <h3>Order Status</h3>
                      <div className="status-selector">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <span 
                          className="current-status"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          Current: {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h3>Payment & Shipping</h3>
                      <p><strong>Payment Method:</strong> {order.paymentMethod.replace('-', ' ')}</p>
                      <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

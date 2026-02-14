import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api"
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (name, email, password) => API.post('/auth/register', { name, email, password }),
  login: (email, password) => API.post('/auth/login', { email, password }),
  getProfile: () => API.get('/auth/profile')
};

export const productAPI = {
  getProducts: () => API.get('/products'),
  getProduct: (id) => API.get(`/products/${id}`),
  getRelatedProducts: (id) => API.get(`/products/related/${id}`),
  createProduct: (data) => API.post('/products', data),
  updateProduct: (id, data) => API.put(`/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/products/${id}`)
};

export const couponAPI = {
  getCoupons: () => API.get('/coupons'),
  validateCoupon: (code) => API.post('/coupons/validate', { code }),
  createCoupon: (data) => API.post('/coupons', data),
  updateCoupon: (id, data) => API.put(`/coupons/${id}`, data),
  deleteCoupon: (id) => API.delete(`/coupons/${id}`)
};

export const cartAPI = {
  getCart: () => API.get('/cart'),
  addToCart: (productId, quantity) => API.post('/cart/add', { productId, quantity }),
  updateCartItem: (productId, quantity) => API.put('/cart/update', { productId, quantity }),
  removeFromCart: (productId) => API.delete(`/cart/remove/${productId}`),
  clearCart: () => API.delete('/cart/clear')
};

export const orderAPI = {
  createOrder: (data) => API.post('/orders', data),
  getUserOrders: () => API.get('/orders'),
  getOrder: (id) => API.get(`/orders/${id}`),
  cancelOrder: (id) => API.delete(`/orders/${id}/cancel`),
  getAllOrders: () => API.get('/orders/all'),
  updateOrderStatus: (id, status) => API.put(`/orders/${id}/status`, { status })
};


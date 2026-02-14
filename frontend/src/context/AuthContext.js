import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [wishlist, setWishlist] = useState([]);

  // Restore user from token
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await API.get('/auth/profile');
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
    }
  }, []);

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/register', { name, email, password });
      toast.success('Registration successful! Please verify your email.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setWishlist([]);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await API.put('/auth/profile', profileData);
      setUser(response.data.user);
      toast.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  };

  const addAddress = async (addressData) => {
    try {
      const response = await API.post('/auth/address', addressData);
      setUser(prev => ({
        ...prev,
        addresses: [...(prev.addresses || []), response.data.address]
      }));
      toast.success('Address added successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
      throw error;
    }
  };

  const updateAddress = async (addressId, addressData) => {
    try {
      const response = await API.put(`/auth/address/${addressId}`, addressData);
      setUser(prev => ({
        ...prev,
        addresses: prev.addresses.map(addr => 
          addr._id === addressId ? response.data.address : addr
        )
      }));
      toast.success('Address updated successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update address');
      throw error;
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await API.delete(`/auth/address/${addressId}`);
      setUser(prev => ({
        ...prev,
        addresses: prev.addresses.filter(addr => addr._id !== addressId)
      }));
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
      throw error;
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }
    try {
      await API.post('/auth/wishlist', { productId });
      setWishlist(prev => [...prev, productId]);
      toast.success('Added to wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await API.delete(`/auth/wishlist/${productId}`);
      setWishlist(prev => prev.filter(id => id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  const getWishlist = async () => {
    try {
      const response = await API.get('/auth/wishlist');
      setWishlist(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await API.post('/auth/forgot-password', { email });
      toast.success('Password reset email sent! Check your inbox.');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await API.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    wishlist,
    register,
    login,
    logout,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    forgotPassword,
    resetPassword,
    API
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

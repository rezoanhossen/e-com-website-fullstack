import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          👾 REZIN
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/cart" className="nav-link cart-link">
            🛒 Cart {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
          {user && (
            <Link to="/orders" className="nav-link">Orders</Link>
          )}
          {user?.isAdmin && (
            <Link to="/admin" className="nav-link admin-link">Admin</Link>
          )}
          {user ? (
            <>
              <span className="nav-user">Welcome, {user.name}</span>
              <button onClick={handleLogout} className="nav-button logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button">Login</Link>
              <Link to="/register" className="nav-button register-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

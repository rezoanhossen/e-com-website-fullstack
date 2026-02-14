import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiHome, FiPackage, FiLogOut } from 'react-icons/fi';
import { MdAdminPanelSettings } from 'react-icons/md';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart?.items?.length || 0;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center font-bold text-2xl text-primary hover:text-secondary transition">
              👗 LuxeStyle
            </Link>

            {/* Desktop Menu - Removed, Search Bar Now in Center */}
            
            {/* Search Bar - Centered */}
            <input 
              type="text" 
              placeholder="Search products..." 
              className="hidden md:block px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary w-96"
            />

            {/* Right Menu */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/cart" className="relative p-2 hover:bg-light rounded-lg transition">
                <FiShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="relative group">
                    <button className="p-2 hover:bg-light rounded-lg transition">
                      <FiUser size={24} />
                    </button>
                    <div className="absolute right-0 w-48 bg-white rounded-lg shadow-lg hidden group-hover:block">
                      <Link to="/profile" className="block px-4 py-2 hover:bg-light rounded-t-lg">Profile</Link>
                      <Link to="/orders" className="block px-4 py-2 hover:bg-light">Orders</Link>
                      <Link to="/wishlist" className="block px-4 py-2 hover:bg-light">Wishlist</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-light text-accent rounded-b-lg border-t">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 text-primary hover:bg-light rounded-lg transition">Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-purple-700 transition">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Hamburger - Always Visible */}
            <button 
              className="p-2 hover:bg-secondary hover:text-white rounded-lg transition-all duration-300 ml-4"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <FiX size={28} className="text-accent transition-transform" />
              ) : (
                <FiMenu size={28} className="text-primary transition-transform" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay - Always Available */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Panel - Always Available */}
      <div 
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white shadow-2xl z-40 transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}
      >
        <div className="px-4 py-6 space-y-1">
          {/* Main Navigation */}
          <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Menu</h3>
          
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)} 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary hover:text-white transition transform hover:scale-105"
          >
            <FiHome size={20} />
            <span className="font-semibold">Home</span>
          </Link>

          <Link 
            to="/products" 
            onClick={() => setMobileMenuOpen(false)} 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary hover:text-white transition transform hover:scale-105"
          >
            <FiPackage size={20} />
            <span className="font-semibold">Products</span>
          </Link>

          <Link 
            to="/cart" 
            onClick={() => setMobileMenuOpen(false)} 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary hover:text-white transition transform hover:scale-105 relative"
          >
            <FiShoppingCart size={20} />
            <span className="font-semibold">Cart</span>
            {cartCount > 0 && (
              <span className="ml-auto bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {user?.isAdmin && (
            <Link 
              to="/admin" 
              onClick={() => setMobileMenuOpen(false)} 
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition transform hover:scale-105"
            >
              <MdAdminPanelSettings size={20} />
              <span className="font-semibold">Admin</span>
            </Link>
          )}

          {/* Divider */}
          <div className="my-4 border-t border-gray-200" />

          {/* User Section */}
          <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Account</h3>

          {user ? (
            <>
              <div className="px-4 py-3 bg-light rounded-lg mb-3">
                <p className="font-semibold text-primary">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <Link 
                to="/profile" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary hover:text-white transition"
              >
                <FiUser size={20} />
                <span className="font-semibold">Profile</span>
              </Link>

              <Link 
                to="/orders" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary hover:text-white transition"
              >
                <FiPackage size={20} />
                <span className="font-semibold">My Orders</span>
              </Link>

              <Link 
                to="/wishlist" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary hover:text-white transition"
              >
                <span className="text-xl">❤️</span>
                <span className="font-semibold">Wishlist</span>
              </Link>

              <button 
                onClick={handleLogout} 
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-accent hover:bg-accent hover:text-white transition font-semibold border-t border-gray-200 mt-4"
              >
                <FiLogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-light transition font-semibold border border-primary"
              >
                <FiUser size={20} />
                <span>Login</span>
              </Link>
              <Link 
                to="/register" 
                onClick={() => setMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary text-white hover:bg-purple-700 transition font-semibold"
              >
                <FiUser size={20} />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Check if error is about email verification
      if (err.response?.data?.requiresEmailVerification) {
        setUnverifiedEmail(err.response.data.email);
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {unverifiedEmail && (
          <div className="auth-action">
            <p>Didn't receive the verification email?</p>
            <button 
              type="button"
              className="link-button"
              onClick={() => navigate('/verify-email')}
            >
              Verify Email
            </button>
          </div>
        )}
        
        <p><a href="/forgot-password">Forgot password?</a></p>
        <p>Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
}

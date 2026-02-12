import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  const { token } = useParams();

  // Verify token on mount
  useEffect(() => {
    // Token validity is checked when user submits the form
    // For now, we'll assume the token is valid if the user got to this page
    setIsVerifying(false);
    setIsValidToken(true);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, { 
        password 
      });
      setMessage(response.data.message);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Invalid Reset Link</h2>
          <div className="error-message">This password reset link is invalid or has expired.</div>
          <button 
            className="auth-button" 
            onClick={() => navigate('/forgot-password')}
          >
            Request New Reset Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{message ? 'Password Reset Successful' : 'Reset Password'}</h2>
        <p className="auth-subtitle">{message ? 'Your password has been reset.' : 'Enter your new password below.'}</p>
        
        {error && <div className="error-message">{error}</div>}
        {message && (
          <div className="success-message">
            {message}
            <div className="auth-info" style={{ marginTop: '20px' }}>
              <p>You can now login with your new password.</p>
            </div>
            <button 
              className="auth-button"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        )}
        
        {!message && (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        {!message && <p><a href="/login">Back to Login</a></p>}
      </div>
    </div>
  );
}

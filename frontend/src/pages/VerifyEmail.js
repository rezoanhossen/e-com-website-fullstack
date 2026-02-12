import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`/api/auth/verify-email/${token}`);
      setMessage(response.data.message);
      setLoading(false);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email');
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setResendLoading(true);
    try {
      const response = await axios.post('/api/auth/resend-verification-email', { email });
      setMessage(response.data.message);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
      setMessage('');
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="verification-spinner">
            <p>Verifying your email...</p>
          </div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Email Verified</h2>
          <div className="success-message">{message}</div>
          <p>Redirecting to login page...</p>
          <button 
            className="auth-button" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        <div className="error-message">{error}</div>
        
        <div className="auth-info">
          <p>The verification link is invalid or has expired.</p>
          <p>Please enter your email address and we'll send you a new verification link.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleResendEmail(); }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={resendLoading} className="auth-button">
            {resendLoading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </form>

        <p>Already verified? <a href="/login">Login here</a></p>
        <p>Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  );
}

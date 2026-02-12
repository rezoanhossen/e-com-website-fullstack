import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [registered, setRegistered] = useState(false);
  const { register, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await register(name, email, password);
      setMessage('Registration successful! Check your email to verify your account.');
      setRegistered(true);
      
      // Redirect to verify email page after 2 seconds
      setTimeout(() => {
        navigate('/verify-email');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  if (registered && message) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Registration Successful</h2>
          <div className="success-message">{message}</div>
          <p>Redirecting to email verification page...</p>
          <button 
            className="auth-button"
            onClick={() => navigate('/verify-email')}
          >
            Go to Verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  );
}

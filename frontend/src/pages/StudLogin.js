import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Chatbot from '../Components/Chatbot';
import './css/StudLogin.css';
const API = process.env.REACT_APP_BACKEND_URL;
const StudLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length > 8;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setErrors(prev => ({ ...prev, email: value !== '' && !validateEmail(value) }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setErrors(prev => ({ ...prev, password: value !== '' && !validatePassword(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailError = email === '' || !validateEmail(email);
    const passwordError = password === '' || !validatePassword(password);
    
    setErrors({ email: emailError, password: passwordError });
    
    if (!emailError && !passwordError) {
      setLoading(true);
      setApiError('');

      try {
        const response = await fetch(`${API}/api/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store tokens in localStorage
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Navigate to landing page
          navigate('/');
        } else {
          setApiError(data.error || 'Login failed. Please try again.');
        }
      } catch (error) {
        setApiError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className='login-page'>
      <Navbar />
      <div className='login-content'>
        <div className="login-form-section">
          <div className="login-form">
            <div className="form-group">
              <label htmlFor="email" className={errors.email ? 'error-label' : ''}>Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="" 
                value={email}
                onChange={handleEmailChange}
                className={errors.email ? 'error-input' : ''}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className={errors.password ? 'error-label' : ''}>Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="" 
                value={password}
                onChange={handlePasswordChange}
                className={errors.password ? 'error-input' : ''}
              />
            </div>
            
            {apiError && <p className="api-error-message">{apiError}</p>}
            
            <button className="login-button" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            
            <div className="signup-link">
              Don't have an account? <Link to="/student-signup">Sign up</Link>
            </div>
          </div>
        </div>

        <div className="image-section">
          <div className="masked-image">
            <img 
              src="/images/pahad2.jpg" 
              alt="Mountain" 
            />
          </div>
        </div>
      </div>
      
      <Chatbot />
    </div>
  )
}

export default StudLogin

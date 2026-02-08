import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import Chatbot from '../Components/Chatbot';
import OTPModal from '../Components/OTPModal';
import './css/StudSignup.css';
const API = process.env.REACT_APP_BACKEND_URL;
const StudSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length > 8;
  };

  const validateName = (name) => {
    return name.trim().length > 0;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, name: value }));
    setErrors(prev => ({ ...prev, name: value !== '' && !validateName(value) }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));
    setErrors(prev => ({ ...prev, email: value !== '' && !validateEmail(value) }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, password: value }));
    setErrors(prev => ({ ...prev, password: value !== '' && !validatePassword(value) }));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    setErrors(prev => ({ ...prev, confirmPassword: value !== '' && value !== formData.password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nameError = formData.name === '' || !validateName(formData.name);
    const emailError = formData.email === '' || !validateEmail(formData.email);
    const passwordError = formData.password === '' || !validatePassword(formData.password);
    const confirmPasswordError = formData.confirmPassword === '' || formData.confirmPassword !== formData.password;
    
    setErrors({ name: nameError, email: emailError, password: passwordError, confirmPassword: confirmPasswordError });
    
    if (!nameError && !emailError && !passwordError && !confirmPasswordError) {
      setLoading(true);
      setApiError('');

      try {
        const response = await fetch(`${API}/api/users/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password1: formData.password,
            password2: formData.confirmPassword
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setShowOTPModal(true);
        } else {
          setApiError(data.error || 'Signup failed. Please try again.');
        }
      } catch (error) {
        setApiError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOTPVerify = (message) => {
    alert(message);
    setShowOTPModal(false);
    navigate('/student-login');
  };

  return (
    <div className='signup-page'>
      <Navbar />
      
      <div className='signup-content'>
        <div className="signup-form-section">
          <div className="signup-form">
            <div className="form-group">
              <label htmlFor="name" className={errors.name ? 'error-label' : ''}>Name</label>
              <input 
                type="text" 
                id="name" 
                placeholder="" 
                value={formData.name}
                onChange={handleNameChange}
                className={errors.name ? 'error-input' : ''}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className={errors.email ? 'error-label' : ''}>Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="" 
                value={formData.email}
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
                value={formData.password}
                onChange={handlePasswordChange}
                className={errors.password ? 'error-input' : ''}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword" className={errors.confirmPassword ? 'error-label' : ''}>Confirm Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                placeholder="" 
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={errors.confirmPassword ? 'error-input' : ''}
              />
            </div>
            
            {apiError && <p className="api-error-message">{apiError}</p>}
            
            <button className="signup-button" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            
            <div className="login-link">
              Already have an account? <Link to="/student-login">Login</Link>
            </div>
          </div>
        </div>

        <div className="image-section">
          <div className="masked-image">
            <img 
              src="/images/pahad3.jpg" 
              alt="Mountain" 
            />
      {showOTPModal && (
        <OTPModal 
          email={formData.email} 
          onClose={() => setShowOTPModal(false)}
          onVerify={handleOTPVerify}
        />
      )}
      
          </div>
        </div>
      </div>
      
      <Chatbot />
    </div>
  );
};

export default StudSignup;

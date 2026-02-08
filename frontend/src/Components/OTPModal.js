import React, { useState } from 'react';
import './css/OTPModal.css';
const API = process.env.REACT_APP_BACKEND_URL;
const OTPModal = ({ email, onClose, onVerify }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/users/verify_otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        onVerify(data.message);
      } else {
        setError(data.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/users/resend_otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        alert('New OTP sent to your email!');
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-modal-overlay">
      <div className="otp-modal">
        <div className="otp-modal-header">
          <h2>Verify OTP</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <div className="otp-modal-body">
          <p>Enter the 6-digit OTP sent to {email}</p>
          <input
            type="text"
            maxLength="6"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className={error ? 'error-input' : ''}
          />
          {error && <p className="error-message">{error}</p>}
          <button 
            className="verify-btn" 
            onClick={handleVerify} 
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button 
            className="resend-btn" 
            onClick={handleResend} 
            disabled={resending}
          >
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;

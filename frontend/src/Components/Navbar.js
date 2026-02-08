import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Navbar.css';

const API = process.env.REACT_APP_BACKEND_URL;

const Navbar = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [score, setScore] = useState(null);
  const [loadingScore, setLoadingScore] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isLoggedIn = Boolean(user);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setScore(null);
    setIsDropdownOpen(false);
    navigate('/student-login');
  };

  // Fetch score on click
const fetchScore = async () => {
  if (score !== null || loadingScore) return;

  setLoadingScore(true);

  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) throw new Error("User not logged in");

    const { email } = JSON.parse(storedUser);

    // Send email as query param or POST body
    const response = await fetch(`${API}/api/score/?email=${encodeURIComponent(email)}`);

    const data = await response.json();

    if (response.ok) {
      setScore(Number(data.score).toFixed(2));
    }
  } catch (err) {
    console.error('Failed to fetch score', err);
  } finally {
    setLoadingScore(false);
  }
};

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <h1>LearnBuddy</h1>
        </Link>
      </div>

      <div className="navbar-menu">
        {/* Logged out links */}
        {!isLoggedIn && (
          <>
            <Link to="/student-signup" className="nav-link">Sign up</Link>
            <Link to="/student-login" className="nav-link">Login</Link>
          </>
        )}

        {/* Profile */}
        <div className="profile-container" ref={dropdownRef}>
          <div className="profile-icon" onClick={toggleDropdown}>
            <img src="/images/placehholder.jpeg" alt="Profile" />
          </div>

          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-item">
                <span className="dropdown-label">Name:</span>
                <span className="dropdown-value">{user?.name || 'Guest'}</span>
              </div>

              <div className="dropdown-item">
                <span className="dropdown-label">Email:</span>
                <span className="dropdown-value">{user?.email || 'Not logged in'}</span>
              </div>

              {/* SCORE ITEM */}
              {isLoggedIn && (
                <div
                  className="dropdown-item score-item"
                  onClick={fetchScore}
                >
                  <span className="dropdown-label">Score:</span>
                  <span
                    className={`dropdown-value ${score === null ? 'blurred' : ''}`}
                  >
                    {loadingScore
                      ? 'Loading...'
                      : score !== null
                        ? score
                        : '★★★★★'}
                  </span>
                </div>
              )}

              {/* LOGOUT */}
              {isLoggedIn && (
                <div className="dropdown-item logout-item" onClick={handleLogout}>
                  Logout
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

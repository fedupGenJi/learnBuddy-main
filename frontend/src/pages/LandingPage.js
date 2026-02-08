import React, { useState } from 'react';
import Navbar from '../Components/Navbar';
import Chatbot from '../Components/Chatbot';
import './css/LandingPage.css';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const [showLoginMsg, setShowLoginMsg] = useState(false);

  const user = localStorage.getItem('user');
  const isLoggedIn = Boolean(user);

  const subjects = [
    { id: 1, name: 'Algebraic Fractions', image: '/images/algebra1.jpg' },
    { id: 2, name: 'Arithmetic', image: '/images/algebra2.jpg' },
    { id: 3, name: 'Growth and Depricitation', image: '/images/algebra3.jpeg' },
    { id: 4, name: 'Sequence and Series', image: '/images/algebra4.jpeg' },
    { id: 5, name: 'Probability', image: '/images/algebra5.jpg' },
    { id: 6, name: 'Quadratic Equations', image: '/images/algebra6.jpg' }
  ];

  const handleQuizClick = (e, subjectSlug) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLoginMsg(true);

      // Optional: redirect after short delay
      setTimeout(() => {
        navigate('/student-login');
      }, 1500);
    }
  };

  return (
    <div className="landing-page">
      <Navbar />

      {/* Login warning */}
      {showLoginMsg && (
        <div className="login-warning">
          Please login to use this feature
        </div>
      )}

      <div className="landing-content">
        <div className="subjects-sidebar">
          {subjects.map((subject) => {
            const slug = subject.name
              .toLowerCase()
              .replace(/\s+/g, '-');

            return (
              <Link
                key={subject.id}
                to={`/quiz/${slug}`}
                className="subject-card-link"
                onClick={(e) => handleQuizClick(e, slug)}
              >
                <div className="subject-card">
                  <img src={subject.image} alt={subject.name} />
                  <h3>{subject.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="hero-section">
          <div className="masked-image">
            <img src="/images/Pahad.jpeg" alt="Failed to load" />
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default LandingPage;
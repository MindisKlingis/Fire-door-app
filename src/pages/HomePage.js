import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Fire Door Survey App</h1>
        <p className="subtitle">Streamline your fire door inspections with AI-powered analysis</p>
      </header>

      <main className="home-main">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Digital Surveys</h3>
            <p>Complete fire door surveys efficiently with our digital form</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Photo Upload</h3>
            <p>Upload multiple photos with easy drag-and-drop functionality</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Analysis</h3>
            <p>Get instant AI-powered analysis of fire door conditions</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Location Tracking</h3>
            <p>Automatic GPS coordinates for accurate door locations</p>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-buttons">
            <Link to="/survey" className="start-survey-button">
              Start New Survey
            </Link>
            <Link to="/ai-survey" className="start-survey-button ai-survey-button">
              AI Survey
            </Link>
          </div>
          <p className="cta-description">
            Begin a new fire door survey with our easy-to-use digital form or try our AI-powered analysis
          </p>
        </div>

        <section className="info-section">
          <h2>Why Use Our App?</h2>
          <div className="benefits-list">
            <div className="benefit-item">
              <h4>Efficient Documentation</h4>
              <p>Streamline the survey process with digital forms and automatic data storage</p>
            </div>
            <div className="benefit-item">
              <h4>AI-Powered Analysis</h4>
              <p>Get instant insights on potential compliance issues using advanced AI technology</p>
            </div>
            <div className="benefit-item">
              <h4>Accurate Records</h4>
              <p>Maintain detailed records with photos, GPS locations, and comprehensive reports</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <p>© 2024 Fire Door Survey App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage; 
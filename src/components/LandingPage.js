import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  return (
    <div className="feature-grid">
      <div className="feature-card">
        <div className="feature-icon">📝</div>
        <h2>Digital Surveys</h2>
        <p>Complete fire door surveys efficiently with our digital form</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">📸</div>
        <h2>Photo Upload</h2>
        <p>Upload multiple photos with easy drag-and-drop functionality</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">🤖</div>
        <h2>AI Analysis</h2>
        <p>Get instant AI-powered analysis of fire door conditions</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">📍</div>
        <h2>Location Tracking</h2>
        <p>Automatic GPS coordinates for accurate door locations</p>
      </div>
      <div className="feature-card">
        <div className="feature-icon">🔍</div>
        <h2>System Architecture</h2>
        <p>View the application structure and component relationships</p>
      </div>
      <div className="action-buttons">
        <Link to="/login" className="start-survey-button">Start New Survey</Link>
        <Link to="/ai-survey" className="ai-survey-button">AI Survey</Link>
        <Link to="/architecture" className="architecture-button">View Architecture</Link>
        <Link to="/design-test" className="design-test-button">Design Testing</Link>
        <Link to="/testing-controls" className="testing-controls-button">Input Controls</Link>
      </div>
    </div>
  );
}

export default LandingPage; 
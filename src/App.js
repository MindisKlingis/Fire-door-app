import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import FireDoorSurveyForm from './components/FireDoorSurveyForm';
import CustomerInfoForm from './components/CustomerInfoForm';
import LoginForm from './components/LoginForm';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Fire Door Survey App</h1>
          <p>Streamline your fire door inspections with AI-powered analysis</p>
        </header>

        <main>
          <Routes>
            <Route path="/" element={
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
                <div className="action-buttons">
                  <Link to="/login" className="start-survey-button">Start New Survey</Link>
                  <Link to="/ai-survey" className="ai-survey-button">AI Survey</Link>
                </div>
              </div>
            } />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/customer-info" element={
              <ProtectedRoute>
                <CustomerInfoForm />
              </ProtectedRoute>
            } />
            <Route path="/survey" element={
              <ProtectedRoute>
                <FireDoorSurveyForm />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

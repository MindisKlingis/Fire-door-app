import React from 'react';
import { Link } from 'react-router-dom';
import FireDoorSurveyForm from '../components/FireDoorSurveyForm';
import './SurveyPage.css';

const SurveyPage = () => {
  return (
    <div className="survey-page">
      <header className="survey-header">
        <div className="header-content">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <h1>Fire Door Survey</h1>
        </div>
      </header>

      <main className="survey-content">
        <FireDoorSurveyForm />
      </main>
    </div>
  );
};

export default SurveyPage; 
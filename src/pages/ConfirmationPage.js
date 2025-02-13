import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ConfirmationPage.css';

const ConfirmationPage = () => {
  const location = useLocation();
  const surveyId = location.state?.surveyId;

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="success-icon">✓</div>
        
        <h1>Survey Submitted Successfully!</h1>
        
        <div className="confirmation-details">
          <p className="survey-id">
            Survey ID: <span>{surveyId}</span>
          </p>
          
          <p className="confirmation-message">
            Your fire door survey has been successfully submitted and saved to our system.
            The AI analysis of your uploaded photos will be processed shortly.
          </p>
        </div>

        <div className="next-steps">
          <h3>Next Steps</h3>
          <ul>
            <li>You will receive an email confirmation with the survey details</li>
            <li>AI analysis results will be available within 15 minutes</li>
            <li>You can track the status of your submission using the Survey ID</li>
          </ul>
        </div>

        <div className="action-buttons">
          <Link to="/" className="home-button">
            Return to Home
          </Link>
          
          <Link to="/survey" className="new-survey-button">
            Start New Survey
          </Link>
        </div>

        <div className="support-info">
          <p>
            If you have any questions or need assistance, please contact our support team:
            <br />
            <a href="mailto:support@firedoorsurvey.com">support@firedoorsurvey.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage; 
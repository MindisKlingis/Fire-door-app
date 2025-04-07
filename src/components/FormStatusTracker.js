import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import './SurveyTracker.css'; // Reuse the same CSS

const FormStatusTracker = ({ 
  lastSaved = null,
  isDirty = false,
  hasErrors = false 
}) => {
  return (
    <div className="survey-tracker form-status-tracker">
      <div className="status-indicators">
        {isDirty && (
          <span className="status unsaved">
            Unsaved changes
          </span>
        )}
        {hasErrors && (
          <span className="status error">
            Please fix errors
          </span>
        )}
      </div>
      {lastSaved && (
        <div className="last-saved">
          Last saved: {format(new Date(lastSaved), 'HH:mm:ss')}
        </div>
      )}
    </div>
  );
};

FormStatusTracker.propTypes = {
  lastSaved: PropTypes.string,
  isDirty: PropTypes.bool,
  hasErrors: PropTypes.bool
};

export default FormStatusTracker; 
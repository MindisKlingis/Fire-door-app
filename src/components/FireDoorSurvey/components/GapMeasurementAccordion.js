import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatMeasurement, parseMeasurement, validateMeasurement } from '../utils/formHelpers';
import { MEASUREMENT_TYPES } from '../constants/surveyConstants';

const GapMeasurementAccordion = ({ 
  type, 
  label, 
  gapData, 
  onChange,
  validationRules = { min: 0, max: 100 }
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localErrors, setLocalErrors] = useState({});

  const handleMeasurementChange = (position, value) => {
    const parsedValue = parseMeasurement(value);
    const isValid = validateMeasurement(parsedValue, validationRules);
    
    setLocalErrors(prev => ({
      ...prev,
      [position]: !isValid
    }));

    onChange({
      ...gapData,
      [position]: parsedValue
    });
  };

  const positions = ['top', 'bottom', 'left', 'right', 'middle'];

  return (
    <div className="gap-measurement-accordion">
      <button
        type="button"
        className={`accordion-header ${isExpanded ? 'expanded' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{label}</span>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </button>
      
      {isExpanded && (
        <div className="accordion-content">
          {positions.map(position => (
            <div key={position} className="measurement-row">
              <label htmlFor={`${type}-${position}`}>
                {position.charAt(0).toUpperCase() + position.slice(1)}:
              </label>
              <input
                id={`${type}-${position}`}
                type="text"
                value={formatMeasurement(gapData[position], MEASUREMENT_TYPES.GAP)}
                onChange={(e) => handleMeasurementChange(position, e.target.value)}
                className={localErrors[position] ? 'error' : ''}
              />
              {localErrors[position] && (
                <span className="error-message">
                  Invalid measurement (must be between {validationRules.min}-{validationRules.max}mm)
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

GapMeasurementAccordion.propTypes = {
  type: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  gapData: PropTypes.shape({
    top: PropTypes.string,
    bottom: PropTypes.string,
    left: PropTypes.string,
    right: PropTypes.string,
    middle: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  validationRules: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number
  })
};

GapMeasurementAccordion.defaultProps = {
  validationRules: {
    min: 0,
    max: 100
  }
};

export default GapMeasurementAccordion; 
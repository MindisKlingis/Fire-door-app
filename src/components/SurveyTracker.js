import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SurveyTracker.css';

const SurveyTracker = ({ 
  totalSurveys, 
  currentDoor, 
  onDoorChange, 
  surveyedDoorsList,
  onViewSurveys,
  onEditSurvey,
  onContinueSurvey,
  isFlagged
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [actualTotalDoors, setActualTotalDoors] = useState(totalSurveys);
  const navigate = useNavigate();

  useEffect(() => {
    // Update actual total doors based on the maximum of:
    // 1. Highest door number in surveyedDoorsList
    // 2. Total number of surveyed doors
    // 3. Initial totalSurveys value
    const doorNumbers = surveyedDoorsList.map(door => 
      typeof door === 'object' ? parseInt(door.doorNumber) : parseInt(door)
    ).filter(num => !isNaN(num));
    
    const highestDoorNumber = Math.max(
      ...doorNumbers,
      surveyedDoorsList.length,
      totalSurveys,
      currentDoor
    );
    setActualTotalDoors(highestDoorNumber);
  }, [surveyedDoorsList, totalSurveys, currentDoor]);

  const handleBack = () => {
    navigate('/');
  };

  const renderMarkers = () => {
    const markers = [];
    for (let i = 1; i <= actualTotalDoors; i++) {
      // Check if door is surveyed by looking for it in surveyedDoorsList
      const isSurveyed = surveyedDoorsList.some(door => 
        typeof door === 'object' ? 
        door.doorNumber === String(i) : 
        door === i
      );
      
      // Get door info if it exists
      const doorInfo = surveyedDoorsList.find(door => 
        typeof door === 'object' ? 
        door.doorNumber === String(i) : 
        door === i
      );

      const isDoorFlagged = i === currentDoor ? isFlagged : (doorInfo?.isFlagged || false);
      
      markers.push(
        <div
          key={i}
          className={`survey-marker ${i === currentDoor ? 'current' : ''} ${isSurveyed ? 'surveyed' : ''} ${isDoorFlagged ? 'flagged' : ''}`}
          onClick={() => onDoorChange(i)}
          title={`Door ${i}${isSurveyed ? ' (Surveyed)' : ''}${isDoorFlagged ? ' - Flagged for review' : ''}`}
        >
          {i}
          {isDoorFlagged && <span className="flag-indicator">🚩</span>}
        </div>
      );
    }
    return markers;
  };

  const flaggedCount = surveyedDoorsList.filter(door => door.isFlagged).length + 
    (isFlagged && !surveyedDoorsList.some(door => door.doorNumber === currentDoor.toString()) ? 1 : 0);

  return (
    <div className="survey-tracker">
      <div className="survey-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <button 
          className={`collapse-button ${isCollapsed ? 'collapsed' : ''}`}
          aria-label={isCollapsed ? 'Expand survey progress' : 'Collapse survey progress'}
        >
          <svg viewBox="0 0 24 24">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        <h2 className="survey-title">Survey Progress</h2>
        <div className="survey-stats">
          <span>Total Doors: {Math.max(actualTotalDoors, surveyedDoorsList.length)}</span>
          <span>Surveyed: {surveyedDoorsList.length}</span>
          <span style={{ color: 'red' }}>
            Flagged: {flaggedCount}
          </span>
        </div>
      </div>

      <div className={`survey-content ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="survey-markers">
          {renderMarkers()}
        </div>

        <div className="survey-actions">
          <button className="action-button back" onClick={handleBack}>
            Back to Menu
          </button>
          <button className="action-button view" onClick={onViewSurveys}>
            View Past Inspections
          </button>
          <button 
            className="action-button edit" 
            onClick={() => onEditSurvey(currentDoor)}
            disabled={!surveyedDoorsList.some(door => 
              (typeof door === 'string' ? door : door.doorNumber) === currentDoor.toString()
            )}
          >
            Edit Selected Door
          </button>
          <button className="action-button continue" onClick={onContinueSurvey}>
            Continue Survey
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyTracker; 
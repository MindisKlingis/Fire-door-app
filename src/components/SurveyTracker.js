import React from 'react';
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
  // Calculate total doors and surveyed count
  const surveyedCount = surveyedDoorsList.length;
  const flaggedCount = surveyedDoorsList.filter(door => door.isFlagged).length;

  // Create array of door numbers for display
  const doorNumbers = Array.from({ length: totalSurveys }, (_, i) => i + 1);

  return (
    <div className="survey-tracker">
      <h2>Survey Progress</h2>
      <div className="progress-stats">
        <div className="stat">Total Doors: {totalSurveys}</div>
        <div className="stat">Surveyed: {surveyedCount}</div>
        <div className="stat">Flagged: {flaggedCount}</div>
      </div>
      <div className="door-buttons">
        {doorNumbers.map(doorNumber => {
          const surveyedDoor = surveyedDoorsList.find(
            door => parseInt(door.doorNumber) === doorNumber
          );
          const isSurveyed = !!surveyedDoor;
          const isDoorFlagged = surveyedDoor?.isFlagged;
          const isCurrentDoor = doorNumber === currentDoor;

          return (
            <button
              key={doorNumber}
              className={`door-button ${isSurveyed ? 'surveyed' : ''} ${
                isDoorFlagged ? 'flagged' : ''
              } ${isCurrentDoor ? 'current' : ''}`}
              onClick={() => onDoorChange(doorNumber)}
            >
              {doorNumber}
            </button>
          );
        })}
      </div>
      <div className="action-buttons">
        <button className="back-button" onClick={() => onDoorChange(currentDoor - 1)} disabled={currentDoor <= 1}>
          Back to Menu
        </button>
        <button className="view-past-button" onClick={onViewSurveys}>
          View Past Inspections
        </button>
        <button className="edit-button" onClick={() => onEditSurvey(currentDoor)}>
          Edit Selected Door
        </button>
        <button className="continue-button" onClick={onContinueSurvey}>
          Continue Survey
        </button>
      </div>
    </div>
  );
};

export default SurveyTracker; 
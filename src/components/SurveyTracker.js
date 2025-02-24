import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SurveyTracker.css';

const API_BASE_URL = 'http://localhost:5001';

const SurveyTracker = ({ doorPinNo, onDoorChange }) => {
    const [surveys, setSurveys] = useState([]);
    const [currentDoorIndex, setCurrentDoorIndex] = useState(0);

    const clearSurveys = async () => {
        // Add confirmation dialog
        if (window.confirm('Are you sure you want to clear all surveys? This action cannot be undone.')) {
            try {
                // Clear all surveys from the database using the correct endpoint
                await axios.delete(`${API_BASE_URL}/api/surveys/clear`);
                // Reset local state
                setSurveys([]);
                setCurrentDoorIndex(0);
                if (onDoorChange) {
                    onDoorChange('1');
                }
                alert('All surveys cleared successfully');
            } catch (error) {
                console.error('Error clearing surveys:', error);
                alert('Failed to clear surveys. Please try again.');
            }
        }
    };

    useEffect(() => {
        // Fetch surveys from backend
        const fetchSurveys = async () => {
            try {
                console.log('Fetching surveys...');
                const response = await axios.get(`${API_BASE_URL}/api/surveys`);
                console.log('Surveys fetched:', response.data);
                setSurveys(response.data);
            } catch (error) {
                console.error('Error fetching surveys:', error);
            }
        };

        fetchSurveys();
        // Fetch every 5 minutes
        const interval = setInterval(fetchSurveys, 300000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Find the index of the survey with matching doorPinNo
        const index = surveys.findIndex(survey => survey.doorNumber === doorPinNo);
        if (index !== -1) {
            setCurrentDoorIndex(index);
        }
    }, [doorPinNo, surveys]);

    const navigateDoor = (direction) => {
        let newIndex;
        if (direction === 'prev' && currentDoorIndex > 0) {
            newIndex = currentDoorIndex - 1;
        } else if (direction === 'next' && currentDoorIndex < surveys.length - 1) {
            newIndex = currentDoorIndex + 1;
        } else {
            return;
        }
        
        setCurrentDoorIndex(newIndex);
        if (onDoorChange) {
            onDoorChange(surveys[newIndex]?.doorNumber);
        }
    };

    const currentDoor = surveys[currentDoorIndex]?.doorNumber || doorPinNo || 'No doors';
    const totalSurveys = surveys.length;

    console.log('Rendering SurveyTracker:', { surveys, currentDoorIndex, doorPinNo });

    return (
        <div className="survey-tracker-card" style={{ border: '2px solid red' }}>
            <div className="tracker-header">
                <h2>Survey Tracker</h2>
                <div className="survey-count">{totalSurveys}</div>
            </div>
            <div className="door-navigation">
                <button 
                    className="nav-button prev"
                    onClick={() => navigateDoor('prev')}
                    disabled={currentDoorIndex === 0}
                >
                    ←
                </button>
                <div className="door-display">
                    Door {currentDoor}
                </div>
                <button 
                    className="nav-button next"
                    onClick={() => navigateDoor('next')}
                    disabled={currentDoorIndex === surveys.length - 1}
                >
                    →
                </button>
            </div>
            <button 
                className="clear-button"
                onClick={clearSurveys}
                title="Clear all surveys from the database"
                style={{ 
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '10px',
                    margin: '10px 0',
                    width: '100%',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Clear All Surveys ({surveys.length})
            </button>
        </div>
    );
};

export default SurveyTracker; 
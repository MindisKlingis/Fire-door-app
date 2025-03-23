import React, { useState } from 'react';
import './LocationSelector.css';

const PREPOSITIONS = [
  'Next to',
  'Opposite',
  'Adjacent to',
  'Close to',
  'Near',
  'At',
  'Inside',
  'Outside',
  'Leading into',
  'Between'
];

const PLACES = [
  'Flat',
  'Corridor',
  'Bedroom',
  'Stairs',
  'Lobby',
  'Kitchen',
  'Toilet',
  'Plant Room',
  'Cluster Entrance',
  'Lift'
];

const LocationSelector = ({ onSelect, initialValue }) => {
  const [inputValue, setInputValue] = useState(initialValue || '');
  const [selectedPreposition, setSelectedPreposition] = useState('');
  const [showingPlaces, setShowingPlaces] = useState(false);
  const [customPrepositions, setCustomPrepositions] = useState([]);
  const [customPlaces, setCustomPlaces] = useState([]);
  const [isAddingPreposition, setIsAddingPreposition] = useState(false);
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const [newWord, setNewWord] = useState('');

  const handlePrepositionSelect = (preposition) => {
    setSelectedPreposition(preposition);
    setShowingPlaces(true);
    setInputValue(preposition);
    onSelect(preposition);
  };

  const handlePlaceSelect = (place) => {
    const newLocation = `${selectedPreposition} ${place}`.trim();
    setInputValue(newLocation);
    onSelect(newLocation);
    setSelectedPreposition('');
    setShowingPlaces(false);
  };

  const handleBackToPrepositions = () => {
    setShowingPlaces(false);
    setSelectedPreposition('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onSelect(value);
  };

  const handleAddWord = () => {
    if (!newWord.trim()) return;

    if (isAddingPreposition) {
      setCustomPrepositions([...customPrepositions, newWord.trim()]);
      setIsAddingPreposition(false);
    } else if (isAddingPlace) {
      setCustomPlaces([...customPlaces, newWord.trim()]);
      setIsAddingPlace(false);
    }
    setNewWord('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  return (
    <div className="location-selector">
      {showingPlaces && (
        <button 
          className="back-arrow"
          onClick={handleBackToPrepositions}
          title="Back to prepositions"
        >
          ←
        </button>
      )}
      {!showingPlaces ? (
        <div className="preposition-buttons">
          {[...PREPOSITIONS, ...customPrepositions].map(prep => (
            <button 
              key={prep}
              className="preposition-button"
              onClick={() => handlePrepositionSelect(prep)}
            >
              {prep}
            </button>
          ))}
          {isAddingPreposition ? (
            <div className="add-word-container">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type new word..."
                className="add-word-input"
                autoFocus
              />
              <button 
                className="add-word-confirm"
                onClick={handleAddWord}
              >
                Add
              </button>
            </div>
          ) : (
            <button 
              className="add-button"
              onClick={() => setIsAddingPreposition(true)}
              title="Add custom preposition"
            >
              +
            </button>
          )}
        </div>
      ) : (
        <div className="preposition-buttons">
          {[...PLACES, ...customPlaces].map(place => (
            <button
              key={place}
              className="preposition-button"
              onClick={() => handlePlaceSelect(place)}
            >
              {place}
            </button>
          ))}
          {isAddingPlace ? (
            <div className="add-word-container">
              <input
                type="text"
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type new word..."
                className="add-word-input"
                autoFocus
              />
              <button 
                className="add-word-confirm"
                onClick={handleAddWord}
              >
                Add
              </button>
            </div>
          ) : (
            <button 
              className="add-button"
              onClick={() => setIsAddingPlace(true)}
              title="Add custom place"
            >
              +
            </button>
          )}
        </div>
      )}

      <div className="selector-header">
        <input
          type="text"
          className="location-input"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter location..."
        />
      </div>
    </div>
  );
};

export default LocationSelector; 
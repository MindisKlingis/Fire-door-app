import React, { useState, useEffect } from 'react';
import './RoomTypeSelector.css';

// Keep ROOM_TYPES for search functionality but not direct display
const ROOM_TYPES = {
  'Residential Spaces': [
    'Bedroom',
    'Living Room / Lounge',
    'Kitchen',
    'Bathroom / Washroom',
    'Utility Room',
    'Storage Cupboard - No Flammables',
    'Storage Cupboard - With Flammables',
    'Flat Entrance',
    'Cluster Entrance',
    'Carer\'s Office',
    'Laundry Room'
  ],
  'Communal & Circulation': [
    'Corridor',
    'Lobby',
    'Hallway',
    'Stairwell / Stair Enclosure',
    'Lift Lobby',
    'Communal Entrance',
    'Reception Area',
    'Meeting Room',
    'Roof Access',
    'Mezzanine Access',
    'Communal Lounge',
    'Cluster Entrance'
  ],
  'Service & Maintenance': [
    'Electric Cupboard',
    'Riser Cupboard',
    'Water Main Cupboard',
    'Gas Meter Cupboard',
    'IT/Comms Room',
    'Plant Room',
    'Boiler Room',
    'Cleaner\'s Cupboard',
    'Maintenance Room',
    'First Aid Room',
    'CCTV Room'
  ],
  'Educational Spaces': [
    'Head Teacher / Principal\'s Office',
    'Staff Room',
    'Classroom',
    'Science Lab',
    'IT Suite',
    'Art Room',
    'Music Room',
    'Library',
    'Lecture Theatre',
    'Sports Hall',
    'Changing Room'
  ],
  'Fire & Emergency': [
    'Final Exit Fire Door',
    'Escape Route Door',
    'Emergency Access Hatch',
    'Fire Lobby Door',
    'Stair Core Fire Door'
  ]
};

const RECENT_SELECTIONS_KEY = 'roomTypeRecentSelections';
const MAX_RECENT_SELECTIONS = 15;

const RoomTypeSelector = ({ onSelect, initialValue, previousRoom }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [recentSelections, setRecentSelections] = useState([]);

  // Update input value when initialValue changes, but only if it's not empty
  useEffect(() => {
    if (initialValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  // Load recent selections from localStorage on component mount
  useEffect(() => {
    const savedSelections = localStorage.getItem(RECENT_SELECTIONS_KEY);
    if (savedSelections) {
      setRecentSelections(JSON.parse(savedSelections));
    }
  }, []);

  // Auto-expand when 3 or more letters are typed
  useEffect(() => {
    if (inputValue.length >= 3) {
      setIsExpanded(true);
    }
  }, [inputValue]);

  const handleTypeSelect = (type) => {
    setInputValue(type);
    setIsExpanded(false);
    onSelect(type);
    
    // Update recent selections
    const updatedSelections = [type, ...recentSelections.filter(item => item !== type)]
      .slice(0, MAX_RECENT_SELECTIONS);
    
    setRecentSelections(updatedSelections);
    localStorage.setItem(RECENT_SELECTIONS_KEY, JSON.stringify(updatedSelections));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    // Close dropdown if input is cleared or less than 3 chars
    if (value.length < 3) {
      setIsExpanded(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleTypeSelect(inputValue.trim());
    } else if (e.key === 'ArrowDown') {
      setIsExpanded(true);
    }
  };

  const getAllTypes = () => {
    return Object.values(ROOM_TYPES).flat();
  };

  const getFilteredItems = () => {
    const allTypes = getAllTypes();
    if (!inputValue || inputValue.length < 3) return [];
    
    return allTypes.filter(type => 
      type.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const shouldShowDropdown = isExpanded && (inputValue.length >= 3 || !inputValue);

  const handleQuickSelect = () => {
    if (previousRoom) {
      handleTypeSelect(previousRoom);
    }
  };

  return (
    <div className="room-type-selector">
      <div className="selector-container">
        <div className="selector-header">
          <input
            type="text"
            className="main-input"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Type 3+ letters or select room..."
          />
          <span 
            className={`arrow ${isExpanded ? 'expanded' : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            ▼
          </span>
        </div>

        {shouldShowDropdown && (
          <div className="selector-content">
            <div className="items-list">
              {inputValue.length >= 3 ? (
                getFilteredItems().map(item => (
                  <div
                    key={item}
                    className={`type-item ${inputValue === item ? 'selected' : ''}`}
                    onClick={() => handleTypeSelect(item)}
                  >
                    {item}
                  </div>
                ))
              ) : (
                recentSelections.length > 0 && (
                  <div className="recent-selections">
                    <h4>Recent Selections</h4>
                    {recentSelections.map(type => (
                      <div 
                        key={type} 
                        className="type-item"
                        onClick={() => handleTypeSelect(type)}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        className="quick-select-button"
        onClick={handleQuickSelect}
        disabled={!previousRoom}
        title={previousRoom ? `Use previous room: ${previousRoom}` : 'No previous room available'}
      >
        {previousRoom || 'No previous room'}
      </button>
    </div>
  );
};

export default RoomTypeSelector; 
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ExcelJS from 'exceljs';
import PhotoUpload from './PhotoUpload';
import RoomTypeSelector from './RoomTypeSelector';
import SurveyTracker from './SurveyTracker';
import './FireDoorSurveyForm.css';
import LocationSelector from './LocationSelector';
import { updateSurvey, createSurvey, fetchSurveys, uploadSurveyPhoto } from '../api/surveyApi';
import exportToExcel from '../utils/excelExport';
import { getAllSurveys, saveSurvey } from '../utils/db';
import { clearAllSurveys } from '../utils/db';

const API_BASE_URL = 'http://localhost:5001';

const PHOTO_TYPES = {
  FRONT_DOOR: 'frontDoorPicture',
  TOP_LEAF: 'topLeafPicture',
  TOP_LEAF_DOUBLE: 'topLeafDoublePicture',
  FAULTS_3: 'unmentionedFaults3',
  FAULTS_4: 'unmentionedFaults4',
  FAULTS_5: 'unmentionedFaults5'
};

const commonThicknessValues = ['44', '54', '58'];

// Add CustomSelect component at the top of the file after imports
const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSelectChange = (e) => {
    const newValue = e.target.value;
    if (newValue === 'custom') {
      setIsEditing(true);
      setInputValue('');
    } else {
      onChange(newValue);
      setIsEditing(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleInputBlur = () => {
    if (inputValue.trim() === '') {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className="select-input"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder="Type custom value..."
      />
    );
  }

  return (
    <select
      value={value}
      onChange={handleSelectChange}
      className="select-input"
    >
      <option value="">{placeholder || 'Select option'}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      <option value="custom">Enter custom text...</option>
    </select>
  );
};

// Add FloorSelector component after CustomSelect component
const FloorSelector = ({ value, onChange, previousFloor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Only set input value if there's actually a value
    if (value) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const handleOptionClick = (option) => {
    onChange(option.value);
    setInputValue(option.value);
    setIsOpen(false);
  };

  const handleQuickSelect = () => {
    if (previousFloor) {
      onChange(previousFloor);
      setInputValue(previousFloor);
    }
  };

  const floorOptions = [
    { value: 'Basement', label: 'Basement' },
    { value: 'Ground Floor', label: 'Ground Floor' },
    ...Array.from({ length: 20 }, (_, i) => ({
      value: `${i + 1}`,
      label: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Floor`
    }))
  ];

  return (
    <div className="floor-selector">
      <div className="floor-input-container" ref={dropdownRef}>
        <input
          type="text"
          className="select-input"
          value={inputValue}
          onChange={handleInputChange}
          onClick={() => setIsOpen(!isOpen)}
          placeholder="Select Floor"
        />
        <button 
          type="button" 
          className="dropdown-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '▼' : '▶'}
        </button>
        {isOpen && (
          <div className="floor-options">
            {floorOptions.map(option => (
              <div
                key={option.value}
                className={`floor-option ${inputValue === option.value ? 'selected' : ''}`}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        className="quick-select-button"
        onClick={handleQuickSelect}
        disabled={!previousFloor}
        title={previousFloor ? `Use previous floor: ${previousFloor}` : 'No previous floor available'}
      >
        {previousFloor || 'No previous floor'}
      </button>
    </div>
  );
};

// Add new GapMeasurementAccordion component
const GapMeasurementAccordion = ({ 
  type, 
  label, 
  gapData, 
  onGapChange, 
  onPhotoUpload, 
  photoUrl, 
  onPhotoRemove,
  isExpanded,
  onToggle,
  onRangeComplete,
  isCompliant
}) => {
  const [isManualInput, setIsManualInput] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const accordionRef = useRef(null);

  const handleManualRangeSubmit = (e) => {
    e.preventDefault();
    const start = e.target.rangeStart.value;
    const end = e.target.rangeEnd.value;
    if (start && end && parseFloat(start) < parseFloat(end)) {
      onGapChange(type, start, true);
      onGapChange(type, end, false);
    }
  };

  const handleButtonMouseDown = (value) => {
    // Start long press timer
    const timer = setTimeout(() => {
      setIsSelectingRange(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleButtonMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsSelectingRange(false);
  };

  const handleButtonClick = (value) => {
    if (!isSelectingRange) {
      // Normal click handling
      if (!gapData.start) {
        onGapChange(type, value, true);
      } else if (!gapData.end && parseFloat(value) > parseFloat(gapData.start)) {
        onGapChange(type, value, false);
        onRangeComplete(type);
      } else {
        onGapChange(type, value, true);
        onGapChange(type, '', false);
      }
    }
  };

  const getRangeSummary = () => {
    if (gapData.start && gapData.end) {
      return `${gapData.start} – ${gapData.end} mm`;
    } else if (gapData.start) {
      return `${gapData.start} mm`;
    }
    return 'Not set';
  };

  const isWithinCompliantRange = (value) => {
    const numValue = parseFloat(value);
    return numValue >= 2 && numValue <= 4;
  };

  return (
    <div className={`gap-accordion ${isExpanded ? 'expanded' : ''}`} ref={accordionRef}>
      <div 
        className={`gap-accordion-header ${isCompliant ? 'compliant' : ''}`}
        onClick={onToggle}
      >
        <div className="gap-header-content">
          <span className="gap-label">{label}</span>
          <span className="gap-summary">{getRangeSummary()}</span>
          {isCompliant && <span className="compliant-check">✓</span>}
        </div>
        <div className="gap-header-actions">
          <label className="photo-upload-mini">
            <input
              type="file"
              accept="image/*"
              onChange={onPhotoUpload}
              style={{ display: 'none' }}
            />
            <span className="camera-icon">📸</span>
          </label>
          <span className="accordion-arrow">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="gap-accordion-content">
          <div className="input-type-toggle">
            <button
              type="button"
              className={`toggle-button ${!isManualInput ? 'active' : ''}`}
              onClick={() => setIsManualInput(false)}
            >
              Buttons
            </button>
            <button
              type="button"
              className={`toggle-button ${isManualInput ? 'active' : ''}`}
              onClick={() => setIsManualInput(true)}
            >
              Manual
            </button>
          </div>

          {isManualInput ? (
            <form onSubmit={handleManualRangeSubmit} className="manual-range-form">
              <div className="range-inputs">
                <input
                  type="number"
                  name="rangeStart"
                  placeholder="Start"
                  step="0.5"
                  min="0"
                  max="12"
                />
                <span>to</span>
                <input
                  type="number"
                  name="rangeEnd"
                  placeholder="End"
                  step="0.5"
                  min="0"
                  max="12"
                />
                <button type="submit">Set</button>
              </div>
            </form>
          ) : (
            <div className="gap-buttons">
              {['0', '1', '2', '3', '4', '4.5', '5', '6', '7', '8', '9', '10', '11', '12+'].map(value => (
                <button
                  key={value}
                  className={`gap-button ${gapData.start === value ? 'selected start' : ''} 
                    ${gapData.end === value ? 'selected end' : ''} 
                    ${gapData.start && gapData.end && 
                    parseFloat(value) > parseFloat(gapData.start) && 
                    parseFloat(value) < parseFloat(gapData.end) ? 'in-range' : ''}
                    ${isWithinCompliantRange(value) ? 'compliant' : ''}`}
                  onClick={() => handleButtonClick(value)}
                  onMouseDown={() => handleButtonMouseDown(value)}
                  onMouseUp={handleButtonMouseUp}
                  onTouchStart={() => handleButtonMouseDown(value)}
                  onTouchEnd={handleButtonMouseUp}
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          {photoUrl && (
            <div className="photo-preview-mini">
              <img src={photoUrl} alt={`${label} measurement`} />
              <button className="remove-photo" onClick={() => onPhotoRemove(type)}>✕</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add IndexedDB initialization
const initializeDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FireDoorSurveys', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store for surveys
      if (!db.objectStoreNames.contains('surveys')) {
        const store = db.createObjectStore('surveys', { keyPath: 'doorNumber' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Create object store for photos
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: ['doorNumber', 'photoType'] });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
  });
};

// Add helper functions for IndexedDB operations
const saveSurveyToIndexedDB = async (survey) => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['surveys'], 'readwrite');
    const store = transaction.objectStore('surveys');
    
    const request = store.put({
      ...survey,
      timestamp: new Date().getTime()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getSurveyFromIndexedDB = async (doorNumber) => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['surveys'], 'readonly');
    const store = transaction.objectStore('surveys');
    
    const request = store.get(doorNumber);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getAllSurveysFromIndexedDB = async () => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['surveys'], 'readonly');
    const store = transaction.objectStore('surveys');
    
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const saveSurveyToServer = async (surveyData) => {
  const response = await fetch('http://localhost:5001/api/surveys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(surveyData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save survey');
  }

  const savedSurvey = await response.json();
  return savedSurvey;
};

const addSurveyToIndexedDB = async (survey) => {
  const db = await initializeDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['surveys'], 'readwrite');
    const store = transaction.objectStore('surveys');
    
    const request = store.put({
      ...survey,
      timestamp: new Date().getTime()
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Add the TagInput component before the FireDoorSurveyForm component
const TagInput = ({ 
  tags, 
  onAddTag, 
  onRemoveTag, 
  options, 
  placeholder, 
  commonDefects = [],
  recentDefects = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Filter options when at least 3 characters are typed
    if (newValue.length >= 3) {
      const filtered = options.filter(option => 
        !tags.includes(option.value) && 
        option.label.toLowerCase().includes(newValue.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredOptions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      // Add custom tag if it doesn't exist as option
      const existingOption = options.find(option => 
        option.label.toLowerCase() === inputValue.toLowerCase()
      );
      
      if (existingOption) {
        onAddTag(existingOption.value);
      } else {
        onAddTag(inputValue.trim());
      }
      
      setInputValue('');
      e.preventDefault();
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      // Remove the last tag when backspace is pressed on empty input
      onRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onAddTag(suggestion.value);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleQuickDefectClick = (defect) => {
    onAddTag(defect);
    setInputValue('');
  };

  // Filter out already added tags from suggestions
  const availableQuickDefects = [...commonDefects, ...recentDefects]
    .filter(defect => !tags.includes(defect))
    .slice(0, 5); // Show top 5 to avoid crowding

  return (
    <div className="tag-input-container">
      <div className="input-wrapper">
        <input
          ref={inputRef}
          className="tag-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add another defect..."}
        />
      </div>
      
      {availableQuickDefects.length > 0 && (
        <div className="quick-defects">
          <div className="quick-defects-label">Common defects:</div>
          <div className="quick-defects-buttons">
            {availableQuickDefects.map(defect => {
              const option = options.find(opt => opt.value === defect);
              const displayText = option ? option.label : defect;
              
              return (
                <button
                  key={defect}
                  type="button"
                  className="quick-defect-button"
                  onClick={() => handleQuickDefectClick(defect)}
                >
                  {displayText}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {showSuggestions && filteredOptions.length > 0 && (
        <div className="suggestions-dropdown" ref={suggestionsRef}>
          {filteredOptions.map((option) => (
            <div 
              key={option.value} 
              className="suggestion-item"
              onClick={() => handleSuggestionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      
      {tags.length > 0 && (
        <div className="tags-area">
          {tags.map(tag => {
            // Find the label if it's a predefined option
            const option = options.find(opt => opt.value === tag);
            const displayText = option ? option.label : tag;
            
            return (
              <div className="tag" key={tag}>
                <span className="tag-text">{displayText}</span>
                <button 
                  type="button" 
                  className="remove-tag" 
                  onClick={() => onRemoveTag(tag)}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FireDoorSurveyForm = () => {
  const navigate = useNavigate();
  
  // Define components array at the top of the component
  const components = [
    { field: 'frameCondition', label: 'Frame', defects: 'frameDefects' },
    { field: 'leafCondition', label: 'Leaf', defects: 'leafDefects' },
    { field: 'alignment', label: 'Alignment', defects: 'alignmentDefects' },
    { field: 'handlesSufficient', label: 'Handles', defects: 'handlesDefects' },
    { field: 'lockCondition', label: 'Lock', defects: 'lockDefects' },
    { field: 'signageSatisfactory', label: 'Signage', defects: 'signageDefects' },
    { field: 'hingesCondition', label: 'Hinges', defects: 'hingesDefects' },
    { field: 'thresholdSeal', label: 'Threshold', defects: 'thresholdDefects' },
    { field: 'combinedStripsCondition', label: 'Seals', defects: 'combinedStripsDefects' },
    { field: 'selfCloserFunctional', label: 'Closer', defects: 'selfCloserDefects' },
    { field: 'furnitureCondition', label: 'Furniture', defects: 'furnitureDefects' },
    { field: 'glazingSufficient', label: 'Glazing', defects: 'glazingDefects' }
  ];
  
  // Common defects by category based on historical data
  const COMMON_DEFECTS = {
    frame: ['Split Frame', 'Loose Frame', 'Frame Not Securely Fixed'],
    leaf: ['Damaged Leaf', 'Warped / Bowed Leaf', 'Voids / Holes'],
    alignment: ['Door Binding on Frame', 'Excessive Gap', 'Uneven Gaps'],
    handles: ['Handle Missing', 'Handle Loose or Damaged', 'Fixings Missing or Loose'],
    lock: ['Lock Not Functioning', 'Lock Damaged', 'Strike Plate Misaligned'],
    signage: ['Missing Fire Door Keep Shut Sign', 'Sign Not Clearly Visible', 'Sign Faded or Peeling'],
    hinges: ['Loose Hinges', 'Hinge Screws Missing or Loose', 'Hinges Painted Over'],
    threshold: ['Threshold Seal Missing', 'Threshold Seal Damaged', 'Excessive Gap Under Door'],
    seals: ['Missing Strip(s)', 'Damaged or Torn Strip', 'Not Continuous'],
    closer: ['Closer Missing', 'Closer Too Weak (Does Not Close Fully)', 'Not Closing Into Latch'],
    furniture: ['Door Knocker Not Fire-Rated', 'Letter Plate Not Fire-Rated', 'Loose/Missing Fixings'],
    glazing: ['Cracked/Damaged Glass', 'Non-Fire Rated Glazing', 'Loose Beading']
  };
  
  // Recent defects - in a real app, these would come from API or local storage
  const RECENT_DEFECTS = {
    frame: ['Impact Damage', 'Previous Poor Repairs'],
    leaf: ['Leaf Thickness Insufficient', 'Not Original Certified Leaf'],
    alignment: ['Door Drops When Opened', 'Door Not Latching Properly'],
    handles: ['Handle Not Operating Latch', 'Incompatible Handle Type'],
    lock: ['Incompatible Lock Type', 'Security Risk'],
    signage: ['Wrong Location (e.g. wrong face of door)', 'Obsolete or Non-Compliant Signage'],
    hinges: ['Incorrect Number of Hinges (Less Than 3)', 'Hinges Not Fire-Rated'],
    threshold: ['Incompatible Threshold Material', 'Threshold Not Securely Fixed'],
    seals: ['Smoke seal Painted Over', 'Poor Adhesion (falling off)'],
    closer: ['Damaged or Bent Arm', 'Closer Installed Incorrectly'],
    furniture: ['Spy Hole Not Fire-Rated', 'Damaged Kick Plate'],
    glazing: ['Missing Intumescent Seal Around Glazing', 'Incompatible Beading Material']
  };

  const initialFormState = {
    doorPinNo: '1',
    floor: '',
    room: '',
    locationOfDoorSet: '',
    doorType: '',
    doorMaterial: { type: '' },
    rating: '',
    thirdPartyCertification: { type: '' },
    surveyed: false,
    isFlagged: false,
    
    // Door Configuration
    doorConfiguration: {
      type: '',
      hasFanLight: false,
      hasSidePanels: false,
      hasVPPanel: false
    },
    
    // Measurements and Photos
    leafThickness: '',
    leafGap: {
      hingeSide: { start: '', end: '' },
      topGap: { start: '', end: '' },
      leadingEdge: { start: '', end: '' },
      thresholdGap: { start: '', end: '' }
    },
    measurements: {
      hingeSidePhoto: null,
      hingeSidePhotoUrl: null,
      topGapPhoto: null,
      topGapPhotoUrl: null,
      leadingEdgePhoto: null,
      leadingEdgePhotoUrl: null,
      thresholdGapPhoto: null,
      thresholdGapPhotoUrl: null,
      leafThicknessPhoto: null,
      leafThicknessPhotoUrl: null
    },
    
    // Condition Assessments
    frameCondition: 'Not Assessed',
    frameDefects: [],
    
    leafCondition: 'Not Assessed',
    leafDefects: [],
    
    alignment: 'Not Assessed',
    alignmentDefects: [],
    
    handlesSufficient: 'Not Assessed',
    handlesDefects: [],
    
    lockCondition: 'Not Assessed',
    lockDefects: [],
    
    signageSatisfactory: 'Not Assessed',
    signageDefects: [],
    
    hingesCondition: 'Not Assessed',
    hingesDefects: [],
    
    thresholdSeal: 'Not Assessed',
    thresholdDefects: [],
    
    // Add these fields explicitly
    sealsCondition: 'Not Assessed',
    sealsDefects: [],
    
    closerCondition: 'Not Assessed',
    closerDefects: [],
    
    furnitureCondition: 'Not Assessed',
    furnitureDefects: [],
    
    glazingCondition: 'Not Assessed',
    glazingDefects: [],
    
    // Final Assessment
    overallCondition: '',
    upgradeReplacement: '',
    conditionDetails: {
      notes: ''
    }
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [allSurveys, setAllSurveys] = useState([]);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [surveyId, setSurveyId] = useState(null);
  const [isSurveySaved, setIsSurveySaved] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState(
    Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
  );
  const [tempPhotos, setTempPhotos] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [currentDoor, setCurrentDoor] = useState(1);
  const [surveyedDoorsList, setSurveyedDoorsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [expandedGap, setExpandedGap] = useState('hingeSide');
  const [previousFloor, setPreviousFloor] = useState('');
  const [previousRoom, setPreviousRoom] = useState('');
  const [previousCustomRating, setPreviousCustomRating] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    doorSpecs: true,
    measurements: true,
    conditionAssessment: true,
    glazingAssessment: true,
    finalAssessment: true
  });

  // Add ref for section summary
  const sectionSummaryRef = useRef(null);

  // Add scroll indicator handler
  const updateScrollIndicators = () => {
    const element = sectionSummaryRef.current;
    if (element) {
      const canScrollUp = element.scrollTop > 0;
      const canScrollDown = element.scrollHeight > element.clientHeight && 
        element.scrollTop < element.scrollHeight - element.clientHeight;

      element.classList.toggle('can-scroll-up', canScrollUp);
      element.classList.toggle('can-scroll-down', canScrollDown);
    }
  };

  // Add effect to initialize scroll indicators
  useEffect(() => {
    const element = sectionSummaryRef.current;
    if (element) {
      updateScrollIndicators();
      element.addEventListener('scroll', updateScrollIndicators);
      
      // Update indicators when content changes
      const observer = new MutationObserver(updateScrollIndicators);
      observer.observe(element, { childList: true, subtree: true });

      return () => {
        element.removeEventListener('scroll', updateScrollIndicators);
        observer.disconnect();
      };
    }
  }, [expandedSections]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    // Reset scroll position when expanding
    if (sectionSummaryRef.current) {
      sectionSummaryRef.current.scrollTop = 0;
    }
  };

  const toggleAllSections = (expand = true) => {
    setExpandedSections({
      basicInfo: expand,
      doorSpecs: expand,
      measurements: expand,
      conditionAssessment: expand,
      glazingAssessment: expand,
      finalAssessment: expand
    });
  };

  // Add helper function to get section summary
  const getSectionSummary = (section) => {
    switch (section) {
      case 'basicInfo':
        return (
          <div className="section-summary">
            <div className="summary-group">
              <div className="summary-item">
                <span className="summary-label">Location</span>
                <span className="summary-value">
                  {formData.floor || 'Not specified'}, {formData.room || 'Not specified'}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Position</span>
                <span className="summary-value">{formData.locationOfDoorSet || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Door No.</span>
                <span className="summary-value">{formData.doorNumber || 'Not specified'}</span>
              </div>
            </div>
          </div>
        );

      case 'doorSpecs':
        const doorConfig = formData.doorConfiguration || {};
        const configExtras = [];
        
        if (doorConfig.hasVPPanel) configExtras.push('VP Panel');
        if (doorConfig.hasFanLight) configExtras.push('Fan Light');
        if (doorConfig.hasSidePanels) configExtras.push('Side Panels');
        
        return (
          <div className="section-summary">
            <div className="summary-group">
              <div className="summary-item">
                <span className="summary-label">Type</span>
                <span className="summary-value">
                  {doorConfig.type || 'Not specified'}
                  {configExtras.length > 0 && (
                    <span className="measurement-tag">
                      {configExtras.join(', ')}
                    </span>
                  )}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Material</span>
                <span className="summary-value">
                  {formData.doorMaterial?.type || 'Not specified'}
                  {formData.doorMaterial?.custom && (
                    <span className="measurement-tag">
                      {formData.doorMaterial.custom}
                    </span>
                  )}
                </span>
              </div>
            </div>
            <div className="summary-group">
              <div className="summary-item">
                <span className="summary-label">Rating</span>
                <span className="summary-value">{formData.rating || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Certification</span>
                <span className="summary-value">
                  {formData.thirdPartyCertification?.type || 'None'}
                  {formData.thirdPartyCertification?.custom && (
                    <span className="measurement-tag">
                      {formData.thirdPartyCertification.custom}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        );

      case 'measurements':
        // Check if we have the gaps data, it might be under formData.leafGap or formData.gaps
        const gapsData = formData.leafGap || formData.gaps || {};
        const hingeSideCompliant = isGapCompliant(gapsData.hingeSide);
        const topGapCompliant = isGapCompliant(gapsData.topGap);
        const leadingEdgeCompliant = isGapCompliant(gapsData.leadingEdge);
        // Fix: Use thresholdGap instead of threshold to match the data structure
        const thresholdCompliant = isGapCompliant(gapsData.thresholdGap);
        
        return (
          <div className="section-summary">
            <div className="summary-group">
              <div className="summary-item">
                <span className="summary-label">Thickness</span>
                <span className="summary-value">
                  {formData.leafThickness ? `${formData.leafThickness}mm` : 'Not specified'}
                </span>
              </div>
            </div>
            <div className="summary-group">
              <div className="summary-item">
                <span className="summary-label">Hinge Gap</span>
                <span className="summary-value">
                  {gapsData.hingeSide?.start ? 
                    `${gapsData.hingeSide.start}-${gapsData.hingeSide.end}mm` : 
                    'Not specified'}
                  {gapsData.hingeSide?.start && (
                    <span className={`status-indicator ${hingeSideCompliant ? 'pass' : 'fail'}`}>
                      {hingeSideCompliant ? 'PASS' : 'FAIL'}
                    </span>
                  )}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Top Gap</span>
                <span className="summary-value">
                  {gapsData.topGap?.start ? 
                    `${gapsData.topGap.start}-${gapsData.topGap.end}mm` : 
                    'Not specified'}
                  {gapsData.topGap?.start && (
                    <span className={`status-indicator ${topGapCompliant ? 'pass' : 'fail'}`}>
                      {topGapCompliant ? 'PASS' : 'FAIL'}
                    </span>
                  )}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Leading Edge</span>
                <span className="summary-value">
                  {gapsData.leadingEdge?.start ? 
                    `${gapsData.leadingEdge.start}-${gapsData.leadingEdge.end}mm` : 
                    'Not specified'}
                  {gapsData.leadingEdge?.start && (
                    <span className={`status-indicator ${leadingEdgeCompliant ? 'pass' : 'fail'}`}>
                      {leadingEdgeCompliant ? 'PASS' : 'FAIL'}
                    </span>
                  )}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Threshold</span>
                <span className="summary-value">
                  {gapsData.thresholdGap?.start ? 
                    `${gapsData.thresholdGap.start}-${gapsData.thresholdGap.end}mm` : 
                    'Not specified'}
                  {gapsData.thresholdGap?.start && (
                    <span className={`status-indicator ${thresholdCompliant ? 'pass' : 'fail'}`}>
                      {thresholdCompliant ? 'PASS' : 'FAIL'}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        );

      case 'conditionAssessment':
        // Define components if not already defined in the component
        const conditionComponents = components || [
          { field: 'frameCondition', label: 'Frame', defects: 'frameDefects' },
          { field: 'leafCondition', label: 'Leaf', defects: 'leafDefects' },
          { field: 'alignment', label: 'Alignment', defects: 'alignmentDefects' },
          { field: 'handlesSufficient', label: 'Handles', defects: 'handlesDefects' },
          { field: 'lockCondition', label: 'Lock', defects: 'lockDefects' },
          { field: 'signageSatisfactory', label: 'Signage', defects: 'signageDefects' },
          { field: 'hingesCondition', label: 'Hinges', defects: 'hingesDefects' },
          { field: 'thresholdSeal', label: 'Threshold', defects: 'thresholdDefects' },
          { field: 'combinedStripsCondition', label: 'Seals', defects: 'combinedStripsDefects' },
          { field: 'selfCloserFunctional', label: 'Closer', defects: 'selfCloserDefects' },
          { field: 'furnitureCondition', label: 'Furniture', defects: 'furnitureDefects' },
          { field: 'glazingSufficient', label: 'Glazing', defects: 'glazingDefects' }
        ];

        const failedComponents = conditionComponents
          .filter(comp => formData[comp.field] === 'No')
          .map(comp => ({
            label: comp.label,
            defects: formData[comp.defects] || []
          }));

        const naComponents = conditionComponents
          .filter(comp => formData[comp.field] === 'N/A')
          .map(comp => comp.label);

        const passedComponents = conditionComponents
          .filter(comp => formData[comp.field] === 'Yes')
          .map(comp => comp.label);

        return (
          <div className="section-summary">
            <div className="summary-group">
              {passedComponents.length > 0 && (
                <div className="summary-item">
                  <span className="summary-label">Pass</span>
                  <span className="summary-value">
                    {passedComponents.join(', ')}
                  </span>
                </div>
              )}
              {failedComponents.length > 0 && (
                <div className="summary-item">
                  <span className="summary-label">Fail</span>
                  <span className="summary-value">
                    {failedComponents.map(comp => comp.label).join(', ')}
                    <span className="status-indicator fail">FAIL</span>
                  </span>
                </div>
              )}
              {naComponents.length > 0 && (
                <div className="summary-item">
                  <span className="summary-label">N/A</span>
                  <span className="summary-value">
                    {naComponents.join(', ')}
                  </span>
                </div>
              )}
            </div>
            {failedComponents.length > 0 && failedComponents.some(c => c.defects?.length > 0) && (
              <div className="summary-group">
                <div className="summary-item" style={{ width: '100%' }}>
                  <span className="summary-label">Defects</span>
                  <div className="defect-tags">
                    {failedComponents
                      .filter(c => c.defects?.length > 0)
                      .map(c => c.defects.map((defect, i) => (
                        <span key={`${c.label}-${i}`} className="defect-tag">
                          {c.label}: {defect}
                        </span>
                      )))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'glazingAssessment':
        if (!shouldShowGlazingAssessment()) {
          return <div className="section-summary">No glazing on this door</div>;
        }
        
        const glazingStatus = formData.glazingSufficient === 'Yes' ? 'PASS' : 
                             formData.glazingSufficient === 'No' ? 'FAIL' : 
                             formData.glazingSufficient === 'N/A' ? 'N/A' : 'Not assessed';
        
        return (
          <div className="section-summary">
            <div className="summary-group">
              <div className="summary-item">
                <span className="summary-label">Status</span>
                <span className="summary-value">
                  {glazingStatus}
                  {formData.glazingSufficient && (
                    <span className={`status-indicator ${
                      formData.glazingSufficient === 'Yes' ? 'pass' : 
                      formData.glazingSufficient === 'No' ? 'fail' : 'na'
                    }`}>
                      {glazingStatus}
                    </span>
                  )}
                </span>
              </div>
              {formData.glazingSufficient === 'No' && formData.glazingDefects?.length > 0 && (
                <div className="summary-item">
                  <span className="summary-label">Defects</span>
                  <div className="defect-tags">
                    {formData.glazingDefects.map((defect, i) => (
                      <span key={i} className="defect-tag">{defect}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'finalAssessment':
        const actionRequired = formData.upgradeReplacement;
        const actionStatusClass = 
          actionRequired === 'None' || !actionRequired ? 'na' :
          actionRequired === 'Upgrade' ? 'warning' : 
          actionRequired === 'Replace Doorset' || actionRequired === 'Replace leaf' ? 'fail' : 'na';
        
        return (
          <div className="section-summary">
            <div className="summary-group">
              <div className="summary-item">
                <span className="summary-label">Action</span>
                <span className="summary-value">
                  {actionRequired || 'None required'}
                  {actionRequired && actionRequired !== 'None' && (
                    <span className={`status-indicator ${actionStatusClass}`}>
                      {actionRequired}
                    </span>
                  )}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Condition</span>
                <span className="summary-value">
                  {formData.overallCondition || 'Not assessed'}
                  {formData.isFlagged && (
                    <span className="status-indicator warning">FLAGGED</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Add word sets for the phrase builder
  const WORD_SETS = {
    initial: [
      'Next to',
      'Opposite',
      'Adjacent to',
      'Inside',
      'Outside',
      'Between',
      'Near',
      'At',
      'Leading into',
      'Close to',
      'In front of',
      'Behind'
    ],
    places: [
      'Flat',
      'Corridor',
      'Bedroom',
      'Stairs',
      'Lobby',
      'Kitchen',
      'Toilet',
      'Plant Room',
      'Cluster Entrance',
      'Lift',
      'Main Entrance',
      'Fire Exit',
      'Riser',
      'Electrical Riser',
      'Water Riser'
    ]
  };

  const [currentWordSet, setCurrentWordSet] = useState('initial');
  const [customWords, setCustomWords] = useState({ initial: [], places: [] });
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [newWord, setNewWord] = useState('');

  // Add this function at the top level of the component to manage tooltips
  const [activeTooltip, setActiveTooltip] = useState(null);
  
  const showTooltip = (text) => {
    setActiveTooltip(text);
    // Auto-hide tooltip after 3 seconds
    setTimeout(() => {
      setActiveTooltip(null);
    }, 3000);
  };

  // Help text constants for condition assessment (keep full phrases for later Excel export)
  const CONDITION_HELP_TEXT = {
    FRAME: "Frame Structural Condition Acceptable",
    LEAF: "Door Leaf Condition Acceptable",
    ALIGNMENT: "Door(s) Aligned Within Allowed Tolerance",
    HANDLES: "Handles Present and Acceptable",
    LOCK: "Locking Mechanism Functional and Secure",
    SIGNAGE: "Required Signage Present and Visible",
    HINGES: "Hinges Present, Secure, and Compliant",
    THRESHOLD: "Threshold Seal Installed and in Good Condition",
    SEALS: "Intumescent and Smoke Seals in Good Condition",
    CLOSER: "Self-Closing Device Functional",
    FURNITURE: "Additional Door Furniture Acceptable",
    GLAZING: "Glazing Sufficient"
  };

  const handleAddCustomWord = () => {
    if (newWord.trim()) {
      setCustomWords(prev => ({
        ...prev,
        [currentWordSet]: [...prev[currentWordSet], newWord.trim()]
      }));
      setNewWord('');
      setIsAddingWord(false);
    }
  };

  const handleLocationOption = (option) => {
    // If it's the '+' button, show input for new word
    if (option === '+') {
      setIsAddingWord(true);
      return;
    }
    
    let newLocation = formData.locationOfDoorSet;
    
    // Add space before the option if there's already text
    if (newLocation && !newLocation.endsWith(' ')) {
      newLocation += ' ';
    }
    
    // Add the option
    newLocation += option;
    
    // Add space after the option
    if (!newLocation.endsWith(' ')) {
      newLocation += ' ';
    }
    
    handleInputChange('locationOfDoorSet', newLocation);

    // After selecting from initial set, show places set
    if (currentWordSet === 'initial') {
      setCurrentWordSet('places');
      setIsAddingWord(false);
    }
  };

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/surveys`);
        const surveys = response.data;
        setAllSurveys(surveys);
        // Extract surveyed door numbers with their flag status
        const doorNumbers = surveys.map(survey => ({
          doorNumber: survey.doorNumber,
          isFlagged: survey.isFlagged || false
        }));
        setSurveyedDoorsList(doorNumbers);

        // Ensure a new form starts with empty fields (not pre-filled)
        setFormData(prevData => ({
          ...prevData,
          floor: '',
          room: '',
        }));
      } catch (error) {
        console.error('Error fetching surveys:', error);
        setError('Failed to fetch surveys');
      }
    };

    fetchSurveys();
  }, []);

  const validateField = (field, value, section = null) => {
    let error = '';
    const fieldValue = section ? value[field] : value;

    switch (field) {
      case 'rating':
        if (!fieldValue) {
          error = 'Fire Resistance Rating is required';
        }
        break;
      case 'doorType':
        if (!fieldValue) {
          error = 'Door Type is required';
        }
        break;
      case 'surveyed':
        if (!fieldValue) {
          error = 'Accessed field is required';
        }
        break;
      case 'selfCloserDefect':
        if (formData.selfCloserFunctional === 'No' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'selfCloserCustomDefect':
        if (formData.selfCloserFunctional === 'No' && formData.selfCloserDefect === 'custom' && !fieldValue?.trim()) {
          error = 'Please specify the custom defect';
        }
        break;
      case 'hingesDefect':
        if (formData.hingesCondition === 'No' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'hingesCustomDefect':
        if (formData.hingesCondition === 'No' && formData.hingesDefect === 'custom' && !fieldValue?.trim()) {
          error = 'Please specify the custom defect';
        }
        break;
      case 'glazingDefect':
        if (formData.glazingSufficient === 'No' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'glazingCustomDefect':
        if (formData.glazingSufficient === 'No' && formData.glazingDefect === 'custom' && !fieldValue?.trim()) {
          error = 'Please specify the custom defect';
        }
        break;
      case 'fanLightsDefect':
        if (formData.fanLightsSufficient === 'No' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'fanLightsCustomDefect':
        if (formData.fanLightsSufficient === 'No' && formData.fanLightsDefect === 'custom' && !fieldValue?.trim()) {
          error = 'Please specify the custom defect';
        }
        break;
      case 'frameDefect':
        if (formData.frameCondition === 'No' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'frameCustomDefect':
        if (formData.frameCondition === 'No' && formData.frameDefect === 'custom' && !fieldValue?.trim()) {
          error = 'Please specify the custom defect';
        }
        break;
      case 'handlesDefect':
        if (formData.handlesSufficient === 'No' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'handlesCustomDefect':
        if (formData.handlesSufficient === 'No' && formData.handlesDefect === 'custom' && !fieldValue?.trim()) {
          error = 'Please specify the custom defect';
        }
        break;
      case 'signageDefect':
        if (formData.signageSatisfactory === 'No' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'signageCustomDefect':
        if (formData.signageSatisfactory === 'No' && formData.signageDefect === 'custom' && !fieldValue?.trim()) {
          error = 'Please specify the custom defect';
        }
        break;
      case 'upgradeReplacement':
        if (!fieldValue) {
          error = 'Upgrade/Replacement field is required';
        }
        break;
      case 'overallCondition':
        if (!fieldValue) {
          error = 'Overall Condition is required';
        }
        break;
      default:
        // No validation required for other fields
        break;
    }

    return error;
  };

  const handleInputChange = (field, value, section = null) => {
    setError('');
    if (section === 'conditionDetails') {
      setFormData(prev => ({
        ...prev,
        conditionDetails: {
          ...prev.conditionDetails,
          [field]: value
        }
      }));
    } else if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    validateField(field, value, section);
  };

  const handleOptionClick = (field, value) => {
    // Create a copy of the current form data
    const updatedFormData = { ...formData };

    // Update the specific field
    updatedFormData[field] = value;

    // Special handling for condition fields that have defects
    if (field === 'leafCondition' || field === 'thresholdSeal' || 
        field === 'furnitureCondition' || field === 'alignment') {
      // If value is 'No', initialize empty defects array if it doesn't exist
      if (value === 'No') {
        const defectsField = `${field}Defects`;
        if (!updatedFormData[defectsField]) {
          updatedFormData[defectsField] = [];
        }
      }
    }

    // Update the form data state
    setFormData(updatedFormData);

    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };   

  const handleDrawingUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        drawing: file,
        drawingSkipped: false
      }));
    }
  };

  const handleSkipDrawing = () => {
    setFormData(prev => ({
      ...prev,
      drawing: null,
      drawingSkipped: true
    }));
  };

  // Update the handlePhotoUpload function
  const handlePhotoUpload = async (photoType, event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Create URL for preview
        const photoUrl = URL.createObjectURL(file);
        
        // Update form data with new photo
        setFormData(prev => ({
          ...prev,
          measurements: {
            ...(prev.measurements || {}),  // Ensure measurements object exists
            [`${photoType}Photo`]: file,
            [`${photoType}PhotoUrl`]: photoUrl
          }
        }));
        
        // Store in temp photos if needed
        if (!surveyId) {
          setTempPhotos(prev => ({ ...prev, [photoType]: file }));
          setUploadedPhotos(prev => ({ ...prev, [photoType]: true }));
        }
      } catch (error) {
        console.error('Error handling photo upload:', error);
        setError('Error uploading photo: ' + error.message);
      }
    }
  };

  // Keep the first handleRemovePhoto function (around line 1530)
  const handleRemovePhoto = (photoType) => {
    try {
      // Clear the photo from form data
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...(prev.measurements || {}),
          [`${photoType}Photo`]: null,
          [`${photoType}PhotoUrl`]: null
        }
      }));

      // Clear from temp photos if it exists
      if (tempPhotos[photoType]) {
        setTempPhotos(prev => {
          const newTempPhotos = { ...prev };
          delete newTempPhotos[photoType];
          return newTempPhotos;
        });
      }

      // Update uploaded photos state
      setUploadedPhotos(prev => ({
        ...prev,
        [photoType]: false
      }));

      // If there was a URL created, revoke it to prevent memory leaks
      if (formData.measurements?.[`${photoType}PhotoUrl`]) {
        URL.revokeObjectURL(formData.measurements[`${photoType}PhotoUrl`]);
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      setError('Error removing photo: ' + error.message);
    }
  };

  const uploadTempPhotos = async (newSurveyId) => {
    try {
      const uploadPromises = Object.entries(tempPhotos).map(([photoType, file]) => {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('photoType', photoType);
        return axios.post(`${API_BASE_URL}/api/surveys/${newSurveyId}/photos`, formData);
      });
      await Promise.all(uploadPromises);
      setTempPhotos({});
    } catch (error) {
      console.error('Error uploading temporary photos:', error);
      throw error;
    }
  };

  const handleLeafGapChange = (type, value, isStart) => {
    setFormData(prev => {
      const currentGap = prev.leafGap[type];
      let newStart = currentGap.start;
      let newEnd = currentGap.end;

      // Convert values to numbers for comparison
      const numValue = parseFloat(value);
      const numStart = parseFloat(currentGap.start);
      const numEnd = parseFloat(currentGap.end);

      if (isStart) {
        // If setting start value
        newStart = value;
        // If end is set and new start is greater than end, clear end
        if (newEnd && numValue > parseFloat(newEnd)) {
          newEnd = '';
        }
      } else {
        // If setting end value
        newEnd = value;
        // If start is set and new end is less than start, clear start
        if (newStart && numValue < parseFloat(newStart)) {
          newStart = '';
        }
      }

      return {
        ...prev,
        leafGap: {
          ...prev.leafGap,
          [type]: {
            start: newStart,
            end: newEnd
          }
        }
      };
    });
  };

  const handleHingeSidePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          hingeSidePhoto: file,
          hingeSidePhotoUrl: URL.createObjectURL(file)
        }
      }));
    }
  };

  const handleTopGapPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          topGapPhoto: file,
          topGapPhotoUrl: URL.createObjectURL(file)
        }
      }));
    }
  };

  const handleLeadingEdgePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          leadingEdgePhoto: file,
          leadingEdgePhotoUrl: URL.createObjectURL(file)
        }
      }));
    }
  };

  const handleSurveyedChange = (value) => {
    handleOptionClick('surveyed', value);
    
    // Clear reason if Yes is selected
    if (value === 'Yes') {
      setFormData(prev => ({
        ...prev,
        surveyedReason: '',
        surveyedCustomReason: ''
      }));
    }
  };

  const handleSurveyedReasonChange = (reason) => {
    setFormData(prev => ({
      ...prev,
      surveyedReason: reason,
      surveyedCustomReason: '' // Clear custom reason when selecting predefined reason
    }));
  };

  const handleSurveyedCustomReasonChange = (value) => {
    setFormData(prev => ({
      ...prev,
      surveyedReason: 'custom',
      surveyedCustomReason: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Add validation logic
    if (!formData.doorPinNo) errors.doorPinNo = 'Door Number is required';
    if (!formData.doorType) errors.doorType = 'Door Type is required';
    if (!formData.rating) errors.rating = 'Fire Rating is required';
    if (!formData.surveyed) errors.surveyed = 'Accessed field is required';
    if (!formData.upgradeReplacement) errors.upgradeReplacement = 'Upgrade/Replacement field is required';
    if (!formData.overallCondition) errors.overallCondition = 'Overall Condition is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Modify loadSurveyData to handle multi-defect format
  const loadSurveyData = async (doorNumber) => {
    try {
      console.log('Loading survey data for door:', doorNumber);
      // Instead of using a door-specific endpoint, get all surveys and filter locally
      console.log(`Fetching all surveys to find door number ${doorNumber}`);
      
      const response = await fetch('http://localhost:5001/api/surveys');
      
      if (!response.ok) {
        console.error(`API response not ok: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch surveys: ${response.status}`);
      }
      
      const allSurveys = await response.json();
      console.log(`Loaded ${allSurveys.length} surveys, searching for door #${doorNumber}`);

      // Find the survey with the matching door number
      const survey = allSurveys.find(s => 
        String(s.doorNumber) === String(doorNumber) || 
        parseInt(s.doorNumber) === parseInt(doorNumber)
      );

      if (survey && survey._id) {
        console.log('Found survey for door #' + doorNumber + ':', survey);
        console.log('CRITICAL FIELDS STATUS:');
        console.log('leafCondition:', survey.leafCondition);
        console.log('leafDefects:', survey.leafDefects);
        console.log('thresholdSeal:', survey.thresholdSeal);
        console.log('thresholdDefects:', survey.thresholdDefects);
        console.log('furnitureCondition:', survey.furnitureCondition);
        console.log('furnitureDefects:', survey.furnitureDefects);
        
        // Critical fields workaround: directly set these values to ensure they exist
        // If they're null/undefined but we have defects, set them to "No"
        // Otherwise, default to "Yes" which is the expected state for passing items
        if (survey.leafDefects && survey.leafDefects.length > 0) {
          survey.leafCondition = "No";
        } else if (survey.leafCondition === undefined || survey.leafCondition === null) {
          survey.leafCondition = "Yes";
        }
        
        if (survey.thresholdDefects && survey.thresholdDefects.length > 0) {
          survey.thresholdSeal = "No";
        } else if (survey.thresholdSeal === undefined || survey.thresholdSeal === null) {
          survey.thresholdSeal = "Yes";
        }
        
        if (survey.furnitureDefects && survey.furnitureDefects.length > 0) {
          survey.furnitureCondition = "No";
        } else if (survey.furnitureCondition === undefined || survey.furnitureCondition === null) {
          survey.furnitureCondition = "Yes";
        }
        
        setIsEditing(true);
        setSurveyId(survey._id);
        
        // Parse condition details
        let parsedConditionDetails = { leafGap: {}, thresholdGap: '', notes: '' };
        if (survey.conditionDetails) {
          try {
            if (typeof survey.conditionDetails === 'string') {
            parsedConditionDetails = JSON.parse(survey.conditionDetails);
            } else {
              parsedConditionDetails = survey.conditionDetails;
            }
            console.log('Parsed condition details:', parsedConditionDetails);
            
            // Extract defects from parsed condition details if they exist
            if (parsedConditionDetails.defects) {
              const defects = parsedConditionDetails.defects;
              console.log('Extracted defects from condition details:', defects);
              
              // Merge these defects into the survey object
              Object.keys(defects).forEach(key => {
                const defectsKey = `${key}Defects`;
                if (Array.isArray(defects[key])) {
                  survey[defectsKey] = defects[key];
                }
              });
            }
          } catch (e) {
            console.error('Error parsing condition details:', e);
          }
        }

        // Create a new object with the initial state first
        const newFormData = { ...initialFormState };
        
        // Now update it with the survey data
        Object.keys(survey).forEach(key => {
          // Skip the _id field and handle special cases separately
          if (key !== '_id' && key !== 'conditionDetails') {
            newFormData[key] = survey[key];
          }
        });

        // Make sure doorPinNo is a number
        newFormData.doorPinNo = parseInt(survey.doorNumber || doorNumber);
        
        // Ensure all condition assessment fields are explicitly set
        // This is important - we need to handle each field individually
        // If the condition field is empty but there are defects, set it to 'No'
        newFormData.frameCondition = survey.frameCondition || (survey.frameDefects?.length > 0 ? 'No' : '');
        newFormData.leafCondition = survey.leafCondition || (survey.leafDefects?.length > 0 ? 'No' : '');
        newFormData.alignment = survey.alignment || (survey.alignmentDefects?.length > 0 ? 'No' : '');
        newFormData.handlesSufficient = survey.handlesSufficient || (survey.handlesDefects?.length > 0 ? 'No' : '');
        newFormData.lockCondition = survey.lockCondition || (survey.lockDefects?.length > 0 ? 'No' : '');
        newFormData.signageSatisfactory = survey.signageSatisfactory || (survey.signageDefects?.length > 0 ? 'No' : '');
        newFormData.hingesCondition = survey.hingesCondition || (survey.hingesDefects?.length > 0 ? 'No' : '');
        newFormData.thresholdSeal = survey.thresholdSeal || (survey.thresholdDefects?.length > 0 ? 'No' : '');
        newFormData.combinedStripsCondition = survey.combinedStripsCondition || (survey.combinedStripsDefects?.length > 0 ? 'No' : '');
        newFormData.selfCloserFunctional = survey.selfCloserFunctional || (survey.selfCloserDefects?.length > 0 ? 'No' : '');
        newFormData.furnitureCondition = survey.furnitureCondition || (survey.furnitureDefects?.length > 0 ? 'No' : '');
        newFormData.glazingSufficient = survey.glazingSufficient || (survey.glazingDefects?.length > 0 ? 'No' : '');
        
        // Handle defects arrays properly - ensure they're always arrays
        newFormData.frameDefects = Array.isArray(survey.frameDefects) ? survey.frameDefects : [];
        newFormData.leafDefects = Array.isArray(survey.leafDefects) ? survey.leafDefects : [];
        newFormData.alignmentDefects = Array.isArray(survey.alignmentDefects) ? survey.alignmentDefects : [];
        newFormData.handlesDefects = Array.isArray(survey.handlesDefects) ? survey.handlesDefects : [];
        newFormData.lockDefects = Array.isArray(survey.lockDefects) ? survey.lockDefects : [];
        newFormData.signageDefects = Array.isArray(survey.signageDefects) ? survey.signageDefects : [];
        newFormData.hingesDefects = Array.isArray(survey.hingesDefects) ? survey.hingesDefects : [];
        newFormData.thresholdDefects = Array.isArray(survey.thresholdDefects) ? survey.thresholdDefects : [];
        newFormData.combinedStripsDefects = Array.isArray(survey.combinedStripsDefects) ? survey.combinedStripsDefects : [];
        newFormData.selfCloserDefects = Array.isArray(survey.selfCloserDefects) ? survey.selfCloserDefects : [];
        newFormData.furnitureDefects = Array.isArray(survey.furnitureDefects) ? survey.furnitureDefects : [];
        newFormData.glazingDefects = Array.isArray(survey.glazingDefects) ? survey.glazingDefects : [];
        
        // Set the condition details
        newFormData.conditionDetails = {
            leafGap: parsedConditionDetails.leafGap || {},
            thresholdGap: parsedConditionDetails.thresholdGap || '',
          notes: parsedConditionDetails.notes || ''
        };
        
        // Ensure door configuration fields are properly set
        newFormData.doorConfiguration = survey.doorConfiguration || {
            type: '',
            hasFanLight: false,
            hasSidePanels: false,
            hasVPPanel: false
        };
        
        // Ensure other required fields are set
        newFormData.rating = survey.rating || 'FD30s';
        newFormData.overallCondition = survey.overallCondition || '';
        newFormData.upgradeReplacement = survey.upgradeReplacement || '';

        // Make an extra effort to preserve these fields that aren't loading correctly
        if (parsedConditionDetails.defects && parsedConditionDetails.defects.leaf) {
          if (parsedConditionDetails.defects.leaf.length > 0) {
            newFormData.leafCondition = 'No';
            newFormData.leafDefects = parsedConditionDetails.defects.leaf;
          } else if (survey.leafCondition) {
            newFormData.leafCondition = survey.leafCondition;
          }
        }
        
        if (parsedConditionDetails.defects && parsedConditionDetails.defects.threshold) {
          if (parsedConditionDetails.defects.threshold.length > 0) {
            newFormData.thresholdSeal = 'No';
            newFormData.thresholdDefects = parsedConditionDetails.defects.threshold;
          } else if (survey.thresholdSeal) {
            newFormData.thresholdSeal = survey.thresholdSeal;
          }
        }
        
        if (parsedConditionDetails.defects && parsedConditionDetails.defects.furniture) {
          if (parsedConditionDetails.defects.furniture.length > 0) {
            newFormData.furnitureCondition = 'No';
            newFormData.furnitureDefects = parsedConditionDetails.defects.furniture;
          } else if (survey.furnitureCondition) {
            newFormData.furnitureCondition = survey.furnitureCondition;
          }
        }
        
        // Double check manually to make sure we have the condition assessment fields
        if (!newFormData.leafCondition && survey.leafCondition) {
          newFormData.leafCondition = survey.leafCondition;
        }
        if (!newFormData.thresholdSeal && survey.thresholdSeal) {
          newFormData.thresholdSeal = survey.thresholdSeal;
        }
        if (!newFormData.furnitureCondition && survey.furnitureCondition) {
          newFormData.furnitureCondition = survey.furnitureCondition;
        }

        console.log('Final form data after processing:', {
          leafCondition: newFormData.leafCondition,
          leafDefects: newFormData.leafDefects,
          thresholdSeal: newFormData.thresholdSeal,
          thresholdDefects: newFormData.thresholdDefects,
          furnitureCondition: newFormData.furnitureCondition,
          furnitureDefects: newFormData.furnitureDefects
        });
        
        // Check localStorage for fallback condition data
        const fallbackData = localStorage.getItem(`door-${doorNumber}-condition`);
        if (fallbackData) {
          try {
            const parsedFallback = JSON.parse(fallbackData);
            // Only use fallback for undefined/null fields
            if (newFormData.leafCondition === undefined || newFormData.leafCondition === null) {
              newFormData.leafCondition = parsedFallback.leafCondition;
              console.log('Applied leafCondition fallback:', parsedFallback.leafCondition);
            }
            if (newFormData.thresholdSeal === undefined || newFormData.thresholdSeal === null) {
              newFormData.thresholdSeal = parsedFallback.thresholdSeal;
              console.log('Applied thresholdSeal fallback:', parsedFallback.thresholdSeal);
            }
            if (newFormData.furnitureCondition === undefined || newFormData.furnitureCondition === null) {
              newFormData.furnitureCondition = parsedFallback.furnitureCondition;
              console.log('Applied furnitureCondition fallback:', parsedFallback.furnitureCondition);
            }
            // Add this new block for alignment
            if (newFormData.alignment === undefined || newFormData.alignment === null) {
              newFormData.alignment = parsedFallback.alignment;
              console.log('Applied alignment fallback:', parsedFallback.alignment);
            }
          } catch (e) {
            console.error('Error parsing fallback data:', e);
          }
        }
        
        setFormData(newFormData);
      } else {
        console.log(`No survey found for door #${doorNumber}, creating new survey.`);
        // Reset form for new survey
        setIsEditing(false);
        setSurveyId(null);
        setFormData({
          ...initialFormState,
          doorPinNo: doorNumber
        });
      }
    } catch (error) {
      console.error('Error loading survey:', error);
      setError('Failed to load survey data');
      // When there's an error, reset to a clean state
      setIsEditing(false);
      setSurveyId(null);
      setFormData({
        ...initialFormState,
        doorPinNo: doorNumber
      });
    }
  };

  const handleDoorChange = async (doorNumber) => {
    if (doorNumber < 1) return;
    await loadSurveyData(doorNumber);
    setCurrentDoor(doorNumber);
  };

  const resetForm = () => {
    // Store current door number
    const currentDoorNumber = formData.doorPinNo;

    const resetData = {
      doorPinNo: currentDoorNumber,
      floor: '',  // Ensure this is empty for new surveys
      room: '',   // Ensure this is empty for new surveys
      locationOfDoorSet: '',
      doorType: '',
      doorConfiguration: {
        type: '',
        hasFanLight: false,
        hasSidePanels: false
      },
      doorMaterial: {
        type: '',
        customType: ''
      },
      rating: 'FD30s',
      thirdPartyCertification: {
        type: '',
        customText: '',
        photo: null,
        photoUrl: null
      },
      surveyed: '',
      surveyedReason: '',
      surveyedCustomReason: '',
      isFlagged: false,
      leafGap: {
        hingeSide: '',
        topGap: '',
        leadingEdge: '',
        thresholdGap: ''
      },
      thresholdGap: '',
      showExtendedThresholdGap: false,
      measurements: {
        hingeSidePhoto: null,
        hingeSidePhotoUrl: null,
        topGapPhoto: null,
        topGapPhotoUrl: null,
        leadingEdgePhoto: null,
        leadingEdgePhotoUrl: null,
        thresholdGapPhoto: null,
        thresholdGapPhotoUrl: null,
        leafThicknessPhoto: null,
        leafThicknessPhotoUrl: null
      },
      leafThickness: '',
      combinedStripsCondition: '',
      combinedStripsDefect: '',
      selfCloserFunctional: '',
      selfCloserDefect: '',
      selfCloserCustomDefect: '',
      hingesCondition: '',
      hingesDefect: '',
      hingesCustomDefect: '',
      frameCondition: '',
      frameDefect: '',
      frameCustomDefect: '',
      handlesSufficient: '',
      handlesDefect: '',
      handlesCustomDefect: '',
      signageSatisfactory: '',
      signageDefect: '',
      signageCustomDefect: '',
      doorGuardWorking: '',
      glazingSufficient: '',
      glazingDefect: '',
      glazingCustomDefect: '',
      glazingBeading: '',
      glazing30Minutes: '',
      fanLightsSufficient: '',
      fanLightsDefect: '',
      fanLightsCustomDefect: '',
      headerPanelsSufficient: '',
      upgradeReplacement: '',
      overallCondition: '',
      addDetail: '',
      conditionDetails: {
        leafGap: '',
        thresholdGap: '',
        notes: ''  // Ensure notes are reset
      },
      customSection: {
        label: '',
        value: '',
        defect: '',
        customDefect: '',
        componentName: '',
        description: ''
      },
      defectPhotos: {
        frame: null,
        handles: null,
        signage: null,
        selfCloser: null,
        hinges: null,
        glazing: null,
        fanLights: null,
        combinedStrips: null,
        customSection: null
      },
      combinedStripsPhoto: null,
      combinedStripsPhotoUrl: null,
      roomType: '',
      
      // New condition assessment fields 
      leafCondition: '',
      leafDefect: '',
      
      alignment: '',
      alignmentDefect: '',
      
      lockCondition: '',
      lockDefect: '',
      
      thresholdSeal: '',
      thresholdDefect: '',
      
      hingesCondition: '',
      hingesDefect: '',
      hingesCustomDefect: '',
      
      selfCloserFunctional: '',
      selfCloserDefect: '',
      selfCloserCustomDefect: '',
      
      furnitureCondition: '',
      furnitureDefect: '',
    };

    // Force a full clear of form data
    setFormData({...initialFormState, doorPinNo: currentDoorNumber});
    
    setIsEditing(false);
    setSurveyId(null);
    setUploadedPhotos(
      Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
    );
    setTempPhotos({});
    setValidationErrors({});
    setError('');
    setIsSurveySaved(false);

    // Make sure we have the selector components reset their internal state
    if (document.querySelector('.floor-selector input')) {
      document.querySelector('.floor-selector input').value = '';
    }
    
    return resetData;
  };

  // Add auto-backup functionality
  const autoBackupToExcel = async () => {
    try {
      // Get all surveys from IndexedDB
      const surveys = await getAllSurveysFromIndexedDB();
      
      // Generate Excel file with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const result = await saveSurveysToWorkbook(surveys, `fire_door_surveys_backup_${timestamp}.xlsx`);
      
      if (!result.success) {
        console.error('Failed to create backup:', result.error);
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  };

  // Modify saveSurveysToWorkbook to accept filename
  const saveSurveysToWorkbook = async (surveys, filename = 'fire_door_surveys.xlsx') => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fire Door Surveys');

      // Add columns
      worksheet.columns = [
        { header: 'Door/Pin No.', key: 'doorPinNo', width: 15 },
        { header: 'Floor', key: 'floor', width: 15 },
        { header: 'Room', key: 'room', width: 15 },
        { header: 'Location', key: 'locationOfDoorSet', width: 20 },
        { header: 'Door Type', key: 'doorType', width: 15 },
        { header: 'Door Material', key: 'doorMaterial', width: 20 },
        { header: 'Fire Rating', key: 'rating', width: 15 },
        { header: 'Third Party Certification', key: 'certification', width: 25 },
        { header: 'Surveyed', key: 'surveyed', width: 10 },
        { header: 'Flagged for Review', key: 'isFlagged', width: 15 }
      ];

      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add data and style flagged rows
      surveys.forEach((survey) => {
        const row = worksheet.addRow({
          doorPinNo: survey.doorPinNo,
          floor: survey.floor,
          room: survey.room,
          locationOfDoorSet: survey.locationOfDoorSet,
          doorType: survey.doorType,
          doorMaterial: getDoorMaterialDisplay(survey.doorMaterial),
          rating: survey.rating,
          certification: survey.thirdPartyCertification?.type || 'N/A',
          surveyed: survey.surveyed,
          isFlagged: survey.isFlagged ? 'Yes' : 'No'
        });

        if (survey.isFlagged) {
          row.eachCell(cell => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFE0E0' }  // Light red background
            };
          });
        }
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 10, 15);
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error generating Excel file:', error);
      return { success: false, error: error.message };
    }
  };

  // Modify handleSave function to include multiple defects
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('Saving survey...');
      
      // Store current values for quick select buttons
      const currentFloor = formData.floor;
      const currentRoom = formData.room;
      const currentDoorNumber = parseInt(formData.doorPinNo);

      // Create the survey object
      const surveyData = {
        doorPinNo: String(formData.doorPinNo || ''),
        floor: formData.floor || '',
        room: formData.room || '',
        locationOfDoorSet: formData.locationOfDoorSet || '',
        doorType: formData.doorType || '',
        doorMaterial: formData.doorMaterial || {},
        rating: formData.rating || '',
        thirdPartyCertification: formData.thirdPartyCertification || {},
        surveyed: formData.surveyed || false,
        isFlagged: formData.isFlagged || false,
        
        // Door Configuration
        doorConfiguration: formData.doorConfiguration || {},
        
        // Measurements
        leafThickness: formData.leafThickness || '',
        leafGap: formData.leafGap || {},
        
        // Condition Assessments
        frameCondition: formData.frameCondition || '',
        frameDefects: formData.frameDefects || [],
        leafCondition: formData.leafCondition || '',
        leafDefects: formData.leafDefects || [],
        alignment: formData.alignment || '',
        alignmentDefects: formData.alignmentDefects || [],
        handlesSufficient: formData.handlesSufficient || '',
        handlesDefects: formData.handlesDefects || [],
        lockCondition: formData.lockCondition || '',
        lockDefects: formData.lockDefects || [],
        signageSatisfactory: formData.signageSatisfactory || '',
        signageDefects: formData.signageDefects || [],
        hingesCondition: formData.hingesCondition || '',
        hingesDefects: formData.hingesDefects || [],
        thresholdSeal: formData.thresholdSeal || '',
        thresholdDefects: formData.thresholdDefects || [],
        combinedStripsCondition: formData.combinedStripsCondition || '',
        combinedStripsDefects: formData.combinedStripsDefects || [],
        closerCondition: formData.selfCloserFunctional || '',  // Map selfCloserFunctional to closerCondition
        closerDefects: formData.selfCloserDefects || [],  // Map selfCloserDefects to closerDefects
        furnitureCondition: formData.furnitureCondition || '',
        furnitureDefects: formData.furnitureDefects || [],
        glazingSufficient: formData.glazingSufficient || '',
        glazingDefects: formData.glazingDefects || [],
        
        // Final Assessment
        overallCondition: formData.overallCondition || '',
        upgradeReplacement: formData.upgradeReplacement || '',
        conditionDetails: formData.conditionDetails || {}
      };

      // Save to IndexedDB
      await saveSurvey(surveyData);
      console.log('Survey saved to IndexedDB:', surveyData);

      // Update surveyed doors list with the current door
      const doorInfo = {
        doorNumber: String(currentDoorNumber),
        isFlagged: Boolean(formData.isFlagged)
      };

      // Update the surveyed doors list, ensuring we don't have duplicates
      setSurveyedDoorsList(prev => {
        const filteredList = prev.filter(door => String(door.doorNumber) !== String(currentDoorNumber));
        const updatedList = [...filteredList, doorInfo];
        // Sort the list by door number
        return updatedList.sort((a, b) => parseInt(a.doorNumber) - parseInt(b.doorNumber));
      });

      // Show success message
      setError('Survey saved successfully!');

      // Reset form for new survey
      const nextDoorNumber = currentDoorNumber + 1;
      
      // Save previous values for quick select buttons
      setPreviousFloor(currentFloor);
      setPreviousRoom(currentRoom);
      
      // Reset form with initial state and new door number
      setFormData({
        ...initialFormState,
        doorPinNo: nextDoorNumber
      });
      
      // Reset other states
      setIsEditing(false);
      setSurveyId(null);
      setCurrentDoor(nextDoorNumber);
      setIsSurveySaved(true); // Set this to true to indicate successful save
      
      // Reset uploaded photos
      setUploadedPhotos(
        Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
      );
      setTempPhotos({});

      // Auto-download Excel file with all surveys
      try {
        const allSurveys = await getAllSurveys();
        if (allSurveys && allSurveys.length > 0) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `fire_door_surveys_${timestamp}.xlsx`;
          await exportToExcel(allSurveys, filename);
          console.log('Auto-downloaded Excel file:', filename);
        }
      } catch (exportError) {
        console.error('Error auto-downloading Excel:', exportError);
      }

      // Update allSurveys state to reflect the new save
      const updatedSurveys = await getAllSurveys();
      setAllSurveys(updatedSurveys);

      // Scroll to top of the form
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } catch (error) {
      console.error('Error saving survey:', error);
      setError('Error saving survey: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const renderOption = (value, isSelected, onClick, key, options = {}) => {
    let className = 'option-button';
    let dataAttributes = {};
    
    // Add extra check for condition assessment fields (leafCondition, thresholdSeal, furnitureCondition)
    // This ensures the selection state is strictly compared
    if (key && (key.startsWith('leaf-') || key.startsWith('threshold-') || key.startsWith('furniture-'))) {
      console.log(`Rendering option for ${key} with value=${value}, isSelected=${isSelected}`);
      
      // We'll add a data attribute to help debug
      dataAttributes['data-field'] = key.split('-')[0];
      dataAttributes['data-value'] = value;
      dataAttributes['data-selected'] = isSelected ? 'true' : 'false';
    }
    
    if (options.rangeInfo) {
      const { start, end, currentValue } = options.rangeInfo;
      const numValue = parseFloat(currentValue);
      const numStart = parseFloat(start);
      const numEnd = parseFloat(end);

      if (currentValue === start) {
        className += ' selected';
        dataAttributes['data-range-start'] = 'true';
      } else if (currentValue === end) {
        className += ' selected';
      } else if (start && end && numValue > numStart && numValue < numEnd) {
        className += ' in-range';
      }
    } else if (isSelected) {
      className += ' selected';
    }

    return (
      <button
        key={key}
        type="button"
        className={className}
        onClick={onClick}
        disabled={options.disabled}
        {...dataAttributes}
      >
        {value}
      </button>
    );
  };

  // Helper function to get display text for door configuration
  const getDoorTypeDisplay = (doorConfig) => {
    if (!doorConfig) return '';
    
    let configText = doorConfig.type || '';
    
    if (doorConfig.hasVPPanel) configText += ' + VP Panel(s)';
    if (doorConfig.hasFanLight) configText += ' + Fan Light';
    if (doorConfig.hasSidePanels) configText += ' + Side Panel(s)';
    
    return configText;
  };

  // Helper function to get display text for door material
  const getDoorMaterialDisplay = (material) => {
    if (!material) return '';
    
    if (material.type === 'other' && material.customType) {
      return material.customType;
    }
    
    return material.type || '';
  };

  const handleDoorConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      doorConfiguration: {
        ...prev.doorConfiguration,
        [field]: value
      },
      doorType: field === 'type' ? value : prev.doorType
    }));
    setError('');
  };

  const handleDoorMaterialChange = (materialType) => {
    setFormData(prev => ({
      ...prev,
      doorMaterial: {
        ...prev.doorMaterial,
        type: materialType,
        customType: materialType === 'custom' ? prev.doorMaterial.customType : ''
      }
    }));
    setError('');
  };

  const handleCustomMaterialChange = (value) => {
    setFormData(prev => ({
      ...prev,
      doorMaterial: {
        ...prev.doorMaterial,
        type: 'custom',
        customType: value
      }
    }));
    setError('');
  };

  const renderFormGroup = (label, field, children, required = false) => (
    <div className={`form-group ${validationErrors[field] ? 'has-error' : ''}`}>
      <label>{label}{required && ' *'}</label>
      <div className="form-input">
      {children}
      {validationErrors[field] && (
          <span className="validation-error">{validationErrors[field]}</span>
      )}
      </div>
    </div>
  );

  const handleDefectPhotoUpload = (defectType, event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        defectPhotos: {
          ...prev.defectPhotos,
          [defectType]: {
            file,
            url: URL.createObjectURL(file)
          }
        }
      }));
    }
  };

  const renderDefectPhotoUpload = (defectType) => (
    <div className="defect-photo-upload">
      <input
        type="file"
        id={`${defectType}-photo`}
        accept="image/*"
        onChange={(e) => handleDefectPhotoUpload(defectType, e)}
        style={{ display: 'none' }}
        capture="environment"
      />
      <label htmlFor={`${defectType}-photo`} className="defect-photo-button">
        <span className="camera-icon">📸</span>
      </label>
      {formData.defectPhotos[defectType]?.url && (
        <div className="defect-photo-preview">
          <img 
            src={formData.defectPhotos[defectType].url} 
            alt={`${defectType} defect`} 
          />
          <button
            type="button"
            className="remove-defect-photo"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                defectPhotos: {
                  ...prev.defectPhotos,
                  [defectType]: null
                }
              }));
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );

  const handleViewExcel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys`);
      if (!response.ok) {
        throw new Error('Failed to fetch surveys');
      }
      const surveys = await response.json();
      
      const result = await saveSurveysToWorkbook(surveys);
      if (!result.success) {
        setError('Failed to generate Excel file: ' + result.error);
      }
    } catch (error) {
      console.error('Error viewing Excel:', error);
      setError('Failed to generate Excel file: ' + error.message);
    }
  };

  const handleClearSurveys = async () => {
    try {
      if (window.confirm('Are you sure you want to clear all surveys? This cannot be undone.')) {
        setIsSaving(true);
        setError('Clearing all surveys...');

        // Clear IndexedDB
        await clearAllSurveys();
        
        // Reset all states
        setSurveyedDoorsList([]);
        setAllSurveys([]);
        setCurrentDoor(1);
        setFormData({
          ...initialFormState,
          doorPinNo: '1'
        });
        
        // Reset other states
        setIsEditing(false);
        setSurveyId(null);
        setIsSurveySaved(false);
        setPreviousFloor('');
        setPreviousRoom('');
        
        // Reset uploaded photos
        setUploadedPhotos(
          Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
        );
        setTempPhotos({});

        // Create empty Excel file to overwrite the old one
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const filename = `fire_door_surveys_${timestamp}.xlsx`;
          await exportToExcel([], filename);
          console.log('Created empty Excel file:', filename);
        } catch (exportError) {
          console.error('Error creating empty Excel file:', exportError);
        }

        setError('All surveys cleared successfully!');
        setTimeout(() => {
          setError('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error clearing surveys:', error);
      setError('Error clearing surveys: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewSurveys = () => {
    try {
      const sortedSurveys = [...allSurveys].sort((a, b) => 
        parseInt(a.doorNumber) - parseInt(b.doorNumber)
      );

      const newWindow = window.open('');
      newWindow.document.write(`
        <html>
          <head>
            <title>Past Fire Door Inspections</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                margin: 0;
                background-color: #f5f5f5;
              }
              .container {
                max-width: 1200px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .header {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 2px solid #eee;
                display: flex;
                align-items: center;
                gap: 1rem;
              }
              .back-button {
                padding: 8px 16px;
                background: #34495e;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 14px;
              }
              .back-button:hover {
                background: #2c3e50;
              }
              h2 {
                margin: 0;
              }
              .read-only-notice {
                background-color: #e8f5e9;
                color: #2e7d32;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 20px;
                font-weight: 500;
              }
              table { 
                border-collapse: collapse; 
                width: 100%;
                margin-top: 20px;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 12px 8px;
                text-align: left;
              }
              th { 
                background-color: #f8f9fa;
                font-weight: 600;
              }
              tr:nth-child(even) {
                background-color: #f8f9fa;
              }
              tr:hover {
                background-color: #f2f2f2;
              }
              .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 4px;
              }
              .summary-item {
                text-align: center;
              }
              .summary-value {
                font-size: 24px;
                font-weight: bold;
                color: #2196F3;
              }
              .summary-label {
                color: #666;
                margin-top: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <button class="back-button" onclick="window.close()">← Back</button>
                <h2>Fire Door Inspection History</h2>
              </div>
              <div class="read-only-notice">
                ⓘ This is a read-only view of past inspections. To make changes, please use the Edit function in the main form.
            </div>
              
              <div class="summary">
                <div class="summary-item">
                  <div class="summary-value">${sortedSurveys.length}</div>
                  <div class="summary-label">Total Doors Surveyed</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${sortedSurveys.filter(s => s.surveyed === 'Yes').length}</div>
                  <div class="summary-label">Passed Inspection</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${sortedSurveys.filter(s => s.surveyed === 'No').length}</div>
                  <div class="summary-label">Failed Inspection</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${((sortedSurveys.filter(s => s.surveyed === 'Yes').length / sortedSurveys.length) * 100).toFixed(1)}%</div>
                  <div class="summary-label">Pass Rate</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Door Number</th>
                    <th>Location</th>
                    <th>Floor</th>
                    <th>Room</th>
                    <th>Door Type</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Condition</th>
                    <th>Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedSurveys.map(survey => `
                    <tr>
                      <td>${survey.doorNumber}</td>
                      <td>${survey.locationOfDoorSet || '-'}</td>
                      <td>${survey.floor || '-'}</td>
                      <td>${survey.room || '-'}</td>
                      <td>${survey.doorType || '-'}</td>
                      <td>${survey.rating || '-'}</td>
                      <td>${survey.surveyed === 'Yes' ? 'Pass' : 'Fail'}</td>
                      <td>${survey.overallCondition || '-'}</td>
                      <td>${survey.upgradeReplacement || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error displaying inspection history:', error);
      setError('Failed to display inspection history. Please try again.');
    }
  };

  const handleEditSurvey = async (doorNumber) => {
    await loadSurveyData(doorNumber);
  };

  const handleContinueSurvey = async () => {
    // If the current survey isn't saved, prompt to save
    if (!isSurveySaved) {
      const shouldSave = window.confirm('Do you want to save the current survey before continuing?');
      if (shouldSave) {
        try {
          await handleSave();
          return; // handleSave already sets up the next survey
        } catch (error) {
          console.error('Error saving survey:', error);
          return; // Don't continue if save fails
        }
      }
    }

    // Store current values for quick select buttons
    const currentFloor = formData.floor;
    const currentRoom = formData.room;

    // Calculate next door number
    const nextDoorNumber = currentDoor + 1;

    // Completely reset form with initial state
    setFormData({
      ...initialFormState,
      doorPinNo: nextDoorNumber
    });
    
    // Save previous values for quick select buttons
    setPreviousFloor(currentFloor);
    setPreviousRoom(currentRoom);
    
    // Reset states
    setIsEditing(false);
    setSurveyId(null);
    setCurrentDoor(nextDoorNumber);
    setIsSurveySaved(false);
    
    // Reset uploaded photos
    setUploadedPhotos(
      Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
    );
    setTempPhotos({});
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const handleThirdPartyCertificationChange = (type) => {
    setFormData(prev => ({
      ...prev,
      thirdPartyCertification: {
        ...prev.thirdPartyCertification,
        type,
        customText: type === 'custom' ? prev.thirdPartyCertification.customText : ''
      }
    }));
    setError('');
  };

  const handleCustomCertificationChange = (value) => {
    setFormData(prev => ({
      ...prev,
      thirdPartyCertification: {
        ...prev.thirdPartyCertification,
        type: 'custom',
        customText: value
      }
    }));
    setError('');
  };

  const handleCertificationPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        thirdPartyCertification: {
          ...prev.thirdPartyCertification,
          photo: file,
          photoUrl: URL.createObjectURL(file)
        }
      }));
    }
  };

  const handleToggleFlag = () => {
    setFormData(prev => ({
      ...prev,
      isFlagged: !prev.isFlagged
    }));
  };

  const handleFinalAssessmentChange = (value) => {
    setFormData(prevData => ({
      ...prevData,
      finalAssessment: value,
      upgradeReplacement: value, // Ensure upgradeReplacement is set
      // Reset measurements if not replacing door or leaf
      height: value === 'Replace Doorset' || value === 'Replace leaf' ? prevData.height : '',
      width: value === 'Replace Doorset' || value === 'Replace leaf' ? prevData.width : '',
      depth: value === 'Replace Doorset' || value === 'Replace leaf' ? prevData.depth : ''
    }));
    setShowMeasurements(value === 'Replace Doorset' || value === 'Replace leaf');
  };

  const handleRoomTypeSelect = (roomType) => {
    const currentRoom = formData.room;
    setFormData(prev => ({
      ...prev,
      room: roomType
    }));
    setPreviousRoom(currentRoom);
  };

  const handleQuickSelectThickness = (value) => {
    handleInputChange('leafThickness', value);
  };

 

  const handleGapComplete = (type) => {
    // Auto-scroll to next section
    const nextGapMap = {
      'hingeSide': 'topGap',
      'topGap': 'leadingEdge',
      'leadingEdge': 'thresholdGap',
      'thresholdGap': 'leafThickness'
    };
    
    const nextGap = nextGapMap[type];
    if (nextGap) {
      setExpandedGap(nextGap);
      // Add small delay to allow state to update
      setTimeout(() => {
        document.querySelector(`.gap-accordion[data-type="${nextGap}"]`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
    }
  };

  // Update the isGapCompliant function to handle undefined values
  const isGapCompliant = (gapData) => {
    // Return false if gapData is undefined or null
    if (!gapData) return false;
    // Return false if start or end are missing
    if (!gapData.start || !gapData.end) return false;
    
    // Implement compliance logic here
    return true; // For now, just return true if data exists
  };

  // Add a new helper function to check if glazing assessment should be shown
  const shouldShowGlazingAssessment = () => {
    return formData.doorConfiguration.hasVPPanel || 
           formData.doorConfiguration.hasFanLight || 
           formData.doorConfiguration.hasSidePanels;
  };

  const handleBackToPrepositions = () => {
    setCurrentWordSet('initial');
    setIsAddingWord(false);
  };

  // Add common location phrases
  const commonLocationPhrases = [
    'Next to Next to',
    'Next to Opposite',
    'Next to Next to Opposite',
    'Opposite Next to',
    'Between Next to',
    'Inside Next to',
    'Outside Next to',
    'Leading into Next to'
  ];

  // Add function to handle phrase selection
  const handlePhraseSelect = (phrase) => {
    setFormData(prev => ({
      ...prev,
      locationOfDoorSet: phrase
    }));
  };

  const handlePhotoUploads = async (surveyId) => {
    try {
      const uploadPromises = Object.entries(tempPhotos).map(([photoType, file]) => {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('photoType', photoType);
        return axios.post(`${API_BASE_URL}/api/surveys/${surveyId}/photos`, formData);
      });
      
      await Promise.all(uploadPromises);
      setTempPhotos({});
      return true;
    } catch (error) {
      console.error('Error uploading photos:', error);
      throw error;
    }
  };

  // Add error display component
  const ErrorDisplay = ({ error }) => {
    if (!error) return null;
    return <div className="error-message">{error}</div>;
  };

  // Add CSS styles after the existing styles
  const styles = document.createElement('style');
  styles.textContent = `
    .notes-field {
      border: 1px solid #2196F3;
      background-color: #f0f8ff;
    }
    
    .floor-selector {
      position: relative;
      width: 100%;
    }

    .floor-input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .floor-input-container input {
      width: 100%;
      padding-right: 30px;
    }

    .dropdown-toggle {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #666;
    }

    .floor-options {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ccc;
      border-top: none;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .floor-option {
      padding: 8px 12px;
      cursor: pointer;
    }

    .floor-option:hover {
      background-color: #f5f5f5;
    }

    .floor-option.selected {
      background-color: #e6e6e6;
    }

    .additional-options .option-button {
      padding: 10px 20px;
      margin: 4px;
      border: 2px solid #e0e0e0;
      border-radius: 25px;
      background: #f8f9fa;
      color: #666;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95em;
      position: relative;
      overflow: hidden;
    }

    .additional-options .option-button:hover {
      background: #f0f0f0;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .additional-options .option-button.selected {
      background: linear-gradient(45deg, #2196F3, #1976D2);
      color: white;
      border-color: #1565C0;
      transform: translateY(0);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }

    .additional-options .option-button:active {
      transform: translateY(1px);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    /* Keep original styling for door type buttons but make them more distinct */
    .door-type-options .option-button {
      padding: 8px 16px;
      margin: 4px;
      border: 1px solid #007bff;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      color: #007bff;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .door-type-options .option-button:hover {
      background: #f8f9fa;
    }

    .door-type-options .option-button.selected {
      background: #007bff;
      color: white;
    }

    /* Add separation between button groups */
    .door-config-section .options-group {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
    }

    .door-config-section .additional-options {
      padding-top: 8px;
    }
  `;
  document.head.appendChild(styles);

  // Add useEffect to handle reset of selectors
  useEffect(() => {
    // Reset floor and room selectors when formData changes
    if (!formData.floor && !formData.room) {
      // Force a DOM update for select fields
      setTimeout(() => {
        const floorInput = document.querySelector('.floor-selector input');
        if (floorInput) {
          floorInput.value = '';
        }
        
        const roomInput = document.querySelector('.room-type-selector .main-input');
        if (roomInput) {
          roomInput.value = '';
        }
      }, 0);
    }
  }, [formData]);

  // Add this new component after the CustomSelect component
  const SuggestiveDropdown = ({ value, onChange, options, placeholder }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [filteredOptions, setFilteredOptions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    useEffect(() => {
      if (value) {
        setInputValue(value);
      }
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
            inputRef.current && !inputRef.current.contains(event.target)) {
          setShowSuggestions(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleInputChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      
      // Filter options when at least 3 characters are typed
      if (newValue.length >= 3) {
        const filtered = options.filter(option => 
          option.label.toLowerCase().includes(newValue.toLowerCase())
        );
        setFilteredOptions(filtered);
        setShowSuggestions(true);
      } else {
        setFilteredOptions([]);
        setShowSuggestions(false);
      }
    };

    const handleInputBlur = () => {
      // Small delay to allow clicking on suggestions
      setTimeout(() => {
        if (inputValue.trim() !== '') {
          onChange(inputValue);
        }
      }, 200);
    };

    const handleSuggestionClick = (suggestion) => {
      setInputValue(suggestion.label);
      onChange(suggestion.value);
      setShowSuggestions(false);
    };

    const handleInputFocus = () => {
      if (inputValue.length >= 3) {
        const filtered = options.filter(option => 
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
        setFilteredOptions(filtered);
        setShowSuggestions(true);
      }
    };

    return (
      <div className="suggestive-dropdown">
        <input
          ref={inputRef}
          type="text"
          className="select-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          placeholder={placeholder || "Type at least 3 letters to see suggestions..."}
        />
        {showSuggestions && filteredOptions.length > 0 && (
          <div className="suggestions-container" ref={suggestionsRef}>
            {filteredOptions.map((option) => (
              <div 
                key={option.value} 
                className="suggestion-item"
                onClick={() => handleSuggestionClick(option)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Fix linter error and change CSS declaration in the addStyling function
  const addStyling = () => {
    const styles = document.createElement('style');
    styles.textContent = `
      /* Existing styles... */
      
      /* Tooltip Popup */
      .tooltip-popup {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(59, 59, 59, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 1000;
        max-width: 80%;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        animation: fadeInOut 3s ease-in-out;
      }
      
      @keyframes fadeInOut {
        0% { opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { opacity: 0; }
      }
      
      /* Styles for the suggestive dropdown */
      .suggestive-dropdown {
        position: relative;
        width: 100%;
      }
      
      .suggestions-container {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        max-height: 200px;
        overflow-y: auto;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        z-index: 10;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
      }
      
      .suggestion-item {
        padding: 8px 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .suggestion-item:hover {
        background-color: #f5f5f5;
      }
      
      /* Enhanced styles for condition assessment */
      .condition-assessment {
        background-color: #f8f9fa;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .condition-assessment h3 {
        margin-bottom: 15px;
        color: #2c3e50;
      }
      
      .condition-assessment .assessment-item {
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e6e6e6;
      }
      
      .condition-assessment .assessment-item:last-child {
        border-bottom: none;
        margin-bottom: 5px;
      }
      
      .assessment-label {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      
      .assessment-label label {
        margin-bottom: 0;
        margin-right: 8px;
      }
      
      .help-button {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #e9ecef;
        border: none;
        color: #495057;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .help-button:hover {
        background-color: #dee2e6;
        transform: scale(1.1);
      }
      
      .help-button:active {
        transform: scale(0.95);
      }
      
      .condition-assessment .options-group {
        display: flex;
        gap: 10px;
        margin-bottom: 12px;
      }
      
      .condition-assessment .option-button {
        min-width: 70px;
        padding: 8px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        background: white;
        color: #666;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .condition-assessment .option-button:hover {
        border-color: #007bff;
        color: #007bff;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .condition-assessment .option-button.selected {
        background: #007bff;
        color: white;
        border-color: #0056b3;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
      }
      
      .condition-assessment .option-button:active {
        transform: translateY(1px);
      }
      
      .condition-assessment .defect-input-section {
        margin-top: 10px;
        padding: 15px;
        background: white;
        border-radius: 6px;
        border-left: 3px solid #007bff;
        box-shadow: 0 1px 2px rgba(0,0,0,0.08);
      }
      
      /* Enhanced styles for condition assessment header */
      .condition-assessment .assessment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #dee2e6;
      }
      
      .condition-assessment .assessment-header h3 {
        margin: 0;
        padding: 0;
        border-bottom: none;
      }
      
      .condition-assessment .assessment-helper {
        color: #6c757d;
        font-style: italic;
        font-size: 0.9em;
      }
      
      /* Tag Input Styles */
      .tag-input-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        margin-bottom: 8px;
        position: relative;
      }
      
      .input-wrapper {
        display: flex;
        width: 100%;
        border: 1px solid #ced4da;
        border-radius: 4px;
        padding: 5px;
        background-color: #fff;
        margin-bottom: 8px;
      }
      
      .tag-input {
        width: 100%;
        border: none;
        outline: none;
        padding: 5px;
        font-size: 0.95rem;
        background-color: transparent;
      }
      
      .tags-area {
        display: flex;
        flex-direction: column;
        width: 100%;
        gap: 5px;
        margin-bottom: 8px;
      }
      
      .tag {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #e1f5fe;
        color: #0277bd;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 0.9rem;
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }
      
      .tag:hover {
        background-color: #b3e5fc;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      .tag-text {
        flex: 1;
      }
      
      .remove-tag {
        background: none;
        border: none;
        color: #0277bd;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 0 0 0 8px;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
      }
      
      .remove-tag:hover {
        opacity: 1;
      }
      
      .suggestions-dropdown {
        position: absolute;
        max-height: 200px;
        overflow-y: auto;
        background-color: white;
        border: 1px solid #ced4da;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        width: 100%;
        margin-top: -1px;
        top: 40px;
      }
      
      .suggestion-item {
        padding: 8px 12px;
        cursor: pointer;
      }
      
      .suggestion-item:hover {
        background-color: #f5f5f5;
      }
      
      .quick-defects {
        margin-top: 4px;
        margin-bottom: 12px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }
      
      .quick-defects-label {
        font-size: 0.85rem;
        color: #666;
        margin-right: 5px;
      }
      
      .quick-defects-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      
      .quick-defect-button {
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 16px;
        padding: 3px 10px;
        font-size: 0.8rem;
        color: #555;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .quick-defect-button:hover {
        background-color: #e0e0e0;
        color: #333;
      }
      
      /* Make sure defect header has proper styling */
      .defect-header {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      
      .defect-photo-upload {
        flex-shrink: 0;
        margin-bottom: 8px;
      }
    `;
    document.head.appendChild(styles);
  };

  // Add this useEffect to call the addStyling function
  useEffect(() => {
    addStyling();
  }, []);

  // Add this function to handle adding a defect to a multi-defect array
  const handleAddDefect = (category, defect) => {
    setFormData(prev => {
      // Convert single defect to multi-defect format if needed
      let existingDefects = prev[`${category}Defects`] || [];
      
      // Make sure we're not adding duplicates
      if (!existingDefects.includes(defect)) {
        return {
          ...prev,
          [`${category}Defects`]: [...existingDefects, defect]
        };
      }
      return prev;
    });
  };

  // Add this function to handle removing a defect from a multi-defect array
  const handleRemoveDefect = (category, defect) => {
    setFormData(prev => {
      const existingDefects = prev[`${category}Defects`] || [];
      
      return {
        ...prev,
        [`${category}Defects`]: existingDefects.filter(d => d !== defect)
      };
    });
  };

  // Get the frame defect options
  const getDefectOptions = (category) => {
    const options = {
      frame: [
        { value: 'Split Frame', label: 'Split Frame' },
        { value: 'Loose Frame', label: 'Loose Frame' },
        { value: 'Excessive Damage / Cracking', label: 'Excessive Damage / Cracking' },
        { value: 'Rotten Timber / Decay', label: 'Rotten Timber / Decay' },
        { value: 'Warped / Bowed Frame', label: 'Warped / Bowed Frame' },
        { value: 'Frame Not Securely Fixed', label: 'Frame Not Securely Fixed' },
        { value: 'Hinges Pulling from Frame', label: 'Hinges Pulling from Frame' },
        { value: 'Incompatible Frame Material', label: 'Incompatible Frame Material' },
        { value: 'Frame Swollen (moisture-related)', label: 'Frame Swollen (moisture-related)' },
        { value: 'Impact Damage', label: 'Impact Damage' },
        { value: 'Previous Poor Repairs', label: 'Previous Poor Repairs' },
        { value: 'Corroded Metal Frame', label: 'Corroded Metal Frame' },
        { value: 'Frame Undercut or Trimmed Incorrectly', label: 'Frame Undercut or Trimmed Incorrectly' }
      ],
      // Add other categories as needed
    };
    
    return options[category] || [];
  };

  // Add this function near other handlers
  const handleCustomRatingChange = (value) => {
    setFormData(prev => ({
      ...prev,
      rating: value,
      isCustomRating: true
    }));
  };

  // Add this function to handle quick-select of previous custom rating
  const handleQuickSelectPreviousRating = () => {
    if (previousCustomRating) {
      setFormData(prev => ({
        ...prev,
        rating: previousCustomRating,
        isCustomRating: true
      }));
    }
  };

  // Add this effect to store the previous custom rating when saving
  useEffect(() => {
    if (formData.isCustomRating && formData.rating) {
      setPreviousCustomRating(formData.rating);
    }
  }, [isSurveySaved]);

  useEffect(() => {
    // Add a small delay to let the DOM render first
    const timeoutId = setTimeout(() => {
      // Check the logs for undefined/null fields and fix them reactively
      if ((formData.leafCondition === undefined || formData.leafCondition === null) && 
          document.querySelector('[data-field="leaf"][data-selected="true"]')) {
        const selectedValue = document.querySelector('[data-field="leaf"][data-selected="true"]').getAttribute('data-value');
        console.log('Fixing leafCondition to:', selectedValue);
        setFormData(prev => ({ ...prev, leafCondition: selectedValue }));
      }
      
      if ((formData.thresholdSeal === undefined || formData.thresholdSeal === null) && 
          document.querySelector('[data-field="threshold"][data-selected="true"]')) {
        const selectedValue = document.querySelector('[data-field="threshold"][data-selected="true"]').getAttribute('data-value');
        console.log('Fixing thresholdSeal to:', selectedValue);
        setFormData(prev => ({ ...prev, thresholdSeal: selectedValue }));
      }
      
      if ((formData.furnitureCondition === undefined || formData.furnitureCondition === null) && 
          document.querySelector('[data-field="furniture"][data-selected="true"]')) {
        const selectedValue = document.querySelector('[data-field="furniture"][data-selected="true"]').getAttribute('data-value');
        console.log('Fixing furnitureCondition to:', selectedValue);
        setFormData(prev => ({ ...prev, furnitureCondition: selectedValue }));
      }
      
      // Add this new block to handle alignment
      if ((formData.alignment === undefined || formData.alignment === null) && 
          document.querySelector('[data-field="alignment"][data-selected="true"]')) {
        const selectedValue = document.querySelector('[data-field="alignment"][data-selected="true"]').getAttribute('data-value');
        console.log('Fixing alignment to:', selectedValue);
        setFormData(prev => ({ ...prev, alignment: selectedValue }));
      }
    }, 500); // 500ms delay to ensure DOM is updated

    return () => clearTimeout(timeoutId);
  }, [formData.leafCondition, formData.thresholdSeal, formData.furnitureCondition, formData.alignment]);

  // Add this after the other useEffect hooks
  useEffect(() => {
    // Persist critical condition fields to localStorage as fallback
    const criticalFields = {
      doorPinNo: formData.doorPinNo,
      leafCondition: formData.leafCondition,
      thresholdSeal: formData.thresholdSeal,
      furnitureCondition: formData.furnitureCondition,
      alignment: formData.alignment // Add this line
    };
    
    // Only save if at least one is defined
    if (formData.leafCondition || formData.thresholdSeal || formData.furnitureCondition || formData.alignment) {
      localStorage.setItem(`door-${formData.doorPinNo}-condition`, JSON.stringify(criticalFields));
    }
  }, [formData.leafCondition, formData.thresholdSeal, formData.furnitureCondition, formData.alignment, formData.doorPinNo]);

  // Add this function inside the FireDoorSurveyForm component
  const handleExportToExcel = async () => {
    try {
      setError('Preparing to export surveys...');
      
      // Get all surveys from IndexedDB
      const surveys = await getAllSurveys();
      console.log('Retrieved surveys for export:', surveys);
      
      if (!surveys || surveys.length === 0) {
        setError('No surveys found to export');
        return;
      }

      // Process surveys to ensure all required fields exist
      const processedSurveys = surveys.map(survey => ({
        doorPinNo: survey.doorPinNo || '',
        floor: survey.floor || '',
        room: survey.room || '',
        locationOfDoorSet: survey.locationOfDoorSet || '',
        doorType: survey.doorType || '',
        doorMaterial: survey.doorMaterial?.type || '',
        rating: survey.rating || '',
        thirdPartyCertification: survey.thirdPartyCertification?.type || '',
        surveyed: survey.surveyed ? 'Yes' : 'No',
        isFlagged: survey.isFlagged ? 'Yes' : 'No',
        
        // Door Configuration
        doorConfiguration: survey.doorConfiguration?.type || '',
        fanLight: survey.doorConfiguration?.hasFanLight ? 'Yes' : 'No',
        sidePanels: survey.doorConfiguration?.hasSidePanels ? 'Yes' : 'No',
        vpPanel: survey.doorConfiguration?.hasVPPanel ? 'Yes' : 'No',
        
        // Measurements
        leafThickness: survey.leafThickness || '',
        hingeSideGap: `${survey.leafGap?.hingeSide?.start || ''}-${survey.leafGap?.hingeSide?.end || ''}`,
        topGap: `${survey.leafGap?.topGap?.start || ''}-${survey.leafGap?.topGap?.end || ''}`,
        leadingEdge: `${survey.leafGap?.leadingEdge?.start || ''}-${survey.leafGap?.leadingEdge?.end || ''}`,
        thresholdGap: `${survey.leafGap?.thresholdGap?.start || ''}-${survey.leafGap?.thresholdGap?.end || ''}`,
        
        // Condition Assessments
        frameCondition: survey.frameCondition || 'Not Assessed',
        frameDefects: Array.isArray(survey.frameDefects) ? survey.frameDefects.join(', ') : '',
        
        leafCondition: survey.leafCondition || 'Not Assessed',
        leafDefects: Array.isArray(survey.leafDefects) ? survey.leafDefects.join(', ') : '',
        
        alignment: survey.alignment || 'Not Assessed',
        alignmentDefects: Array.isArray(survey.alignmentDefects) ? survey.alignmentDefects.join(', ') : '',
        
        handlesSufficient: survey.handlesSufficient || 'Not Assessed',
        handlesDefects: Array.isArray(survey.handlesDefects) ? survey.handlesDefects.join(', ') : '',
        
        lockCondition: survey.lockCondition || 'Not Assessed',
        lockDefects: Array.isArray(survey.lockDefects) ? survey.lockDefects.join(', ') : '',
        
        signageSatisfactory: survey.signageSatisfactory || 'Not Assessed',
        signageDefects: Array.isArray(survey.signageDefects) ? survey.signageDefects.join(', ') : '',
        
        hingesCondition: survey.hingesCondition || 'Not Assessed',
        hingesDefects: Array.isArray(survey.hingesDefects) ? survey.hingesDefects.join(', ') : '',
        
        thresholdSeal: survey.thresholdSeal || 'Not Assessed',
        thresholdDefects: Array.isArray(survey.thresholdDefects) ? survey.thresholdDefects.join(', ') : '',
        
        // Fix these fields to use the correct property names
        sealsCondition: survey.sealsCondition || survey.combinedStripsCondition || 'Not Assessed',
        sealsDefects: Array.isArray(survey.sealsDefects || survey.combinedStripsDefects) ? 
          (survey.sealsDefects || survey.combinedStripsDefects).join(', ') : '',
        
        closerCondition: survey.closerCondition || survey.selfCloserFunctional || 'Not Assessed',
        closerDefects: Array.isArray(survey.closerDefects || survey.selfCloserDefects) ? 
          (survey.closerDefects || survey.selfCloserDefects).join(', ') : '',
        
        furnitureCondition: survey.furnitureCondition || 'Not Assessed',
        furnitureDefects: Array.isArray(survey.furnitureDefects) ? survey.furnitureDefects.join(', ') : '',
        
        glazingCondition: survey.glazingCondition || survey.glazingSufficient || 'Not Assessed',
        glazingDefects: Array.isArray(survey.glazingDefects) ? survey.glazingDefects.join(', ') : '',
        
        // Final Assessment
        overallCondition: survey.overallCondition || '',
        upgradeReplacement: survey.upgradeReplacement || '',
        notes: survey.conditionDetails?.notes || ''
      }));

      console.log('Processed surveys for export:', processedSurveys);

      // Export to Excel
      await exportToExcel(processedSurveys);
      setError('Surveys exported successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Error exporting surveys to Excel: ' + error.message);
    }
  };

  return (
    <div className="fire-door-survey-form">
      <div className="form-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/')}>
            Back to Menu
                </button>
          <button 
            className="export-excel-button"
            onClick={handleExportToExcel}
            title="Export all surveys to Excel"
          >
            Export to Excel
          </button>
        </div>
              </div>
              
      <div className="clear-surveys-container">
              <button
          className="clear-button"
          onClick={handleClearSurveys}
          disabled={allSurveys.length === 0}
        >
          Clear All Surveys ({allSurveys.length})
              </button>
            </div>

      <SurveyTracker 
        totalSurveys={Math.max(...surveyedDoorsList.map(door => Number(door.doorNumber) || 0), currentDoor)}
        currentDoor={currentDoor}
        onDoorChange={handleDoorChange}
        surveyedDoorsList={surveyedDoorsList}
        onViewSurveys={handleViewSurveys}
        onEditSurvey={handleEditSurvey}
        onContinueSurvey={handleContinueSurvey}
        isFlagged={formData.isFlagged}
      />

      <div className="drawing-section">
        <h2>Drawing Upload</h2>
        <div className="drawing-upload-container">
          <button
            className="upload-button"
            onClick={() => document.getElementById('drawing-upload').click()}
          >
            Import Drawing
          </button>
                <input
                  type="file"
                  id="drawing-upload"
            accept="image/*"
                  onChange={handleDrawingUpload}
                  style={{ display: 'none' }}
                />
              <button
            className="skip-button"
                onClick={handleSkipDrawing}
              >
                Skip Drawing
              </button>
            </div>
        {formData.drawing && (
            <div className="drawing-status">
                <div className="drawing-preview">
              <span>Drawing uploaded: {formData.drawing.name}</span>
                  <button
                    className="remove-drawing-button"
                onClick={() => setFormData(prev => ({ ...prev, drawing: null }))}
                  >
                    Remove
                  </button>
                </div>
          </div>
        )}
        {formData.drawingSkipped && (
          <div className="drawing-status">
                <div className="drawing-skipped">
                  <span>Drawing upload skipped</span>
                  <button
                    className="change-drawing-button"
                onClick={() => setFormData(prev => ({ ...prev, drawingSkipped: false }))}
                  >
                    Change
                  </button>
                </div>
            </div>
          )}
        </div>

      <section className="form-section">
        <div className="number-input-group">
          <label>Door/Pin No.</label>
          <input
            type="number"
            value={formData.doorPinNo}
            onChange={(e) => handleInputChange('doorPinNo', e.target.value)}
            min="0"
            className="number-input"
          />
        </div>
      </section>

      <section className="form-section">
        <div className="section-header" onClick={() => toggleSection('basicInfo')}>
          <div className="section-header-content">
            <h3>Basic Information</h3>
            {!expandedSections.basicInfo && (
              <div className="section-summary">
                {getSectionSummary('basicInfo')}
              </div>
            )}
          </div>
          <span className="section-arrow">{expandedSections.basicInfo ? '▼' : '▶'}</span>
        </div>
        {expandedSections.basicInfo && (
          <div className="section-content">
            {/* Floor */}
            <div className="form-group">
              <label>Floor</label>
              <div className="floor-selection">
                <FloorSelector
                  value={formData.floor}
                  onChange={(value) => handleInputChange('floor', value)}
                  previousFloor={previousFloor}
                />
              </div>
            </div>

            {/* Room */}
            <div className="form-group">
              <label>Room *</label>
              <div>
                <RoomTypeSelector
                  value={formData.room}
                  onSelect={handleRoomTypeSelect}
                  initialValue={formData.room}
                  previousRoom={previousRoom}
                />
                {validationErrors.room && <span className="validation-error">{validationErrors.room}</span>}
              </div>
            </div>

            {/* Location of Door Set */}
            <div className="form-group">
              <label>Location of Door Set *</label>
              <div>
                <div className="location-prepositions">
                  {currentWordSet === 'places' && (
    <button
      type="button"
                      className="back-to-prepositions"
                      onClick={handleBackToPrepositions}
    >
                      ← Back
    </button>
                  )}
                  <div className="preposition-row">
                    {[...WORD_SETS[currentWordSet], ...customWords[currentWordSet]].map((word, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`preposition-button ${formData.locationOfDoorSet.includes(word) ? 'selected' : ''}`}
                        onClick={() => handleLocationOption(word)}
                      >
                        {word}
                      </button>
                    ))}
                    {isAddingWord ? (
                      <div className="add-word-container">
                        <input
                          type="text"
                          className="add-word-input"
                          value={newWord}
                          onChange={(e) => setNewWord(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCustomWord();
                            }
                          }}
                          placeholder={`Add custom ${currentWordSet === 'initial' ? 'preposition' : 'place'}...`}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="add-word-confirm"
                          onClick={handleAddCustomWord}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          className="add-word-cancel"
                          onClick={() => {
                            setIsAddingWord(false);
                            setNewWord('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="preposition-button"
                        onClick={() => handleLocationOption('+')}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
                <div className="location-input">
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Enter location..."
                    value={formData.locationOfDoorSet}
                    onChange={(e) => handleInputChange('locationOfDoorSet', e.target.value)}
                    required
                  />
                </div>
              </div>
              {validationErrors.locationOfDoorSet && (
                <span className="validation-error">{validationErrors.locationOfDoorSet}</span>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="form-section">
        <div className="section-header" onClick={() => toggleSection('doorSpecs')}>
          <div className="section-header-content">
            <h3>Door Specifications</h3>
            {!expandedSections.doorSpecs && (
              <div className="section-summary">
                {getSectionSummary('doorSpecs')}
              </div>
            )}
          </div>
          <span className="section-arrow">{expandedSections.doorSpecs ? '▼' : '▶'}</span>
        </div>
        {expandedSections.doorSpecs && (
          <div className="section-content">
            <div className="form-group">
              <label>Door Set Configuration *</label>
              <div className="door-config-section">
                <div className="options-group">
                  {['Single', 'Double', 'Leaf & half'].map(type => 
                    renderOption(
                      type,
                      formData.doorConfiguration.type === type,
                      () => handleDoorConfigChange('type', type),
                      `door-type-${type}`
                    )
                  )}
                </div>
                <div className="additional-options">
                  <button
                    type="button"
                    className={`option-button ${formData.doorConfiguration.hasVPPanel ? 'selected' : ''}`}
                    onClick={() => handleDoorConfigChange('hasVPPanel', !formData.doorConfiguration.hasVPPanel)}
                  >
                    + VP Panel(s)
                  </button>
                  <button
                    type="button"
                    className={`option-button ${formData.doorConfiguration.hasFanLight ? 'selected' : ''}`}
                    onClick={() => handleDoorConfigChange('hasFanLight', !formData.doorConfiguration.hasFanLight)}
                  >
                    + Fan Light
                  </button>
                  <button
                    type="button"
                    className={`option-button ${formData.doorConfiguration.hasSidePanels ? 'selected' : ''}`}
                    onClick={() => handleDoorConfigChange('hasSidePanels', !formData.doorConfiguration.hasSidePanels)}
                  >
                    + Side Panel(s)
                  </button>
                </div>
                {formData.doorConfiguration.type && (
                  <div className="door-config-display">
                    Selected Configuration: {getDoorTypeDisplay(formData.doorConfiguration)}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Door Set Material *</label>
              <div className="door-config-section">
                <div className="options-group">
                  {[
                    'Timber based',
                    'Composite',
                    'Steel',
                    'Timber leaf with steel frame'
                  ].map(type => 
                    renderOption(
                      type,
                      formData.doorMaterial.type === type,
                      () => handleDoorMaterialChange(type),
                      `door-material-${type}`
                    )
                  )}
                </div>
                <div className="additional-options">
                  <div className="custom-material-input">
                    <button
                      className={`option-button ${formData.doorMaterial.type === 'custom' ? 'selected' : ''}`}
                      onClick={() => handleDoorMaterialChange('custom')}
                    >
                      Other (specify)
                    </button>
                    {formData.doorMaterial.type === 'custom' && (
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Enter custom material"
                        value={formData.doorMaterial.customType || ''}
                        onChange={(e) => handleCustomMaterialChange(e.target.value)}
                      />
                    )}
                  </div>
                </div>
                {validationErrors.doorMaterial && (
                  <span className="validation-error">{validationErrors.doorMaterial}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Fire Rating *</label>
              <div className="options-group">
                {['Non-fire rated', 'Nominal', 'Notional', 'FD30', 'FD30s', 'FD60', 'FD60s'].map(rating => 
                  renderOption(
                    rating,
                    formData.rating === rating && !formData.isCustomRating,
                    () => {
                      handleOptionClick('rating', rating);
                      setFormData(prev => ({ ...prev, isCustomRating: false }));
                      // Automatically set certification to N/A for Nominal, Notional, or Non-fire rated
                      if (rating === 'Nominal' || rating === 'Notional' || rating === 'Non-fire rated') {
                        setFormData(prev => ({
                          ...prev,
                          rating: rating,
                          isCustomRating: false,
                          thirdPartyCertification: {
                            ...prev.thirdPartyCertification,
                            type: 'N/A',
                            customText: '',
                            photo: null,
                            photoUrl: null
                          }
                        }));
                      }
                    },
                    `rating-${rating}`
                  )
                )}
              </div>
              <div className="custom-rating-section">
                <div className="custom-rating-input">
                  <button
                    className={`option-button ${formData.isCustomRating ? 'selected' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, isCustomRating: true }))}
                  >
                    Other (specify)
                  </button>
                  {formData.isCustomRating && (
                    <div className="custom-rating-controls">
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Enter custom rating"
                        value={formData.rating || ''}
                        onChange={(e) => handleCustomRatingChange(e.target.value)}
                      />
                      {previousCustomRating && (
                        <button
                          type="button"
                          className="quick-select-previous"
                          onClick={handleQuickSelectPreviousRating}
                          title={`Use previous custom rating: ${previousCustomRating}`}
                        >
                          ↻ Use Previous ({previousCustomRating})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {validationErrors.rating && (
                <span className="validation-error">{validationErrors.rating}</span>
              )}
            </div>

            <div className="form-group">
              <label>Third Party Certification</label>
              <div className="certification-section">
                <div className="certification-dropdown">
                  <div className="options-group">
                    {[
                      'BM TRADA Q-Mark',
                      'Certifire',
                      'IFC',
                      'BWF-Certifire',
                      'Plug',
                      'Label',
                      'None visible',
                      'N/A'
                    ].map(type => 
                      renderOption(
                        type,
                        formData.thirdPartyCertification.type === type,
                        () => handleThirdPartyCertificationChange(type),
                        `certification-${type}`,
                        // Disable all options except N/A when Nominal, Notional, or Non-fire rated is selected
                        { disabled: (formData.rating === 'Nominal' || formData.rating === 'Notional' || formData.rating === 'Non-fire rated') && type !== 'N/A' }
                      )
                    )}
                  </div>
                  <div className="additional-options">
                    <div className="custom-certification-input">
                      <button
                        className={`option-button ${formData.thirdPartyCertification.type === 'custom' ? 'selected' : ''}`}
                        onClick={() => handleThirdPartyCertificationChange('custom')}
                        disabled={formData.rating === 'Nominal' || formData.rating === 'Notional' || formData.rating === 'Non-fire rated'}
                      >
                        Other (specify)
                      </button>
                      {formData.thirdPartyCertification.type === 'custom' && (
                        <input
                          type="text"
                          className="text-input"
                          placeholder="Enter certification type"
                          value={formData.thirdPartyCertification.customText || ''}
                          onChange={(e) => handleCustomCertificationChange(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="certification-photo">
      <input
        type="file"
                    id="certification-photo"
        accept="image/*"
                    onChange={handleCertificationPhotoUpload}
        style={{ display: 'none' }}
      />
                  <label
                    htmlFor="certification-photo"
                    className={`photo-upload-button ${!formData.thirdPartyCertification.type || formData.thirdPartyCertification.type === 'None visible' ? 'disabled' : ''}`}
                  >
                    📷
    </label>
                  {formData.thirdPartyCertification.photoUrl && (
                    <div className="photo-preview">
                      <img src={formData.thirdPartyCertification.photoUrl} alt="Certification" />
                      <button
                        className="remove-photo"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            thirdPartyCertification: {
                              ...prev.thirdPartyCertification,
                              photo: null,
                              photoUrl: null
                            }
                          }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Accessed *</label>
              <div className="options-group">
                {['Yes', 'No'].map(value => 
                  renderOption(value, formData.surveyed === value, () => handleSurveyedChange(value), `surveyed-${value}`)
                )}
              </div>
              {formData.surveyed === 'No' && (
                <div className="not-accessed-reason">
                  <div className="predefined-reasons">
                    {[
                      'Locked - No key available',
                      'Locked - No code available',
                      'Room occupied',
                      'Room in use',
                      'No access permitted'
                    ].map(reason => (
                      <button
                        key={reason}
                        type="button"
                        className={`reason-button ${formData.surveyedReason === reason ? 'selected' : ''}`}
                        onClick={() => handleSurveyedReasonChange(reason)}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <div className="custom-reason">
                    <input
                      type="text"
                      className="text-input"
                      placeholder="Or enter custom reason"
                      value={formData.surveyedCustomReason}
                      onChange={(e) => handleSurveyedCustomReasonChange(e.target.value)}
                    />
                </div>
              </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="form-section">
        <div className="section-header" onClick={() => toggleSection('measurements')}>
          <div className="section-header-content">
            <h3>Measurements</h3>
            {!expandedSections.measurements && (
          <div className="section-summary">
                {getSectionSummary('measurements')}
              </div>
            )}
              </div>
          <span className="section-arrow">{expandedSections.measurements ? '▼' : '▶'}</span>
            </div>
        {expandedSections.measurements && (
          <div className="section-content">
            <div className="form-group">
              <label>Leaf thickness (mm)</label>
              <div className="measurement-section">
                <div className="measurement-input-container">
                <input
                  type="number"
                  value={formData.leafThickness || ''}
                  onChange={(e) => handleInputChange('leafThickness', e.target.value)}
                  className="number-input"
                  min="0"
                  step="1"
                  placeholder="Enter thickness"
                />
                  <div className="quick-select-buttons">
                    {commonThicknessValues.map(value => (
                      <button
                        key={value}
                        className={`quick-select-button ${formData.leafThickness === value ? 'selected' : ''}`}
                        onClick={() => handleQuickSelectThickness(value)}
                      >
                        {value}mm
                      </button>
                    ))}
          </div>
                </div>
                <div className="photo-upload-container">
                      <input
                        type="file"
                        id="leafThicknessPhoto"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload('leafThickness', e)}
                        style={{ display: 'none' }}
                        capture="environment"
                      />
                      <label htmlFor="leafThicknessPhoto" className="photo-upload-button">
                        <span className="upload-icon">📷</span>
                        <span>Upload Photo</span>
                      </label>
                      {formData.measurements?.leafThicknessPhotoUrl && (
                        <div className="photo-preview">
                          <img src={formData.measurements.leafThicknessPhotoUrl} alt="Leaf thickness" />
                          <button
                            className="remove-photo"
                            onClick={() => handleRemovePhoto('leafThickness')}
                          >
                            ×
                          </button>
                        </div>
                      )}
                      <span>Upload Photo</span>
                </div>
                    </div>
                    </div>

            <div className="form-group">
              <label>Leaf Gap Measurements (mm)</label>
              <div className="gap-measurements-container">
                <GapMeasurementAccordion
                  type="hingeSide"
                  label="Hinge Side"
                  gapData={formData.leafGap.hingeSide}
                  onGapChange={handleLeafGapChange}
                  onPhotoUpload={handleHingeSidePhotoUpload}
                  photoUrl={formData.measurements.hingeSidePhotoUrl}
                  onPhotoRemove={() => handleRemovePhoto('hingeSide')}
                  isExpanded={expandedGap === 'hingeSide'}
                  onToggle={() => setExpandedGap(expandedGap === 'hingeSide' ? '' : 'hingeSide')}
                  onRangeComplete={handleGapComplete}
                  isCompliant={isGapCompliant(formData.leafGap.hingeSide)}
                />

                <GapMeasurementAccordion
                  type="topGap"
                  label="Top Gap"
                  gapData={formData.leafGap.topGap}
                  onGapChange={handleLeafGapChange}
                  onPhotoUpload={handleTopGapPhotoUpload}
                  photoUrl={formData.measurements.topGapPhotoUrl}
                  onPhotoRemove={() => handleRemovePhoto('topGap')}
                  isExpanded={expandedGap === 'topGap'}
                  onToggle={() => setExpandedGap(expandedGap === 'topGap' ? '' : 'topGap')}
                  onRangeComplete={handleGapComplete}
                  isCompliant={isGapCompliant(formData.leafGap.topGap)}
                />

                <GapMeasurementAccordion
                  type="leadingEdge"
                  label="Leading Edge"
                  gapData={formData.leafGap.leadingEdge}
                  onGapChange={handleLeafGapChange}
                  onPhotoUpload={handleLeadingEdgePhotoUpload}
                  photoUrl={formData.measurements.leadingEdgePhotoUrl}
                  onPhotoRemove={() => handleRemovePhoto('leadingEdge')}
                  isExpanded={expandedGap === 'leadingEdge'}
                  onToggle={() => setExpandedGap(expandedGap === 'leadingEdge' ? '' : 'leadingEdge')}
                  onRangeComplete={handleGapComplete}
                  isCompliant={isGapCompliant(formData.leafGap.leadingEdge)}
                />

                <GapMeasurementAccordion
                  type="thresholdGap"
                  label="Threshold Gap"
                  gapData={formData.leafGap.thresholdGap || { start: '', end: '' }}
                  onGapChange={handleLeafGapChange}
                  onPhotoUpload={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData(prev => ({
                        ...prev,
                        measurements: {
                          ...prev.measurements,
                          thresholdGapPhoto: file,
                          thresholdGapPhotoUrl: URL.createObjectURL(file)
                        }
                      }));
                    }
                  }}
                  photoUrl={formData.measurements.thresholdGapPhotoUrl}
                  onPhotoRemove={() => handleRemovePhoto('thresholdGap')}
                  isExpanded={expandedGap === 'thresholdGap'}
                  onToggle={() => setExpandedGap(expandedGap === 'thresholdGap' ? '' : 'thresholdGap')}
                  onRangeComplete={handleGapComplete}
                  isCompliant={isGapCompliant(formData.leafGap.thresholdGap || { start: '', end: '' })}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="form-section condition-assessment">
        <div className="section-header" onClick={() => toggleSection('conditionAssessment')}>
          <div className="section-header-content">
            <div className="assessment-header">
              <h3>Condition Assessment</h3>
              <span className="assessment-helper">Check each item and mark defects if necessary</span>
            </div>
            {!expandedSections.conditionAssessment && (
          <div className="section-summary" ref={sectionSummaryRef}>
                <div className="assessment-grid">
                  <div className="assessment-column">
                    <div className="component-group">
                      <h4>Structure</h4>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Frame</span>
                          <span className={`status-dot ${formData.frameCondition === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.frameDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.frameDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Leaf</span>
                          <span className={`status-dot ${formData.leafCondition === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.leafDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.leafDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Alignment</span>
                          <span className={`status-dot ${formData.alignment === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.alignmentDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.alignmentDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="component-group">
                      <h4>Hardware</h4>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Handles</span>
                          <span className={`status-dot ${formData.handlesSufficient === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.handlesDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.handlesDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Lock</span>
                          <span className={`status-dot ${formData.lockCondition === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.lockDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.lockDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Hinges</span>
                          <span className={`status-dot ${formData.hingesCondition === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.hingesDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.hingesDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="assessment-column">
                    <div className="component-group">
                      <h4>Seals & Closure</h4>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Threshold</span>
                          <span className={`status-dot ${formData.thresholdSeal === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.thresholdDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.thresholdDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Seals</span>
                          <span className={`status-dot ${formData.combinedStripsCondition === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.combinedStripsDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.combinedStripsDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Closer</span>
                          <span className={`status-dot ${formData.selfCloserFunctional === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.selfCloserDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.selfCloserDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="component-group">
                      <h4>Additional</h4>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Signage</span>
                          <span className={`status-dot ${formData.signageSatisfactory === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.signageDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.signageDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Furniture</span>
                          <span className={`status-dot ${formData.furnitureCondition === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.furnitureDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.furnitureDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="component-section">
                        <div className="component-header">
                          <span className="component-name">Glazing</span>
                          <span className={`status-dot ${formData.glazingSufficient === 'No' ? 'fail' : ''}`}></span>
                        </div>
                        {formData.glazingDefects?.length > 0 && (
                          <div className="defect-tags">
                            {formData.glazingDefects.map((defect, i) => (
                              <span key={i} className="defect-tag">{defect}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <span className="section-arrow">{expandedSections.conditionAssessment ? '▼' : '▶'}</span>
        </div>
        {expandedSections.conditionAssessment && (
          <div className="section-content">
            {/* Frame Condition */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>FRAME</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.FRAME}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.FRAME)}
                >?</button>
              </div>
              <div className="options-group">
                {['Yes', 'No'].map(value => 
                  renderOption(value, formData.frameCondition === value, () => handleOptionClick('frameCondition', value), `frame-${value}`)
                )}
              </div>
              {formData.frameCondition === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('frame')}
                    <TagInput
                      tags={formData.frameDefects}
                      onAddTag={(defect) => handleAddDefect('frame', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('frame', defect)}
                      options={getDefectOptions('frame')}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.frame}
                      recentDefects={RECENT_DEFECTS.frame}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Leaf Condition */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>LEAF</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.LEAF}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.LEAF)}
                >?</button>
              </div>
              <div className="options-group">
                {/* Add key attribute to force re-render when state changes */}
                <div key={`leaf-options-${formData.leafCondition}`} className="options-wrapper">
                  <button
                    type="button"
                    className={`option-button ${formData.leafCondition === 'Yes' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('leafCondition', 'Yes')}
                    data-field="leaf"
                    data-value="Yes"
                    data-selected={formData.leafCondition === 'Yes' ? 'true' : 'false'}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`option-button ${formData.leafCondition === 'No' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('leafCondition', 'No')}
                    data-field="leaf"
                    data-value="No"
                    data-selected={formData.leafCondition === 'No' ? 'true' : 'false'}
                  >
                    No
                  </button>
                </div>
              </div>
              {formData.leafCondition === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('leaf')}
                    <TagInput
                      tags={formData.leafDefects}
                      onAddTag={(defect) => handleAddDefect('leaf', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('leaf', defect)}
                      options={[
                        { value: 'Damaged Leaf', label: 'Damaged Leaf' },
                        { value: 'Delamination', label: 'Delamination' },
                        { value: 'Warped / Bowed Leaf', label: 'Warped / Bowed Leaf' },
                        { value: 'Leaf Thickness Insufficient', label: 'Leaf Thickness Insufficient' },
                        { value: 'Not Original Certified Leaf', label: 'Not Original Certified Leaf' },
                        { value: 'Decay / Rot', label: 'Decay / Rot' },
                        { value: 'Voids / Holes', label: 'Voids / Holes' },
                        { value: 'Missing Core', label: 'Missing Core' },
                        { value: 'Unauthorized Modification', label: 'Unauthorized Modification' },
                        { value: 'Poor Previous Repair', label: 'Poor Previous Repair' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.leaf}
                      recentDefects={RECENT_DEFECTS.leaf}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Alignment */}
            <div className="assessment-item" data-field="alignment">
              <div className="assessment-label">
                <label><strong>ALIGNMENT</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.ALIGNMENT}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.ALIGNMENT)}
                >?</button>
              </div>
              <div className="options-group">
                <div key={`alignment-options-${formData.alignment}`} className="options-wrapper">
                  <button
                    type="button"
                    className={`option-button ${formData.alignment === 'Yes' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('alignment', 'Yes')}
                    data-field="alignment"
                    data-value="Yes"
                    data-selected={formData.alignment === 'Yes'}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`option-button ${formData.alignment === 'No' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('alignment', 'No')}
                    data-field="alignment"
                    data-value="No"
                    data-selected={formData.alignment === 'No'}
                  >
                    No
                  </button>
                </div>
              </div>
              {formData.alignment === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('alignment')}
                    <TagInput
                      tags={formData.alignmentDefects}
                      onAddTag={(defect) => handleAddDefect('alignment', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('alignment', defect)}
                      options={[
                        { value: 'Door Binding on Frame', label: 'Door Binding on Frame' },
                        { value: 'Excessive Gap', label: 'Excessive Gap' },
                        { value: 'Uneven Gaps', label: 'Uneven Gaps' },
                        { value: 'Door Drops When Opened', label: 'Door Drops When Opened' },
                        { value: 'Door Not Latching Properly', label: 'Door Not Latching Properly' },
                        { value: 'Frame Out of Square', label: 'Frame Out of Square' },
                        { value: 'Irregular Contact with Stops', label: 'Irregular Contact with Stops' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.alignment}
                      recentDefects={RECENT_DEFECTS.alignment}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Handles Condition */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>HANDLES</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.HANDLES}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.HANDLES)}
                >?</button>
              </div>
              <div className="options-group">
                {['Yes', 'No'].map(value => 
                  renderOption(value, formData.handlesSufficient === value, () => handleOptionClick('handlesSufficient', value), `handles-${value}`)
                )}
              </div>
              {formData.handlesSufficient === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('handles')}
                    <TagInput
                      tags={formData.handlesDefects}
                      onAddTag={(defect) => handleAddDefect('handles', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('handles', defect)}
                      options={[
                        { value: 'Handle Missing', label: 'Handle Missing' },
                        { value: 'Handle Loose or Damaged', label: 'Handle Loose or Damaged' },
                        { value: 'Handle Not Operating Latch', label: 'Handle Not Operating Latch' },
                        { value: 'Incompatible Handle Type', label: 'Incompatible Handle Type' },
                        { value: 'Return-to-Door Handle Missing', label: 'Return-to-Door Handle Missing' },
                        { value: 'Poorly Aligned Furniture', label: 'Poorly Aligned Furniture' },
                        { value: 'Latch Misaligned or Sticking', label: 'Latch Misaligned or Sticking' },
                        { value: 'Excessive Wear or Corrosion', label: 'Excessive Wear or Corrosion' },
                        { value: 'Fixings Missing or Loose', label: 'Fixings Missing or Loose' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.handles}
                      recentDefects={RECENT_DEFECTS.handles}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lock Condition */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>LOCK</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.LOCK}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.LOCK)}
                >?</button>
              </div>
              <div className="options-group">
                {['Yes', 'No'].map(value => 
                  renderOption(value, formData.lockCondition === value, () => handleOptionClick('lockCondition', value), `lock-${value}`)
                )}
              </div>
              {formData.lockCondition === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('lock')}
                    <TagInput
                      tags={formData.lockDefects}
                      onAddTag={(defect) => handleAddDefect('lock', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('lock', defect)}
                      options={[
                        { value: 'Lock Not Functioning', label: 'Lock Not Functioning' },
                        { value: 'Lock Missing', label: 'Lock Missing' },
                        { value: 'Lock Damaged', label: 'Lock Damaged' },
                        { value: 'Strike Plate Misaligned', label: 'Strike Plate Misaligned' },
                        { value: 'Incompatible Lock Type', label: 'Incompatible Lock Type' },
                        { value: 'Security Risk', label: 'Security Risk' },
                        { value: 'Mortice Incorrectly Sized/Positioned', label: 'Mortice Incorrectly Sized/Positioned' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.lock}
                      recentDefects={RECENT_DEFECTS.lock}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Signage */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>SIGNAGE</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.SIGNAGE}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.SIGNAGE)}
                >?</button>
              </div>
              <div className="options-group">
                {['Yes', 'No'].map(value => 
                  renderOption(value, formData.signageSatisfactory === value, () => handleOptionClick('signageSatisfactory', value), `signage-${value}`)
                )}
              </div>
              {formData.signageSatisfactory === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('signage')}
                    <TagInput
                      tags={formData.signageDefects}
                      onAddTag={(defect) => handleAddDefect('signage', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('signage', defect)}
                      options={[
                        { value: 'Missing Fire Door Keep Shut Sign', label: 'Missing Fire Door Keep Shut Sign' },
                        { value: 'Missing Fire Door Keep Locked Sign', label: 'Missing Fire Door Keep Locked Sign' },
                        { value: 'Missing Fire Door Keep Clear Sign', label: 'Missing Fire Door Keep Clear Sign' },
                        { value: 'Incorrect Sign Type', label: 'Incorrect Sign Type' },
                        { value: 'Sign Not Clearly Visible', label: 'Sign Not Clearly Visible' },
                        { value: 'Wrong Location (e.g. wrong face of door)', label: 'Wrong Location (e.g. wrong face of door)' },
                        { value: 'Obsolete or Non-Compliant Signage', label: 'Obsolete or Non-Compliant Signage' },
                        { value: 'Not Photoluminescent (where required)', label: 'Not Photoluminescent (where required)' },
                        { value: 'Sign Installed on Glazing (non-compliant)', label: 'Sign Installed on Glazing (non-compliant)' },
                        { value: 'Sign Faded or Peeling', label: 'Sign Faded or Peeling' },
                        { value: 'Sign Obstructed by Furniture or Equipment', label: 'Sign Obstructed by Furniture or Equipment' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.signage}
                      recentDefects={RECENT_DEFECTS.signage}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hinges */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>HINGES</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.HINGES}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.HINGES)}
                >?</button>
              </div>
              <div className="options-group">
                {['Yes', 'No'].map(value => 
                  renderOption(value, formData.hingesCondition === value, () => handleOptionClick('hingesCondition', value), `hinges-${value}`)
                )}
              </div>
              {formData.hingesCondition === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('hinges')}
                    <TagInput
                      tags={formData.hingesDefects}
                      onAddTag={(defect) => handleAddDefect('hinges', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('hinges', defect)}
                      options={[
                        { value: 'Hinge Missing', label: 'Hinge Missing' },
                        { value: 'Loose Hinges', label: 'Loose Hinges' },
                        { value: 'Incorrect Number of Hinges (Less Than 3)', label: 'Incorrect Number of Hinges (Less Than 3)' },
                        { value: 'Hinges Not Fire-Rated', label: 'Hinges Not Fire-Rated' },
                        { value: 'Unsuitable Hinge Type', label: 'Unsuitable Hinge Type' },
                        { value: 'Damaged or Bent Hinges', label: 'Damaged or Bent Hinges' },
                        { value: 'Hinge Screws Missing or Loose', label: 'Hinge Screws Missing or Loose' },
                        { value: 'Screws Not Fire-Rated / Incompatible', label: 'Screws Not Fire-Rated / Incompatible' },
                        { value: 'Hinges Painted Over', label: 'Hinges Painted Over' },
                        { value: 'Misaligned Hinges', label: 'Misaligned Hinges' },
                        { value: 'Uneven Door Support / Sagging', label: 'Uneven Door Support / Sagging' },
                        { value: 'Signs of Excessive Wear', label: 'Signs of Excessive Wear' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.hinges}
                      recentDefects={RECENT_DEFECTS.hinges}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Threshold Seal */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>THRESHOLD</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.THRESHOLD}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.THRESHOLD)}
                >?</button>
              </div>
              <div className="options-group">
                {/* Add key attribute to force re-render when state changes */}
                <div key={`threshold-options-${formData.thresholdSeal}`} className="options-wrapper">
                  <button
                    type="button"
                    className={`option-button ${formData.thresholdSeal === 'Yes' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('thresholdSeal', 'Yes')}
                    data-field="threshold"
                    data-value="Yes"
                    data-selected={formData.thresholdSeal === 'Yes' ? 'true' : 'false'}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`option-button ${formData.thresholdSeal === 'No' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('thresholdSeal', 'No')}
                    data-field="threshold"
                    data-value="No"
                    data-selected={formData.thresholdSeal === 'No' ? 'true' : 'false'}
                  >
                    No
                  </button>
                </div>
              </div>
              {formData.thresholdSeal === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('threshold')}
                    <TagInput
                      tags={formData.thresholdDefects}
                      onAddTag={(defect) => handleAddDefect('threshold', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('threshold', defect)}
                      options={[
                        { value: 'Threshold Seal Missing', label: 'Threshold Seal Missing' },
                        { value: 'Threshold Seal Damaged', label: 'Threshold Seal Damaged' },
                        { value: 'Incorrect Threshold Type', label: 'Incorrect Threshold Type' },
                        { value: 'Excessive Gap Under Door', label: 'Excessive Gap Under Door' },
                        { value: 'Threshold Not Securely Fixed', label: 'Threshold Not Securely Fixed' },
                        { value: 'Incompatible Threshold Material', label: 'Incompatible Threshold Material' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.threshold}
                      recentDefects={RECENT_DEFECTS.threshold}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Seals (Int/Smoke) */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>SEALS</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.SEALS}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.SEALS)}
                >?</button>
              </div>
              <div className="options-group">
                {['Yes', 'No'].map(value => 
                  renderOption(value, formData.combinedStripsCondition === value, () => handleOptionClick('combinedStripsCondition', value), `strips-${value}`)
                )}
              </div>
              {formData.combinedStripsCondition === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('combinedStrips')}
                    <TagInput
                      tags={formData.combinedStripsDefects}
                      onAddTag={(defect) => handleAddDefect('combinedStrips', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('combinedStrips', defect)}
                      options={[
                        { value: 'Missing Strip(s)', label: 'Missing Strip(s)' },
                        { value: 'Damaged or Torn Strip', label: 'Damaged or Torn Strip' },
                        { value: 'Not Continuous', label: 'Not Continuous' },
                        { value: 'Incorrect Size or Type', label: 'Incorrect Size or Type' },
                        { value: 'Smoke seal Painted Over', label: 'Smoke seal Painted Over' },
                        { value: 'Not Fully Inserted or Loose', label: 'Not Fully Inserted or Loose' },
                        { value: 'Poor Adhesion (falling off)', label: 'Poor Adhesion (falling off)' },
                        { value: 'Crushed or Compressed', label: 'Crushed or Compressed' },
                        { value: 'Smoke Seal Missing (brush or fin)', label: 'Smoke Seal Missing (brush or fin)' },
                        { value: 'Strips Installed on both Leaf and Frame', label: 'Strips Installed on both Leaf and Frame' },
                        { value: 'Strip Excessively Worn', label: 'Strip Excessively Worn' },
                        { value: 'Two Types of Strip Mixed', label: 'Two Types of Strip Mixed' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.seals}
                      recentDefects={RECENT_DEFECTS.seals}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Self-Closer */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>CLOSER</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.CLOSER}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.CLOSER)}
                >?</button>
              </div>
              <div className="options-group">
                {['Yes', 'No', 'N/A'].map(value => 
                  renderOption(value, formData.selfCloserFunctional === value, () => handleOptionClick('selfCloserFunctional', value), `closer-${value}`)
                )}
              </div>
              {formData.selfCloserFunctional === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('selfCloser')}
                    <TagInput
                      tags={formData.selfCloserDefects}
                      onAddTag={(defect) => handleAddDefect('selfCloser', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('selfCloser', defect)}
                      options={[
                        { value: 'Closer Missing', label: 'Closer Missing' },
                        { value: 'Closer Leaking Oil', label: 'Closer Leaking Oil' },
                        { value: 'Closer Too Weak (Does Not Close Fully)', label: 'Closer Too Weak (Does Not Close Fully)' },
                        { value: 'Closer Too Strong (Slams Door)', label: 'Closer Too Strong (Slams Door)' },
                        { value: 'Closer Not Closing Into Latch', label: 'Closer Not Closing Into Latch' },
                        { value: 'Obstruction Preventing Closure', label: 'Obstruction Preventing Closure' },
                        { value: 'Closer Installed Incorrectly', label: 'Closer Installed Incorrectly' },
                        { value: 'Incorrect Closer Type for Door Size', label: 'Incorrect Closer Type for Door Size' },
                        { value: 'Damaged or Bent Arm', label: 'Damaged or Bent Arm' },
                        { value: 'No Delayed Action Where Required', label: 'No Delayed Action Where Required' },
                        { value: 'Hold-Open Function Not Releasing', label: 'Hold-Open Function Not Releasing' },
                        { value: 'Fire-Rated Closer Not Installed', label: 'Fire-Rated Closer Not Installed' },
                        { value: 'Overhead Closer Cover Missing', label: 'Overhead Closer Cover Missing' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.closer}
                      recentDefects={RECENT_DEFECTS.closer}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Furniture Condition */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>FURNITURE</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.FURNITURE}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.FURNITURE)}
                >?</button>
              </div>
              <div className="options-group">
                {/* Add key attribute to force re-render when state changes */}
                <div key={`furniture-options-${formData.furnitureCondition}`} className="options-wrapper">
                  <button
                    type="button"
                    className={`option-button ${formData.furnitureCondition === 'Yes' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('furnitureCondition', 'Yes')}
                    data-field="furniture"
                    data-value="Yes"
                    data-selected={formData.furnitureCondition === 'Yes' ? 'true' : 'false'}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`option-button ${formData.furnitureCondition === 'No' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('furnitureCondition', 'No')}
                    data-field="furniture"
                    data-value="No"
                    data-selected={formData.furnitureCondition === 'No' ? 'true' : 'false'}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    className={`option-button ${formData.furnitureCondition === 'N/A' ? 'selected' : ''}`}
                    onClick={() => handleOptionClick('furnitureCondition', 'N/A')}
                    data-field="furniture"
                    data-value="N/A"
                    data-selected={formData.furnitureCondition === 'N/A' ? 'true' : 'false'}
                  >
                    N/A
                  </button>
                </div>
              </div>
              {formData.furnitureCondition === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('furniture')}
                    <TagInput
                      tags={formData.furnitureDefects}
                      onAddTag={(defect) => handleAddDefect('furniture', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('furniture', defect)}
                      options={[
                        { value: 'Door Knocker Not Fire-Rated', label: 'Door Knocker Not Fire-Rated' },
                        { value: 'Letter Plate Not Fire-Rated', label: 'Letter Plate Not Fire-Rated' },
                        { value: 'Spy Hole Not Fire-Rated', label: 'Spy Hole Not Fire-Rated' },
                        { value: 'Damaged Kick Plate', label: 'Damaged Kick Plate' },
                        { value: 'Missing Security Chain', label: 'Missing Security Chain' },
                        { value: 'Loose/Missing Fixings', label: 'Loose/Missing Fixings' },
                        { value: 'Incompatible Addition', label: 'Incompatible Addition' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.furniture}
                      recentDefects={RECENT_DEFECTS.furniture}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Glazing Assessment (now part of condition assessment) */}
            <div className="assessment-item">
              <div className="assessment-label">
                <label><strong>GLAZING</strong></label>
                <button 
                  type="button" 
                  className="help-button" 
                  title={CONDITION_HELP_TEXT.GLAZING}
                  onClick={() => showTooltip(CONDITION_HELP_TEXT.GLAZING)}
                >?</button>
              </div>
              <div className="options-group">
                {['Yes', 'No', 'N/A'].map(value => 
                  renderOption(value, formData.glazingSufficient === value, () => handleOptionClick('glazingSufficient', value), `glazing-${value}`)
                )}
              </div>
              {formData.glazingSufficient === 'No' && (
                <div className="defect-input-section">
                  <div className="defect-header">
                    {renderDefectPhotoUpload('glazing')}
                    <TagInput
                      tags={formData.glazingDefects}
                      onAddTag={(defect) => handleAddDefect('glazing', defect)}
                      onRemoveTag={(defect) => handleRemoveDefect('glazing', defect)}
                      options={[
                        { value: 'Cracked/Damaged Glass', label: 'Cracked/Damaged Glass' },
                        { value: 'Non-Fire Rated Glazing', label: 'Non-Fire Rated Glazing' },
                        { value: 'Missing Intumescent Seal Around Glazing', label: 'Missing Intumescent Seal Around Glazing' },
                        { value: 'Loose Beading', label: 'Loose Beading' },
                        { value: 'Incompatible Beading Material', label: 'Incompatible Beading Material' },
                        { value: 'Incompatible Fixings', label: 'Incompatible Fixings' },
                        { value: 'Excessive Gap Around Glazing', label: 'Excessive Gap Around Glazing' },
                        { value: 'Unauthorized Modification to Glazing', label: 'Unauthorized Modification to Glazing' }
                      ]}
                      placeholder="Type to search or add defects..."
                      commonDefects={COMMON_DEFECTS.glazing}
                      recentDefects={RECENT_DEFECTS.glazing}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="form-section">
        <div className="section-header" onClick={() => toggleSection('finalAssessment')}>
          <div className="section-header-content">
            <div className="assessment-header">
              <h3>Final Assessment</h3>
              <button 
                type="button"
                className={`flag-button-with-text ${formData.isFlagged ? 'flagged' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFlag();
                }}
                title={formData.isFlagged ? 'Remove flag' : 'Flag this door for review'}
              >
                <span className="flag-icon">🚩</span>
                <span className="flag-text">
                  {formData.isFlagged ? 'Flagged for review' : 'Flag for review'}
                </span>
              </button>
              </div>
            {!expandedSections.finalAssessment && (
              <div className="section-summary">
                {getSectionSummary('finalAssessment')}
              </div>
            )}
          </div>
          <span className="section-arrow">{expandedSections.finalAssessment ? '▼' : '▶'}</span>
        </div>
        {expandedSections.finalAssessment && (
          <div className="section-content">
            <div className="form-group">
              <label className="required">Upgrade/Replacement/No Access *</label>
              <div className="button-group">
                <button
                  type="button"
                  className={`option-button ${formData.upgradeReplacement === 'Upgrade' ? 'selected' : ''}`}
                  onClick={() => handleFinalAssessmentChange('Upgrade')}
                >
                  Upgrade
                </button>
                <button
                  type="button"
                  className={`option-button ${formData.upgradeReplacement === 'Replace Doorset' ? 'selected' : ''}`}
                  onClick={() => handleFinalAssessmentChange('Replace Doorset')}
                >
                  Replace Doorset
                </button>
                <button
                  type="button"
                  className={`option-button ${formData.upgradeReplacement === 'Replace leaf' ? 'selected' : ''}`}
                  onClick={() => handleFinalAssessmentChange('Replace leaf')}
                >
                  Replace leaf
                </button>
                  </div>
            </div>

            {showMeasurements && (
              <div className="form-section measurements-section">
                <label>Rough overall doorset measurements (mm)</label>
                <div className="measurements-grid">
                  <div className="measurement-input">
                    <label>Height</label>
                    <input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="Height in mm"
                      min="0"
                    />
                </div>
                  <div className="measurement-input">
                    <label>Width</label>
                    <input
                      type="number"
                      value={formData.width || ''}
                      onChange={(e) => handleInputChange('width', e.target.value)}
                      placeholder="Width in mm"
                      min="0"
                    />
            </div>
                  <div className="measurement-input">
                    <label>Depth</label>
                    <input
                      type="number"
                      value={formData.depth || ''}
                      onChange={(e) => handleInputChange('depth', e.target.value)}
                      placeholder="Depth in mm"
                      min="0"
                    />
              </div>
            </div>
              </div>
            )}

            <div className="form-group">
              <label>Overall Condition *</label>
              <div className="options-group">
                {['Good', 'Fair', 'Poor'].map(value => 
                  renderOption(value, formData.overallCondition === value, () => handleOptionClick('overallCondition', value), `condition-${value}`)
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Additional Notes</label>
              <textarea
                value={formData.conditionDetails?.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value, 'conditionDetails')}
                className="text-input notes-field"
                rows="4"
                placeholder="Enter additional notes here..."
              />
            </div>
          </div>
        )}
      </section>

      <div className="form-actions">
        <button
          type="button"
          className="view-excel-button"
          onClick={handleViewExcel}
        >
          View Excel
        </button>
        <button type="button" className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
        <button type="submit" className="save-button" onClick={handleSave}>
          {isEditing ? 'Update Survey' : 'Save Survey'}
        </button>
      </div>
      {activeTooltip && (
        <div className="tooltip-popup">
          {activeTooltip}
        </div>
      )}

      <div className="sections-controls">
        <button 
          type="button" 
          className="expand-all-button" 
          onClick={() => toggleAllSections(true)}
        >
          Expand All
        </button>
        <button 
          type="button" 
          className="collapse-all-button" 
          onClick={() => toggleAllSections(false)}
        >
          Collapse All
        </button>
            </div>
          </div>
        );
};

export default FireDoorSurveyForm; 
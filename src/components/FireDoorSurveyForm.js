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

const FireDoorSurveyForm = () => {
  const navigate = useNavigate();
  const initialFormState = {
    doorPinNo: 1,
    floor: '',
    room: '',
    locationOfDoorSet: '',
    doorType: '',
    doorConfiguration: {
      type: '',
      hasFanLight: false,
      hasSidePanels: false,
      hasVPPanel: false
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
      hingeSide: {
        start: '',
        end: ''
      },
      topGap: {
        start: '',
        end: ''
      },
      leadingEdge: {
        start: '',
        end: ''
      },
      thresholdGap: {
        start: '',
        end: ''
      }
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
      leafThicknessPhotoUrl: null,
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
      notes: ''
    },
    defectPhotos: {
      frame: null,
      handles: null,
      signage: null,
      selfCloser: null,
      hinges: null,
      glazing: null,
      fanLights: null,
      combinedStrips: null
    },
    combinedStripsPhoto: null,
    combinedStripsPhotoUrl: null,
    roomType: ''
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
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
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

  const handlePhotoUpload = async (photoType, file) => {
    if (!surveyId) {
      setTempPhotos(prev => ({ ...prev, [photoType]: file }));
      setUploadedPhotos(prev => ({ ...prev, [photoType]: true }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('photoType', photoType);

      const response = await fetch(`${API_BASE_URL}/api/surveys/${surveyId}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      setUploadedPhotos(prev => ({ ...prev, [photoType]: true }));
      setError('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo. Please try again.');
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

  // Modify loadSurveyData to check IndexedDB first
  const loadSurveyData = async (doorNumber) => {
    try {
      // Try to get from IndexedDB first
      const cachedSurvey = await getSurveyFromIndexedDB(doorNumber);
      
      if (cachedSurvey) {
        console.log('Found survey in IndexedDB:', cachedSurvey);
        setIsEditing(true);
        setSurveyId(cachedSurvey._id);

        // Parse condition details if it's a string
        let parsedConditionDetails = cachedSurvey.conditionDetails;
        if (typeof cachedSurvey.conditionDetails === 'string') {
          try {
            parsedConditionDetails = JSON.parse(cachedSurvey.conditionDetails);
            console.log('Loaded notes:', parsedConditionDetails.notes); // Add logging
          } catch (e) {
            console.error('Error parsing condition details:', e);
            parsedConditionDetails = {
              leafGap: {},
              thresholdGap: '',
              notes: ''
            };
          }
        }

        // Set form data with all fields from cached survey
        setFormData({
          ...formData,  // Keep default structure
          ...cachedSurvey,  // Override with saved data
          doorPinNo: parseInt(cachedSurvey.doorNumber),
          conditionDetails: {
            leafGap: parsedConditionDetails.leafGap || {},
            thresholdGap: parsedConditionDetails.thresholdGap || '',
            notes: parsedConditionDetails.notes || ''  // Ensure notes are loaded
          },
          leafThickness: cachedSurvey.leafThickness || '',
          floor: cachedSurvey.floor || '',
          room: cachedSurvey.room || '',
          locationOfDoorSet: cachedSurvey.locationOfDoorSet || '',
          doorType: cachedSurvey.doorType || '',
          doorConfiguration: cachedSurvey.doorConfiguration || {
            type: '',
            hasFanLight: false,
            hasSidePanels: false,
            hasVPPanel: false
          },
          doorMaterial: cachedSurvey.doorMaterial || {
            type: '',
            customType: ''
          },
          rating: cachedSurvey.rating || 'FD30s',
          thirdPartyCertification: cachedSurvey.thirdPartyCertification || {
            type: '',
            customText: '',
            photo: null,
            photoUrl: null
          },
          surveyed: cachedSurvey.surveyed || '',
          surveyedReason: cachedSurvey.surveyedReason || '',
          surveyedCustomReason: cachedSurvey.surveyedCustomReason || '',
          isFlagged: cachedSurvey.isFlagged || false,
          leafGap: parsedConditionDetails.leafGap || {
            hingeSide: { start: '', end: '' },
            topGap: { start: '', end: '' },
            leadingEdge: { start: '', end: '' },
            thresholdGap: { start: '', end: '' }
          },
          thresholdGap: parsedConditionDetails.thresholdGap || '',
          measurements: cachedSurvey.measurements || {
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
          frameCondition: cachedSurvey.frameCondition || '',
          frameDefect: cachedSurvey.frameDefect || '',
          frameCustomDefect: cachedSurvey.frameCustomDefect || '',
          handlesSufficient: cachedSurvey.handlesSufficient || '',
          handlesDefect: cachedSurvey.handlesDefect || '',
          handlesCustomDefect: cachedSurvey.handlesCustomDefect || '',
          signageSatisfactory: cachedSurvey.signageSatisfactory || '',
          signageDefect: cachedSurvey.signageDefect || '',
          signageCustomDefect: cachedSurvey.signageCustomDefect || '',
          combinedStripsCondition: cachedSurvey.combinedStripsCondition || '',
          combinedStripsDefect: cachedSurvey.combinedStripsDefect || '',
          combinedStripsCustomDefect: cachedSurvey.combinedStripsCustomDefect || '',
          selfCloserFunctional: cachedSurvey.selfCloserFunctional || '',
          selfCloserDefect: cachedSurvey.selfCloserDefect || '',
          selfCloserCustomDefect: cachedSurvey.selfCloserCustomDefect || '',
          hingesCondition: cachedSurvey.hingesCondition || '',
          hingesDefect: cachedSurvey.hingesDefect || '',
          hingesCustomDefect: cachedSurvey.hingesCustomDefect || '',
          glazingSufficient: cachedSurvey.glazingSufficient || '',
          glazingDefect: cachedSurvey.glazingDefect || '',
          glazingCustomDefect: cachedSurvey.glazingCustomDefect || '',
          glazingBeading: cachedSurvey.glazingBeading || '',
          glazing30Minutes: cachedSurvey.glazing30Minutes || '',
          upgradeReplacement: cachedSurvey.upgradeReplacement || '',
          overallCondition: cachedSurvey.overallCondition || '',
          height: cachedSurvey.height || '',
          width: cachedSurvey.width || '',
          depth: cachedSurvey.depth || ''
        });
        return;
      }

      // If not in IndexedDB, try server
      const survey = allSurveys.find(s => s.doorNumber === doorNumber.toString());
      
      if (survey) {
        console.log('Found survey on server:', survey);
        setIsEditing(true);
        setSurveyId(survey._id);
        
        // Parse condition details if it's a string
        let parsedConditionDetails = survey.conditionDetails;
        if (typeof survey.conditionDetails === 'string') {
          try {
            parsedConditionDetails = JSON.parse(survey.conditionDetails);
            console.log('Server survey - loaded notes:', parsedConditionDetails.notes);
          } catch (e) {
            console.error('Error parsing condition details from server:', e);
            parsedConditionDetails = {
              leafGap: {},
              thresholdGap: '',
              notes: ''
            };
          }
        }

        // Set form data with all fields from server survey
        setFormData({
          ...formData,  // Keep default structure
          ...survey,    // Override with saved data
          doorPinNo: parseInt(survey.doorNumber),
          conditionDetails: {
            leafGap: parsedConditionDetails.leafGap || {},
            thresholdGap: parsedConditionDetails.thresholdGap || '',
            notes: parsedConditionDetails.notes || ''  // Ensure notes are loaded
          },
          leafThickness: survey.leafThickness || '',
          floor: survey.floor || '',
          room: survey.room || '',
          locationOfDoorSet: survey.locationOfDoorSet || '',
          doorType: survey.doorType || '',
          doorConfiguration: survey.doorConfiguration || {
            type: '',
            hasFanLight: false,
            hasSidePanels: false,
            hasVPPanel: false
          },
          doorMaterial: survey.doorMaterial || {
            type: '',
            customType: ''
          },
          rating: survey.rating || 'FD30s',
          thirdPartyCertification: survey.thirdPartyCertification || {
            type: '',
            customText: '',
            photo: null,
            photoUrl: null
          },
          surveyed: survey.surveyed || '',
          surveyedReason: survey.surveyedReason || '',
          surveyedCustomReason: survey.surveyedCustomReason || '',
          isFlagged: survey.isFlagged || false,
          leafGap: parsedConditionDetails.leafGap || {
            hingeSide: { start: '', end: '' },
            topGap: { start: '', end: '' },
            leadingEdge: { start: '', end: '' },
            thresholdGap: { start: '', end: '' }
          },
          thresholdGap: parsedConditionDetails.thresholdGap || '',
          measurements: survey.measurements || {
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
          frameCondition: survey.frameCondition || '',
          frameDefect: survey.frameDefect || '',
          frameCustomDefect: survey.frameCustomDefect || '',
          handlesSufficient: survey.handlesSufficient || '',
          handlesDefect: survey.handlesDefect || '',
          handlesCustomDefect: survey.handlesCustomDefect || '',
          signageSatisfactory: survey.signageSatisfactory || '',
          signageDefect: survey.signageDefect || '',
          signageCustomDefect: survey.signageCustomDefect || '',
          combinedStripsCondition: survey.combinedStripsCondition || '',
          combinedStripsDefect: survey.combinedStripsDefect || '',
          combinedStripsCustomDefect: survey.combinedStripsCustomDefect || '',
          selfCloserFunctional: survey.selfCloserFunctional || '',
          selfCloserDefect: survey.selfCloserDefect || '',
          selfCloserCustomDefect: survey.selfCloserCustomDefect || '',
          hingesCondition: survey.hingesCondition || '',
          hingesDefect: survey.hingesDefect || '',
          hingesCustomDefect: survey.hingesCustomDefect || '',
          glazingSufficient: survey.glazingSufficient || '',
          glazingDefect: survey.glazingDefect || '',
          glazingCustomDefect: survey.glazingCustomDefect || '',
          glazingBeading: survey.glazingBeading || '',
          glazing30Minutes: survey.glazing30Minutes || '',
          upgradeReplacement: survey.upgradeReplacement || '',
          overallCondition: survey.overallCondition || '',
          height: survey.height || '',
          width: survey.width || '',
          depth: survey.depth || ''
        });
      } else {
        // Reset form for new survey
        setIsEditing(false);
        setSurveyId(null);
        
        // Completely reset the form with initial state for a new door
        setFormData({
          ...initialFormState,
          doorPinNo: doorNumber
        });
      }
    } catch (error) {
      console.error('Error loading survey:', error);
      setError('Failed to load survey data');
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
      roomType: ''
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

  // Modify handleSave function to include IndexedDB caching
  const handleSave = async () => {
    try {
      console.log('Starting save process...');
      console.log('Current notes:', formData.conditionDetails?.notes);
      setIsSaving(true);
      
      const currentDoorNumber = parseInt(formData.doorPinNo || 1);
      
      // Store current values for quick select buttons
      const currentFloor = formData.floor;
      const currentRoom = formData.room;
      
      // Create a simplified version of the condition details
      const conditionDetailsForSave = {
        leafGap: {
          hingeSide: formData.leafGap?.hingeSide || { start: '', end: '' },
          topGap: formData.leafGap?.topGap || { start: '', end: '' },
          leadingEdge: formData.leafGap?.leadingEdge || { start: '', end: '' },
          thresholdGap: formData.leafGap?.thresholdGap || { start: '', end: '' }
        },
        thresholdGap: formData.thresholdGap || '',
        notes: formData.conditionDetails?.notes || ''
      };

      console.log('Saving condition details:', conditionDetailsForSave);

      // Create a copy of the form data to preserve all fields
      const surveyData = {
        ...formData,
        doorNumber: String(currentDoorNumber),
        leafThickness: String(formData.leafThickness || ''),
        conditionDetails: JSON.stringify(conditionDetailsForSave)
      };

      console.log('Full survey data being saved:', surveyData);

      // Determine if this is an update or new survey
      const isUpdate = isEditing && surveyId;
      const url = isUpdate 
        ? `http://localhost:5001/api/surveys/${surveyId}`
        : 'http://localhost:5001/api/surveys';
      const method = isUpdate ? 'PUT' : 'POST';

      // Save to server
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyData)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isUpdate ? 'update' : 'save'} survey to server`);
      }

      const savedSurvey = await response.json();
      console.log('Saved survey response:', savedSurvey);

      // Save to IndexedDB after successful server save
      await addSurveyToIndexedDB(surveyData);

      // Update surveyed doors list
      const doorInfo = {
        doorNumber: String(currentDoorNumber),
        isFlagged: Boolean(formData.isFlagged)
      };

      setSurveyedDoorsList(prev => {
        const filteredList = prev.filter(door => 
          String(door.doorNumber) !== String(currentDoorNumber)
        );
        return [...filteredList, doorInfo];
      });

      // Update allSurveys state
      const updatedSurveys = await fetch('http://localhost:5001/api/surveys').then(res => res.json());
      setAllSurveys(updatedSurveys);

      setIsSurveySaved(true);
      setError(`Survey ${isUpdate ? 'updated' : 'saved'} successfully!`);

      // Generate Excel file
      await saveSurveysToWorkbook(updatedSurveys);

      // Auto-backup every 10 surveys
      if (updatedSurveys.length % 10 === 0) {
        await autoBackupToExcel();
      }

      // If this was a new survey, move to next door
      if (!isUpdate) {
        // Get the next door number
        const nextDoorNumber = currentDoorNumber + 1;
        
        // Completely reset form with initial state
        setFormData({
          ...initialFormState,
          doorPinNo: nextDoorNumber
        });
        
        // Save previous values for quick select buttons
        setPreviousFloor(currentFloor);
        setPreviousRoom(currentRoom);
        
        // Clear edit state and other form state
        setIsEditing(false);
        setSurveyId(null);
        setCurrentDoor(nextDoorNumber);
        setIsSurveySaved(false);
        
        // Reset uploaded photos
        setUploadedPhotos(
          Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
        );
        setTempPhotos({});
      }
      
    } catch (error) {
      console.error('Error saving survey:', error);
      setError('Failed to save survey. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const renderOption = (value, isSelected, onClick, key, rangeInfo = null) => {
    let className = 'option-button';
    let dataAttributes = {};
    
    if (rangeInfo) {
      const { start, end, currentValue } = rangeInfo;
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
    
    if (doorConfig.hasFanLight) configText += ' with Fanlight';
    if (doorConfig.hasSidePanels) configText += ' with Side Panels';
    if (doorConfig.hasVPPanel) configText += ' with VP Panel';
    
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
    // Show confirmation dialog
    if (!window.confirm('WARNING: This will permanently delete all surveys. This action cannot be undone. Are you sure you want to proceed?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/surveys/clear`);
      
      if (response.data.success) {
        setAllSurveys([]);
        setSurveyedDoorsList([]);
        setCurrentDoor(1);
        setFormData(prevData => ({
          ...resetForm(),
          doorPinNo: 1
        }));
        setError('All surveys cleared successfully');
      } else {
        setError(`Failed to clear surveys: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error clearing surveys:', error);
      setError('Failed to clear surveys. Please try again.');
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

  const handleRemovePhoto = (photoType) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [`${photoType}Photo`]: null,
        [`${photoType}PhotoUrl`]: null
      }
    }));
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

  const isGapCompliant = (gapData) => {
    if (!gapData.start || !gapData.end) return false;
    const start = parseFloat(gapData.start);
    const end = parseFloat(gapData.end);
    return start >= 2 && end <= 4;
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

  return (
    <div className="fire-door-survey-form">
      <div className="form-header">
        <div className="header-content">
          <button className="back-button" onClick={handleBackToMenu}>
            ← Back to Menu
                </button>
          <h2>Fire Door Survey Form</h2>
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
        <h3>Basic Information</h3>
        
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
      </section>

      <section className="form-section">
        <h3>Door Specifications</h3>
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
              <button
                className={`option-button ${formData.doorConfiguration.hasVPPanel ? 'selected' : ''}`}
                onClick={(e) => handleDoorConfigChange('hasVPPanel', !formData.doorConfiguration.hasVPPanel)}
              >
                With VP Panel
              </button>
            </div>
            <div className="additional-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.doorConfiguration.hasFanLight}
                  onChange={(e) => handleDoorConfigChange('hasFanLight', e.target.checked)}
                />
                With Fan Light
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.doorConfiguration.hasSidePanels}
                  onChange={(e) => handleDoorConfigChange('hasSidePanels', e.target.checked)}
                />
                With Side Panel(s)
              </label>
            </div>
            {formData.doorConfiguration.type && (
              <div className="door-config-display">
                Selected Configuration: {getDoorTypeDisplay()}
              </div>
            )}
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
      </section>

      <section className="form-section">
        <h3>Measurements</h3>
        
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
                  <button
                    type="button"
                className="photo-upload-button"
                onClick={() => document.getElementById('leafThicknessPhoto').click()}
              >
                <span className="upload-icon">📷</span>
                  </button>
              <input
                type="file"
                id="leafThicknessPhoto"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handlePhotoUpload('leafThickness', e)}
              />
              {formData.measurements.leafThicknessPhoto && (
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
      </section>

      <section className="form-section">
        <h3>Condition Assessment</h3>
        
        <div className="form-group">
          <label>Frame in good condition</label>
          <div className="options-group">
            {['Yes', 'No'].map(value => 
              renderOption(value, formData.frameCondition === value, () => handleOptionClick('frameCondition', value), `frame-${value}`)
            )}
          </div>
          {formData.frameCondition === 'No' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('frame')}
                <CustomSelect
                  value={formData.frameDefect}
                  onChange={(value) => handleInputChange('frameDefect', value)}
                  options={[
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
                  ]}
                  placeholder="Select Defect"
                />
              </div>
              {formData.frameDefect === 'custom' && (
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter custom defect"
                  value={formData.frameCustomDefect || ''}
                  onChange={(e) => handleInputChange('frameCustomDefect', e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Handles/furniture sufficient</label>
          <div className="options-group">
            {['Yes', 'No'].map(value => 
              renderOption(value, formData.handlesSufficient === value, () => handleOptionClick('handlesSufficient', value), `handles-${value}`)
            )}
          </div>
          {formData.handlesSufficient === 'No' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('handles')}
                <CustomSelect
                  value={formData.handlesDefect}
                  onChange={(value) => handleInputChange('handlesDefect', value)}
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
                  placeholder="Select Defect"
                />
              </div>
              {formData.handlesDefect === 'custom' && (
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter custom defect"
                  value={formData.handlesCustomDefect || ''}
                  onChange={(e) => handleInputChange('handlesCustomDefect', e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Signage satisfactory</label>
          <div className="options-group">
            {['Yes', 'No'].map(value => 
              renderOption(value, formData.signageSatisfactory === value, () => handleOptionClick('signageSatisfactory', value), `signage-${value}`)
            )}
          </div>
          {formData.signageSatisfactory === 'No' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('signage')}
                <CustomSelect
                  value={formData.signageDefect}
                  onChange={(value) => handleInputChange('signageDefect', value)}
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
                    { value: 'Sign Obstructed by Furniture or Equipment', label: 'Sign Obstructed by Furniture or Equipment' },
                    { value: 'Inappropriate Adhesive or Fixings', label: 'Inappropriate Adhesive or Fixings' },
                    { value: 'Multiple Conflicting Signs', label: 'Multiple Conflicting Signs' }
                  ]}
                  placeholder="Select Defect"
                />
              </div>
              {formData.signageDefect === 'custom' && (
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter custom defect"
                  value={formData.signageCustomDefect || ''}
                  onChange={(e) => handleInputChange('signageCustomDefect', e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Combined Strips Condition</label>
          <div className="options-group">
            {['Yes', 'No'].map(value => 
              renderOption(value, formData.combinedStripsCondition === value, () => handleOptionClick('combinedStripsCondition', value), `strips-${value}`)
            )}
          </div>
          {formData.combinedStripsCondition === 'No' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('combinedStrips')}
                <select
                  value={formData.combinedStripsDefect}
                  onChange={(e) => handleInputChange('combinedStripsDefect', e.target.value)}
                  className="select-input"
                >
                  <option value="">Select Defect</option>
                  <option value="Missing Strip(s)">Missing Strip(s)</option>
                  <option value="Damaged or Torn Strip">Damaged or Torn Strip</option>
                  <option value="Not Continuous">Not Continuous</option>
                  <option value="Incorrect Size or Type">Incorrect Size or Type</option>
                  <option value="Smoke seal Painted Over">Smoke seal Painted Over</option>
                  <option value="Not Fully Inserted or Loose">Not Fully Inserted or Loose</option>
                  <option value="Poor Adhesion (falling off)">Poor Adhesion (falling off)</option>
                  <option value="Crushed or Compressed">Crushed or Compressed</option>
                  <option value="Smoke Seal Missing (brush or fin)">Smoke Seal Missing (brush or fin)</option>
                  <option value="Strips Installed on both Leaf and Frame">Strips Installed on both Leaf and Frame</option>
                  <option value="Strip Excessively Worn">Strip Excessively Worn</option>
                  <option value="Two Types of Strip Mixed">Two Types of Strip Mixed</option>
                  <option value="custom">Other (specify)</option>
                </select>
              </div>
              {formData.combinedStripsDefect === 'custom' && (
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter custom defect"
                  value={formData.combinedStripsCustomDefect || ''}
                  onChange={(e) => handleInputChange('combinedStripsCustomDefect', e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Self Closer Device Functional</label>
          <div className="options-group">
            {['Yes', 'No', 'N/A'].map(value => 
              renderOption(value, formData.selfCloserFunctional === value, () => handleOptionClick('selfCloserFunctional', value), `closer-${value}`)
            )}
          </div>
          {formData.selfCloserFunctional === 'No' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('selfCloser')}
                <select
                  value={formData.selfCloserDefect}
                  onChange={(e) => handleInputChange('selfCloserDefect', e.target.value)}
                  className="select-input"
                >
                  <option value="">Select Defect</option>
                  <option value="Closer Missing">Closer Missing</option>
                  <option value="Closer Leaking Oil">Closer Leaking Oil</option>
                  <option value="Closer Too Weak (Does Not Close Fully)">Closer Too Weak (Does Not Close Fully)</option>
                  <option value="Closer Too Strong (Slams Door)">Closer Too Strong (Slams Door)</option>
                  <option value="Closer Not Closing Into Latch">Closer Not Closing Into Latch</option>
                  <option value="Obstruction Preventing Closure">Obstruction Preventing Closure</option>
                  <option value="Closer Installed Incorrectly">Closer Installed Incorrectly</option>
                  <option value="Incorrect Closer Type for Door Size">Incorrect Closer Type for Door Size</option>
                  <option value="Damaged or Bent Arm">Damaged or Bent Arm</option>
                  <option value="No Delayed Action Where Required">No Delayed Action Where Required</option>
                  <option value="Hold-Open Function Not Releasing">Hold-Open Function Not Releasing</option>
                  <option value="Fire-Rated Closer Not Installed">Fire-Rated Closer Not Installed</option>
                  <option value="Overhead Closer Cover Missing">Overhead Closer Cover Missing</option>
                  <option value="custom">Other (specify)</option>
                </select>
              </div>
              {formData.selfCloserDefect === 'custom' && (
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter custom defect"
                  value={formData.selfCloserCustomDefect || ''}
                  onChange={(e) => handleInputChange('selfCloserCustomDefect', e.target.value)}
                />
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Hinges Compliant</label>
          <div className="options-group">
            {['Yes', 'No'].map(value => 
              renderOption(value, formData.hingesCondition === value, () => handleOptionClick('hingesCondition', value), `hinges-${value}`)
            )}
          </div>
          {formData.hingesCondition === 'No' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('hinges')}
                <select
                  value={formData.hingesDefect}
                  onChange={(e) => handleInputChange('hingesDefect', e.target.value)}
                  className="select-input"
                >
                  <option value="">Select Defect</option>
                  <option value="Hinge Missing">Hinge Missing</option>
                  <option value="Loose Hinges">Loose Hinges</option>
                  <option value="Incorrect Number of Hinges (Less Than 3)">Incorrect Number of Hinges (Less Than 3)</option>
                  <option value="Hinges Not Fire-Rated">Hinges Not Fire-Rated</option>
                  <option value="Unsuitable Hinge Type">Unsuitable Hinge Type</option>
                  <option value="Damaged or Bent Hinges">Damaged or Bent Hinges</option>
                  <option value="Hinge Screws Missing or Loose">Hinge Screws Missing or Loose</option>
                  <option value="Screws Not Fire-Rated / Incompatible">Screws Not Fire-Rated / Incompatible</option>
                  <option value="Hinges Painted Over">Hinges Painted Over</option>
                  <option value="Misaligned Hinges">Misaligned Hinges</option>
                  <option value="Uneven Door Support / Sagging">Uneven Door Support / Sagging</option>
                  <option value="Signs of Excessive Wear">Signs of Excessive Wear</option>
                  <option value="Wrong Size / Gauge Hinges for Door Weight">Wrong Size / Gauge Hinges for Door Weight</option>
                  <option value="Non-Matching Hinge Set">Non-Matching Hinge Set</option>
                  <option value="custom">Other (specify)</option>
                </select>
              </div>
              {formData.hingesDefect === 'custom' && (
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter custom defect"
                  value={formData.hingesCustomDefect || ''}
                  onChange={(e) => handleInputChange('hingesCustomDefect', e.target.value)}
                />
              )}
            </div>
          )}
        </div>
      </section>

      {shouldShowGlazingAssessment() && (
      <section className="form-section">
        <h3>Glazing Assessment</h3>
        <div className="form-group">
          <label>Glazing Sufficient</label>
          <div className="options-group">
            {['Yes', 'No', 'N/A'].map(value => 
              renderOption(value, formData.glazingSufficient === value, () => handleOptionClick('glazingSufficient', value), `glazing-${value}`)
            )}
          </div>
          {formData.glazingSufficient === 'No' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('glazing')}
                <select
                  value={formData.glazingDefect}
                  onChange={(e) => handleInputChange('glazingDefect', e.target.value)}
                  className="select-input"
                >
                  <option value="">Select Defect</option>
                  <option value="custom">Other (specify)</option>
                </select>
              </div>
              {formData.glazingDefect === 'custom' && (
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter custom defect"
                  value={formData.glazingCustomDefect || ''}
                  onChange={(e) => handleInputChange('glazingCustomDefect', e.target.value)}
                />
              )}
            </div>
          )}
        </div>
        </section>
      )}

      <section className="form-section">
        <div className="assessment-header">
        <h3>Final Assessment</h3>
          <button 
            type="button"
            className={`flag-button-with-text ${formData.isFlagged ? 'flagged' : ''}`}
            onClick={handleToggleFlag}
            title={formData.isFlagged ? 'Remove flag' : 'Flag this door for review'}
          >
            <span className="flag-icon">🚩</span>
            <span className="flag-text">
              {formData.isFlagged ? 'Flagged for review' : 'Flag for review'}
            </span>
          </button>
          </div>
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
    </div>
  );
};

export default FireDoorSurveyForm; 
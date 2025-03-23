import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import PhotoUpload from './PhotoUpload';
import './FireDoorSurveyForm.css';
import axios from 'axios';
import SurveyTracker from './SurveyTracker';
import ExcelJS from 'exceljs';
import RoomTypeSelector from './RoomTypeSelector';
import LocationSelector from './LocationSelector';

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

const FireDoorSurveyForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doorPinNo: 1,
    floor: '',
    room: '',
    locationOfDoorSet: '',
    doorType: '',
    doorConfiguration: {
      type: '',
      hasFanLight: false,
      hasSidePanels: false,
      hasVPPanel: false  // Add new state for VP Panel
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
    isFlagged: false,
    leafGap: '',
    thresholdGap: '',
    showExtendedThresholdGap: false,
    measurements: {
      leafGapPhoto: null,
      leafGapPhotoUrl: null,
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
      notes: ''
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
  });
  const [surveyId, setSurveyId] = useState(null);
  const [isSurveySaved, setIsSurveySaved] = useState(false);
  const [drawingFile, setDrawingFile] = useState(null);
  const [hasSkippedDrawing, setHasSkippedDrawing] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState(
    Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
  );
  const [notifications, setNotifications] = useState([]);
  const [tempPhotos, setTempPhotos] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  const [allSurveys, setAllSurveys] = useState([]);
  const [currentDoor, setCurrentDoor] = useState(1);
  const [surveyedDoorsList, setSurveyedDoorsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);

  useEffect(() => {
    const savedNotifications = localStorage.getItem('doorNotifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/surveys`);
        const surveys = response.data;
        setAllSurveys(surveys);
        // Extract surveyed door numbers
        const doorNumbers = surveys.map(survey => survey.doorNumber);
        setSurveyedDoorsList(doorNumbers);
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
          error = 'Surveyed field is required';
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
        if (formData.frameCondition === 'N' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'frameCustomDefect':
        if (formData.frameCondition === 'N' && formData.frameDefect === 'custom' && !fieldValue?.trim()) {
          error = 'Please specify the custom defect';
        }
        break;
      case 'handlesDefect':
        if (formData.handlesSufficient === 'N' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'handlesCustomDefect':
        if (formData.handlesSufficient === 'N' && formData.handlesDefect === 'custom' && !fieldValue?.trim()) {
          error = 'Please specify the custom defect';
        }
        break;
      case 'signageDefect':
        if (formData.signageSatisfactory === 'N' && !fieldValue) {
          error = 'Please select a defect type';
        }
        break;
      case 'signageCustomDefect':
        if (formData.signageSatisfactory === 'N' && formData.signageDefect === 'custom' && !fieldValue?.trim()) {
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
          break;
    }

    return error;
  };

  const handleInputChange = (field, value, section = null) => {
    setError('');
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      // Special handling for rating changes
      if (field === 'rating') {
        const isNonFireRated = ['Not Fire-Rated', 'Notional', 'Nominal'].includes(value);
        setFormData(prev => ({
          ...prev,
          [field]: value,
          // Automatically set Third Party Certification for non-fire-rated doors
          thirdPartyCertification: {
            ...prev.thirdPartyCertification,
            type: isNonFireRated ? 'na' : prev.thirdPartyCertification.type,
            customText: isNonFireRated ? '' : prev.thirdPartyCertification.customText
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
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
      setDrawingFile(file);
      setHasSkippedDrawing(false);
    }
  };

  const handleSkipDrawing = () => {
    setHasSkippedDrawing(true);
    setDrawingFile(null);
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
    for (const [photoType, file] of Object.entries(tempPhotos)) {
      try {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('photoType', photoType);

        const response = await fetch(`${API_BASE_URL}/api/surveys/${newSurveyId}/photos`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error(`Failed to upload temporary photo ${photoType}`);
        }
      } catch (error) {
        console.error(`Error uploading temporary photo ${photoType}:`, error);
      }
    }
    setTempPhotos({});
  };

  const handleLeafGapPhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          leafGapPhoto: file,
          leafGapPhotoUrl: URL.createObjectURL(file)
        }
      }));
    }
  };

  const handleSurveyedChange = (value) => {
    handleOptionClick('surveyed', value);
    
    if (value === 'N') {
      const newNotification = {
        doorNumber: formData.doorPinNo || 1,
        location: formData.locationOfDoorSet || 'Unknown location',
        floor: formData.floor || '',
        room: formData.room || '',
        date: new Date().toISOString()
      };
      
      setNotifications(prev => {
        const updated = [...prev, newNotification];
        localStorage.setItem('doorNotifications', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    console.log('Starting form validation...');
    
    // Validate required fields
    if (!formData.doorPinNo) {
      console.log('Door Number missing');
      errors.doorPinNo = 'Door Number is required';
    }
    
    if (!formData.doorType) {
      console.log('Door Type missing');
      errors.doorType = 'Door Type is required';
    }
    
    if (!formData.rating) {
      console.log('Rating missing');
      errors.rating = 'Fire Rating is required';
    }
    
    if (!formData.surveyed) {
      console.log('Surveyed field missing');
      errors.surveyed = 'Surveyed field is required';
    }

    if (!formData.upgradeReplacement) {
      console.log('Upgrade/Replacement field missing');
      errors.upgradeReplacement = 'Upgrade/Replacement field is required';
    }

    if (!formData.overallCondition) {
      console.log('Overall Condition missing');
      errors.overallCondition = 'Overall Condition is required';
    }
    
    // Update validation errors state
    console.log('Validation errors:', errors);
    setValidationErrors(errors);
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  const loadSurveyData = async (doorNumber) => {
    try {
      // Find the survey in allSurveys array
      const survey = allSurveys.find(s => s.doorNumber === doorNumber.toString());
      
      if (survey) {
        setIsEditing(true);
        setSurveyId(survey._id);
        
        // Update form data with survey data
        setFormData({
          ...formData,
          doorPinNo: parseInt(survey.doorNumber),
          floor: survey.floor || '',
          room: survey.room || '',
          locationOfDoorSet: survey.locationOfDoorSet || '',
          doorType: survey.doorType || '',
          rating: survey.rating || 'FD30s',
          thirdPartyCertification: {
            ...formData.thirdPartyCertification,
            type: survey.thirdPartyCertification?.type || '',
            customText: survey.thirdPartyCertification?.customText || '',
            photo: survey.thirdPartyCertification?.photo || null,
            photoUrl: survey.thirdPartyCertification?.photoUrl || null
          },
          surveyed: survey.surveyed || '',
          leafGap: survey.leafGap || '',
          thresholdGap: survey.thresholdGap || '',
          combinedStripsCondition: survey.combinedStripsCondition || '',
          selfCloserFunctional: survey.selfCloserFunctional || '',
          hingesCondition: survey.hingesCondition || '',
          glazingSufficient: survey.glazingSufficient || '',
          fanLightsSufficient: survey.fanLightsSufficient || '',
          upgradeReplacement: survey.upgradeReplacement || '',
          overallCondition: survey.overallCondition || '',
          conditionDetails: {
            ...formData.conditionDetails,
            notes: survey.notes || ''
          }
        });

        setError('Survey loaded for editing');
      } else {
        setIsEditing(false);
        setSurveyId(null);
        // Reset form for new survey
        setFormData(prevData => ({
          ...prevData,
          doorPinNo: doorNumber,
          floor: '',
          room: '',
          locationOfDoorSet: '',
          doorType: '',
          rating: 'FD30s',
          thirdPartyCertification: {
            type: '',
            customText: '',
            photo: null,
            photoUrl: null
          },
          surveyed: '',
          leafGap: '',
          thresholdGap: '',
          combinedStripsCondition: '',
          selfCloserFunctional: '',
          hingesCondition: '',
          glazingSufficient: '',
          fanLightsSufficient: '',
          upgradeReplacement: '',
          overallCondition: '',
          conditionDetails: {
            leafGap: '',
            thresholdGap: '',
            notes: ''
          }
        }));
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
    const resetData = {
      doorPinNo: currentDoor,
      floor: '',
      room: '',
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
      isFlagged: false,
      leafGap: '',
      thresholdGap: '',
      showExtendedThresholdGap: false,
      measurements: {
        leafGapPhoto: null,
        leafGapPhotoUrl: null,
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
        notes: ''
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

    setFormData(resetData);
    setIsEditing(false);
    setSurveyId(null);
    setUploadedPhotos(
      Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
    );
    setTempPhotos({});
    setDrawingFile(null);
    setHasSkippedDrawing(false);
    setValidationErrors({});
    setError('');
    setIsSurveySaved(false);

    return resetData;
  };

  const handleSave = async () => {
    try {
      console.log('Starting save process...');
      console.log('Current form data:', formData);
      
      if (!validateForm()) {
        console.log('Validation errors:', validationErrors);
        setError('Please fill in all required fields');
        return;
      }

      console.log('Form validation passed, preparing survey data...');
      const surveyData = {
        doorNumber: formData.doorPinNo.toString(),
        floor: formData.floor || '',
        room: formData.room || '',
        locationOfDoorSet: formData.locationOfDoorSet.trim(),
        doorType: formData.doorType || '',
        doorConfiguration: getDoorTypeDisplay(formData.doorConfiguration),
        doorMaterial: getDoorMaterialDisplay(formData.doorMaterial),
        rating: formData.rating,
        thirdPartyCertification: {
          type: formData.thirdPartyCertification.type || '',
          customText: formData.thirdPartyCertification.customText || '',
          photo: formData.thirdPartyCertification.photo || null,
          photoUrl: formData.thirdPartyCertification.photoUrl || null
        },
        surveyed: formData.surveyed,
        leafGap: formData.leafGap || '',
        thresholdGap: formData.thresholdGap || '',
        combinedStripsCondition: formData.combinedStripsCondition || '',
        selfCloserFunctional: formData.selfCloserFunctional || '',
        hingesCondition: formData.hingesCondition || '',
        glazingSufficient: formData.glazingSufficient || '',
        fanLightsSufficient: formData.fanLightsSufficient || '',
        upgradeReplacement: formData.upgradeReplacement || '',
        overallCondition: formData.overallCondition || '',
        notes: formData.conditionDetails?.notes || ''
      };

      let response;
      try {
        if (isEditing && surveyId) {
          // Update existing survey
          response = await axios.put(`${API_BASE_URL}/api/surveys/${surveyId}`, surveyData);
        } else {
          // Create new survey
          response = await axios.post(`${API_BASE_URL}/api/surveys`, surveyData);
        }
      } catch (error) {
        console.error('Error saving survey:', error);
        throw new Error(error.response?.data?.message || 'Failed to save survey');
      }

      if (response.data) {
        // Set the survey ID from the response
        const savedSurveyId = response.data._id || response.data.id;
        
        // Upload any temporary photos if they exist
        if (Object.keys(tempPhotos).length > 0) {
          await uploadTempPhotos(savedSurveyId);
        }
        
        // Get all surveys
        const allSurveysResponse = await axios.get(`${API_BASE_URL}/api/surveys`);
        const surveys = allSurveysResponse.data;
        
        // Update states
        setAllSurveys(surveys);
        setSurveyedDoorsList(surveys.map(s => s.doorNumber));
        
        // Generate Excel file
        const excelResult = await saveSurveysToWorkbook(surveys);
        
        if (excelResult.success) {
          setError(`Survey ${isEditing ? 'updated' : 'saved'} successfully! Master file updated at: ${excelResult.filePath}`);
          setIsSurveySaved(true);
          
          if (isEditing) {
            // For editing, just show success message and keep current form data
            setError('Survey updated successfully!');
          } else {
            // For new survey, reset form and move to next door
            const nextDoorNumber = formData.doorPinNo + 1;
            const resetData = resetForm();
            setFormData({
              ...resetData,
              doorPinNo: nextDoorNumber
            });
            setCurrentDoor(nextDoorNumber);
          }
        } else {
          throw new Error('Survey saved to database but failed to generate Excel file: ${excelResult.error}');
        }
      } else {
        throw new Error('Failed to save survey. No response data received.');
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      setError(error.message || 'Failed to save survey. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const renderOption = (value, isSelected, onClick, key) => (
    <button
      key={key}
      type="button"
      className={`option-button ${isSelected ? 'selected' : ''} ${validationErrors[key.split('-')[0]] ? 'error' : ''}`}
      onClick={onClick}
    >
      {value}
    </button>
  );

  const getDoorTypeDisplay = (config = null) => {
    const configuration = config || formData.doorConfiguration;
    let display = configuration.type || '';
    if (configuration.hasFanLight) display += ' + With Fan Light';
    if (configuration.hasSidePanels) display += ' + With Side Panel(s)';
    if (configuration.hasVPPanel) display += ' + With VP Panel';
    return display;
  };

  // Helper function to get door material display
  const getDoorMaterialDisplay = (material) => {
    if (!material) return '';
    return material.type === 'custom' 
      ? `${material.type} - ${material.customType}` 
      : material.type;
  };

  // Function to save multiple door surveys into a single Excel workbook
  const saveSurveysToWorkbook = async (surveys) => {
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
      link.download = 'fire_door_surveys.xlsx';
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

  const handleRemoveNotification = (index) => {
    setNotifications(prev => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('doorNotifications', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearSurveys = async () => {
    // Show confirmation dialog
    if (!window.confirm('WARNING: This will permanently delete all surveys. This action cannot be undone. Are you sure you want to proceed?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/surveys/clear`);
      
      if (response.data.success) {
        // Clear local storage and state
        localStorage.removeItem('doorNotifications');
        setNotifications([]);
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
                  <div class="summary-value">${sortedSurveys.filter(s => s.surveyed === 'Y').length}</div>
                  <div class="summary-label">Passed Inspection</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${sortedSurveys.filter(s => s.surveyed === 'N').length}</div>
                  <div class="summary-label">Failed Inspection</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${((sortedSurveys.filter(s => s.surveyed === 'Y').length / sortedSurveys.length) * 100).toFixed(1)}%</div>
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
                      <td>${survey.surveyed === 'Y' ? 'Pass' : 'Fail'}</td>
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

  const handleContinueSurvey = () => {
    // Reset form and move to the next unsurveyed door
    const nextDoor = surveyedDoorsList.length > 0 
      ? Math.max(...surveyedDoorsList.map(Number), 0) + 1 
      : 1;  // Start from 1 if no surveys exist
    resetForm();
    setCurrentDoor(nextDoor);
    setFormData(prev => ({
      ...prev,
      doorPinNo: nextDoor
    }));
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
    handleInputChange('room', roomType);
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
        totalSurveys={Math.max(...surveyedDoorsList.map(Number), currentDoor)}
        currentDoor={currentDoor}
        onDoorChange={handleDoorChange}
        surveyedDoorsList={surveyedDoorsList}
        onViewSurveys={handleViewSurveys}
        onEditSurvey={handleEditSurvey}
        onContinueSurvey={handleContinueSurvey}
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
        <div className="form-group">
          <label htmlFor="location">Location of Door Set *</label>
          <LocationSelector
            onSelect={(location) => handleInputChange('locationOfDoorSet', location)}
            initialValue={formData.locationOfDoorSet}
          />
        </div>
        <div className="form-group">
          <label>Floor</label>
          <select
            value={formData.floor}
            onChange={(e) => handleInputChange('floor', e.target.value)}
            className="select-input"
          >
            <option value="">Select Floor</option>
            <option value="B">Basement</option>
            <option value="G">Ground</option>
            <option value="1">First</option>
            <option value="2">Second</option>
            <option value="3">Third</option>
          </select>
        </div>

        {renderFormGroup('Room', 'room', 
          <RoomTypeSelector
            onSelect={handleRoomTypeSelect}
            initialValue={formData.room}
          />,
          true
        )}
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
          <label>Surveyed *</label>
          <div className="options-group">
            {['Y', 'N'].map(value => 
              renderOption(
                value, 
                formData.surveyed === value, 
                () => handleSurveyedChange(value), 
                `surveyed-${value}`
              )
            )}
          </div>
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
          <label>Leaf Gap (mm)</label>
          <div className="measurement-section">
            <div className="leaf-gap-grid">
              {['0', '1', '2', '3', '4', '4.5', '5'].map(value => 
              renderOption(
                  value,
                  formData.leafGap === value,
                  () => handleOptionClick('leafGap', value),
                  `leaf-gap-${value}`
                )
              )}
            </div>
            <div className="leaf-gap-grid">
              {['6', '7', '8', '9', '10', '11', '12+'].map(value => 
                renderOption(
                  value,
                  formData.leafGap === value,
                  () => handleOptionClick('leafGap', value),
                  `leaf-gap-${value}`
                )
              )}
            </div>
            <div className="photo-upload-container">
              <input
                type="file"
                id="leaf-gap-photo"
                accept="image/*"
                onChange={handleLeafGapPhotoUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="leaf-gap-photo" className="photo-upload-button">
                <span className="upload-icon">📸</span>
              </label>
              {formData.measurements.leafGapPhotoUrl && (
                <div className="photo-preview">
                  <img src={formData.measurements.leafGapPhotoUrl} alt="Leaf gap measurement" />
                  <button
                    type="button"
                    className="remove-photo"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        leafGapPhoto: null,
                        leafGapPhotoUrl: null
                      }
                    }))}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Threshold Gap (mm)</label>
          <div className="measurement-section">
            <div className="threshold-gap-grid">
              {['0', '1', '2', '3', '4', '5'].map(value => 
              renderOption(
                  value,
                  formData.thresholdGap === value,
                  () => handleOptionClick('thresholdGap', value),
                  `threshold-gap-${value}`
                )
              )}
            </div>
            <div className="threshold-gap-grid">
              {['6', '7', '8', '9', '10', '11-25+'].map(value => 
                renderOption(
                  value,
                  formData.thresholdGap === value || (value === '11-25+' && formData.showExtendedThresholdGap),
                  () => handleOptionClick('thresholdGap', value),
                  `threshold-gap-${value}`
                )
              )}
            </div>
            <div className="photo-upload-container">
              <input
                type="file"
                id="threshold-gap-photo"
                accept="image/*"
                onChange={(e) => {
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
                style={{ display: 'none' }}
                capture="environment"
              />
              <label htmlFor="threshold-gap-photo" className="photo-upload-button">
                <span className="upload-icon">📸</span>
              </label>
              {formData.measurements.thresholdGapPhotoUrl && (
                <div className="photo-preview">
                  <img src={formData.measurements.thresholdGapPhotoUrl} alt="Threshold gap measurement" />
                  <button
                    type="button"
                    className="remove-photo"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        thresholdGapPhoto: null,
                        thresholdGapPhotoUrl: null
                      }
                    }))}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            {formData.showExtendedThresholdGap && (
              <div className="extended-threshold-options">
                <div className="threshold-gap-grid">
                  {[...Array(8)].map((_, i) => {
                    const value = (i + 11).toString();
                    return renderOption(
                      value,
                      formData.thresholdGap === value,
                      () => handleOptionClick('thresholdGap', value),
                      `threshold-gap-${value}`
                    );
                  })}
                </div>
                <div className="threshold-gap-grid">
                  {[...Array(7)].map((_, i) => {
                    const value = (i + 19).toString();
                    return renderOption(
                      value,
                      formData.thresholdGap === value,
                      () => handleOptionClick('thresholdGap', value),
                      `threshold-gap-${value}`
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="form-section">
        <h3>Condition Assessment</h3>
        
        <div className="form-group">
          <label>Frame in good condition</label>
          <div className="options-group">
            {['Y', 'N'].map(value => 
              renderOption(value, formData.frameCondition === value, () => handleOptionClick('frameCondition', value), `frame-${value}`)
            )}
          </div>
          {formData.frameCondition === 'N' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('frame')}
                <select
                  value={formData.frameDefect}
                  onChange={(e) => handleInputChange('frameDefect', e.target.value)}
                  className="select-input"
                >
                  <option value="">Select Defect</option>
                  <option value="damaged">Damaged</option>
                  <option value="loose">Loose</option>
                  <option value="rusted">Rusted</option>
                  <option value="custom">Other (specify)</option>
                </select>
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
            {['Y', 'N'].map(value => 
              renderOption(value, formData.handlesSufficient === value, () => handleOptionClick('handlesSufficient', value), `handles-${value}`)
            )}
          </div>
          {formData.handlesSufficient === 'N' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('handles')}
                <select
                  value={formData.handlesDefect}
                  onChange={(e) => handleInputChange('handlesDefect', e.target.value)}
                  className="select-input"
                >
                  <option value="">Select Defect</option>
                  <option value="loose">Loose</option>
                  <option value="missing">Missing</option>
                  <option value="damaged">Damaged</option>
                  <option value="custom">Other (specify)</option>
                </select>
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
            {['Y', 'N'].map(value => 
              renderOption(value, formData.signageSatisfactory === value, () => handleOptionClick('signageSatisfactory', value), `signage-${value}`)
            )}
          </div>
          {formData.signageSatisfactory === 'N' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('signage')}
                <select
                  value={formData.signageDefect}
                  onChange={(e) => handleInputChange('signageDefect', e.target.value)}
                  className="select-input"
                >
                  <option value="">Select Defect</option>
                  <option value="missing">Missing</option>
                  <option value="damaged">Damaged</option>
                  <option value="incorrect">Incorrect</option>
                  <option value="custom">Other (specify)</option>
                </select>
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
                  <option value="seal negrazus">Seal negražus</option>
                  <option value="geras, bet reik pinigu">Geras, bet reik pinigų</option>
                </select>
              </div>
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
                  <option value="not closing">Not Closing</option>
                  <option value="slamming">Slamming</option>
                  <option value="missing">Missing</option>
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
                  <option value="leaking oil">Leaking Oil</option>
                  <option value="screws missing">Screws Missing</option>
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

        <div className="form-group">
          <label>Fan Lights Sufficient</label>
          <div className="options-group">
            {['Yes', 'No', 'N/A'].map(value => 
              renderOption(value, formData.fanLightsSufficient === value, () => handleOptionClick('fanLightsSufficient', value), `fanlights-${value}`)
            )}
          </div>
          {formData.fanLightsSufficient === 'No' && (
            <div className="defect-input-section">
              <div className="defect-header">
                {renderDefectPhotoUpload('fanLights')}
                <select
                  value={formData.fanLightsDefect}
                  onChange={(e) => handleInputChange('fanLightsDefect', e.target.value)}
                  className="select-input"
                >
                  <option value="">Select Defect</option>
                  <option value="custom">Other (specify)</option>
                </select>
              </div>
              {formData.fanLightsDefect === 'custom' && (
                <input
                  type="text"
                  className="text-input"
                  placeholder="Enter custom defect"
                  value={formData.fanLightsCustomDefect || ''}
                  onChange={(e) => handleInputChange('fanLightsCustomDefect', e.target.value)}
                />
              )}
            </div>
          )}
        </div>
      </section>

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
            <button
              type="button"
              className={`option-button ${formData.upgradeReplacement === 'No Access' ? 'selected' : ''}`}
              onClick={() => handleFinalAssessmentChange('No Access')}
            >
              No Access
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
            value={formData.conditionDetails.notes}
            onChange={(e) => handleInputChange('notes', e.target.value, 'conditionDetails')}
            className="text-input"
            rows="4"
          />
        </div>
      </section>

      <section className="form-section">
        <div className="photo-custom-container">
          <PhotoUpload
            onUpload={handlePhotoUpload}
            photoTypes={PHOTO_TYPES}
            uploadedPhotos={uploadedPhotos}
            isSurveySaved={isSurveySaved}
            surveyId={surveyId}
          />

          {!formData.customSection.label ? (
            <button
              type="button"
              className="add-custom-section-button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  customSection: {
                    ...prev.customSection,
                    label: 'Custom Component'
                  }
                }));
              }}
            >
              + Add Custom Section
            </button>
          ) : (
            <>
              <div className="custom-section-header">
                <div className="custom-section-inputs">
                  <input
                    type="text"
                    className="text-input custom-component-name"
                    placeholder="Enter component name (e.g. Air transfer grille)"
                    value={formData.customSection.componentName}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        customSection: {
                          ...prev.customSection,
                          componentName: e.target.value
                        }
                      }));
                    }}
                  />
                  <input
                    type="text"
                    className="text-input custom-component-description"
                    placeholder="Enter description (e.g. ATG is defective)"
                    value={formData.customSection.description}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        customSection: {
                          ...prev.customSection,
                          description: e.target.value
                        }
                      }));
                    }}
                  />
                  {renderDefectPhotoUpload('customSection')}
                </div>
                <button
                  type="button"
                  className="remove-custom-section"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      customSection: {
                        label: '',
                        value: '',
                        defect: '',
                        customDefect: '',
                        componentName: '',
                        description: ''
                      }
                    }));
                  }}
                >
                  Remove
                </button>
              </div>
              <div className="form-group">
                <div className="options-group">
                  {['Yes', 'No', 'N/A'].map(value => 
                    renderOption(
                      value,
                      formData.customSection.value === value,
                      () => handleInputChange('value', value, 'customSection'),
                      `custom-section-${value}`
                    )
                  )}
                </div>
                {formData.customSection.value === 'No' && (
                  <div className="defect-input-section">
                    <div className="defect-header">
                      {renderDefectPhotoUpload('customSection')}
                      <select
                        value={formData.customSection.defect}
                        onChange={(e) => handleInputChange('defect', e.target.value, 'customSection')}
                        className="select-input"
                      >
                        <option value="">Select Defect</option>
                        <option value="damaged">Damaged</option>
                        <option value="missing">Missing</option>
                        <option value="custom">Other (specify)</option>
                      </select>
                    </div>
                    {formData.customSection.defect === 'custom' && (
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Enter custom defect"
                        value={formData.customSection.customDefect || ''}
                        onChange={(e) => handleInputChange('customDefect', e.target.value, 'customSection')}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import PhotoUpload from './PhotoUpload';
import './FireDoorSurveyForm.css';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001';

const PHOTO_TYPES = {
  FRONT_DOOR: 'frontDoorPicture',
  TOP_LEAF: 'topLeafPicture',
  TOP_LEAF_DOUBLE: 'topLeafDoublePicture',
  FAULTS_3: 'unmentionedFaults3',
  FAULTS_4: 'unmentionedFaults4',
  FAULTS_5: 'unmentionedFaults5'
};

const FireDoorSurveyForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doorPinNo: 0,
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
    surveyed: '',
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
    combinedStripsPhotoUrl: null
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

  useEffect(() => {
    const savedNotifications = localStorage.getItem('doorNotifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  const validateField = (field, value, section = null) => {
    let error = '';
    const fieldValue = section ? value[field] : value;

    switch (field) {
      case 'locationOfDoorSet':
        if (!fieldValue?.trim()) {
          error = 'Location of Door Set is required';
        }
        break;
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
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    const error = validateField(field, value, section);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));

    setError('');
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
        doorNumber: formData.doorPinNo || 0,
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
    
    // Validate required fields
    if (!formData.doorPinNo) {
      errors.doorPinNo = 'Door Number is required';
    }
    
    if (!formData.locationOfDoorSet?.trim()) {
      errors.locationOfDoorSet = 'Location of Door Set is required';
    }
    
    if (!formData.doorType) {
      errors.doorType = 'Door Type is required';
    }
    
    if (!formData.rating) {
      errors.rating = 'Fire Rating is required';
    }
    
    if (!formData.surveyed) {
      errors.surveyed = 'Surveyed field is required';
    }
    
    // Update validation errors state
    setValidationErrors(errors);
    
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    try {
      // Validate form before submission
      if (!validateForm()) {
        setError('Please fill in all required fields');
        return;
      }

      // Prepare survey data with proper formatting
      const surveyData = {
        doorNumber: formData.doorPinNo.toString(),
        floor: formData.floor || '',
        room: formData.room || '',
        locationOfDoorSet: formData.locationOfDoorSet.trim(),
        doorType: formData.doorType || '',
        doorConfiguration: getDoorTypeDisplay(formData.doorConfiguration),
        doorMaterial: getDoorMaterialDisplay(formData.doorMaterial),
        rating: formData.rating,
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

      // Save to backend
      const response = await axios.post(`${API_BASE_URL}/api/surveys`, surveyData);
      
      if (response.data.success) {
        // Set the survey ID from the response
        setSurveyId(response.data._id);

        // Upload any temporary photos if they exist
        if (Object.keys(tempPhotos).length > 0) {
          await uploadTempPhotos(response.data._id);
        }
        
        // Get all surveys
        const allSurveysResponse = await axios.get(`${API_BASE_URL}/api/surveys`);
        const allSurveys = allSurveysResponse.data;
        
        // Generate Excel file with all surveys
        const excelResult = await saveSurveysToWorkbook(allSurveys);
        
        if (excelResult.success) {
          setError(`Survey saved successfully! Master file updated at: ${excelResult.filePath}`);
          setIsSurveySaved(true);
          
          // Reset form for next survey
          setFormData(prevData => ({
            ...prevData,
            doorPinNo: parseInt(prevData.doorPinNo) + 1,
            floor: '',
            room: '',
            locationOfDoorSet: '',
            doorType: '',
            rating: 'FD30s',
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
            },
            doorConfiguration: {
              type: '',
              hasFanLight: false,
              hasSidePanels: false
            },
            doorMaterial: {
              type: '',
              customType: ''
            }
          }));
          
          // Reset photos
          setUploadedPhotos(
            Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
          );
          setTempPhotos({});
          
          // Reset drawing
          setDrawingFile(null);
          setHasSkippedDrawing(false);
          
          // Clear validation errors
          setValidationErrors({});
        } else {
          setError(`Survey saved to database but failed to generate Excel file: ${excelResult.error}`);
        }
      } else {
        setError('Failed to save survey. Please try again.');
      }
    } catch (error) {
      console.error('Error saving survey:', error);
      setError(error.response?.data?.message || 'Failed to save survey. Please try again.');
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
  const saveSurveysToWorkbook = (surveys) => {
    try {
      // Get customer info from localStorage
      const customerInfo = JSON.parse(localStorage.getItem('currentCustomer') || '{}');
      
      // Use a consistent filename based on customer name or default to 'fire_door_survey_master'
      const baseFilename = 'fire_door_survey_master';
      const filename = `${baseFilename}.xlsx`;

      console.log('Creating/updating workbook:', filename);

      // Always create a new workbook with all surveys
      const workbook = XLSX.utils.book_new();

      // Create Client Details sheet
      const clientDetailsData = [
        [{ v: 'Fire Door Survey Report', s: { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } } }, '', '', ''],
        ['', '', '', ''],
        [{ v: 'Client Information', s: { font: { bold: true }, fill: { fgColor: { rgb: "E0E0E0" } } } }, '', '', ''],
        ['Customer Name:', customerInfo.customerName || 'N/A', 'Company Name:', customerInfo.companyName || 'N/A'],
        ['Address:', customerInfo.address || 'N/A', 'City:', customerInfo.city || 'N/A'],
        ['Postcode:', customerInfo.postcode || 'N/A', 'Contact Person:', customerInfo.contactPerson || 'N/A'],
        ['Phone Number:', customerInfo.phoneNumber || 'N/A', 'Email:', customerInfo.email || 'N/A'],
        ['Building Type:', customerInfo.buildingType || 'N/A', 'Survey Date:', customerInfo.surveyDate || new Date().toISOString().split('T')[0]],
        ['Last Updated:', new Date().toLocaleString(), '', ''],
        ['', '', '', ''],
        [{ v: 'Survey Summary', s: { font: { bold: true }, fill: { fgColor: { rgb: "E0E0E0" } } } }, '', '', ''],
        ['Total Doors Surveyed:', surveys.length],
        ['Pass Rate:', `${((surveys.filter(s => s.surveyed === 'Y').length / surveys.length) * 100).toFixed(1)}%`],
        ['', '', '', '']
      ];

      const clientDetailsSheet = XLSX.utils.aoa_to_sheet(clientDetailsData);
      XLSX.utils.book_append_sheet(workbook, clientDetailsSheet, 'Client Details');

      // Sort surveys by door number
      const sortedSurveys = [...surveys].sort((a, b) => parseInt(a.doorNumber) - parseInt(b.doorNumber));

      // Create survey data with fields as rows and doors as columns
      const surveyFields = [
        'Floor',
        'Room',
        'Location of Door Set',
        'Door Type',
        'Door Configuration',
        'Door Material',
        'Fire Rating',
        'Surveyed',
        'Leaf Gap',
        'Threshold Gap',
        'Combined Strips Condition',
        'Self Closer Functional',
        'Hinges Condition',
        'Glazing Sufficient',
        'Fan Lights Sufficient',
        'Upgrade/Replacement',
        'Overall Condition',
        'Notes'
      ];

      const surveyData = [
        ['Field', ...sortedSurveys.map(s => `Door ${s.doorNumber}`)]
      ];

      // Map field names to database fields
      const fieldMapping = {
        'Floor': 'floor',
        'Room': 'room',
        'Location of Door Set': 'locationOfDoorSet',
        'Door Type': 'doorType',
        'Door Configuration': 'doorConfiguration',
        'Door Material': 'doorMaterial',
        'Fire Rating': 'rating',
        'Surveyed': 'surveyed',
        'Leaf Gap': 'leafGap',
        'Threshold Gap': 'thresholdGap',
        'Combined Strips Condition': 'combinedStripsCondition',
        'Self Closer Functional': 'selfCloserFunctional',
        'Hinges Condition': 'hingesCondition',
        'Glazing Sufficient': 'glazingSufficient',
        'Fan Lights Sufficient': 'fanLightsSufficient',
        'Upgrade/Replacement': 'upgradeReplacement',
        'Overall Condition': 'overallCondition',
        'Notes': 'notes'
      };

      // Add data rows
      surveyFields.forEach(field => {
        const row = [field];
        const dbField = fieldMapping[field];
        sortedSurveys.forEach(survey => {
          row.push(survey[dbField] === undefined || survey[dbField] === null || survey[dbField] === '' ? '' : survey[dbField]);
        });
        surveyData.push(row);
      });

      // Create the survey worksheet
      const surveySheet = XLSX.utils.aoa_to_sheet(surveyData);

      // Set column widths
      const colWidths = [
        { wch: 25 }, // Field names column
        ...sortedSurveys.map(() => ({ wch: 15 })) // Door data columns
      ];
      surveySheet['!cols'] = colWidths;

      // Style the header row and first column
      const range = XLSX.utils.decode_range(surveySheet['!ref']);
      for (let R = 0; R <= range.e.r; ++R) {
        const firstCell = XLSX.utils.encode_cell({r: R, c: 0});
        if (!surveySheet[firstCell]) surveySheet[firstCell] = {};
        surveySheet[firstCell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "E0E0E0" } }
        };
      }
      for (let C = 0; C <= range.e.c; ++C) {
        const headerCell = XLSX.utils.encode_cell({r: 0, c: C});
        if (!surveySheet[headerCell]) surveySheet[headerCell] = {};
        surveySheet[headerCell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "F0F0F0" } }
        };
      }

      // Add the survey sheet
      XLSX.utils.book_append_sheet(workbook, surveySheet, 'Survey Data');

      // Save the workbook
      XLSX.writeFile(workbook, filename);
      console.log('Successfully saved workbook:', filename);
      return { success: true, filePath: filename };
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
      {children}
      {validationErrors[field] && (
        <div className="validation-error">
          {validationErrors[field]}
        </div>
      )}
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

  const handleDoorChange = (newDoorNumber) => {
    if (newDoorNumber) {
      handleInputChange('doorPinNo', newDoorNumber);
    }
  };

  const handleViewExcel = () => {
    try {
      // Create a new workbook if one doesn't exist
      const wb = XLSX.utils.book_new();
      
      // Create the headers for the worksheet
      const headers = [
        'Door Number',
        'Floor',
        'Room',
        'Location of Door Set',
        'Door Type',
        'Door Configuration',
        'Door Material',
        'Fire Resistance Rating',
        'Surveyed',
        'Leaf Thickness (mm)',
        'Leaf Gap (mm)',
        'Threshold Gap (mm)',
        'Combined Strips Condition',
        'Self Closer Device Functional',
        'Hinges Compliant',
        'Frame Condition',
        'Handles Sufficient',
        'Signage Satisfactory',
        'Glazing Sufficient',
        'Fan Lights Sufficient',
        'Upgrade/Replacement/No Access',
        'Overall Condition',
        'Additional Notes'
      ];

      // Create worksheet with headers
      const ws = XLSX.utils.aoa_to_sheet([headers]);

      // Set column widths
      const colWidths = headers.map(() => ({ wch: 20 }));
      ws['!cols'] = colWidths;

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Survey Data');

      // Convert workbook to HTML
      const html = XLSX.utils.sheet_to_html(ws);
      
      // Open in new window with improved styling
      const newWindow = window.open('');
      newWindow.document.write(`
        <html>
          <head>
            <title>Fire Door Survey Excel View</title>
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
              .header {
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              .download-btn {
                padding: 10px 20px;
                background-color: #217346;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
              }
              .download-btn:hover {
                background-color: #1e6a41;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Fire Door Survey Data</h2>
                <button class="download-btn" onclick="downloadExcel()">Download Excel</button>
              </div>
              ${html}
            </div>
            <script>
              function downloadExcel() {
                // Create a link to download the Excel file
                const link = document.createElement('a');
                link.href = 'fire-door-survey-master.xlsx';
                link.download = 'fire-door-survey-master.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error handling Excel view:', error);
      alert('An error occurred while trying to view the Excel data. A new empty template has been created.');
    }
  };

  const handleRemoveNotification = (index) => {
    setNotifications(prev => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem('doorNotifications', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="fire-door-survey-form">
      <div className="form-header">
        <h1>Fire Door Survey</h1>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Survey Tracker Section */}
      <div className="survey-tracker-card">
        <div className="tracker-header">
          <h2>Survey Tracker</h2>
          <div className="survey-count">{notifications.length}</div>
        </div>
        <div className="door-navigation">
          <button
            className="nav-button"
            onClick={() => handleDoorChange(formData.doorPinNo - 1)}
            disabled={formData.doorPinNo <= 1}
          >
            ←
          </button>
          <div className="door-display">Door {formData.doorPinNo}</div>
          <button
            className="nav-button"
            onClick={() => handleDoorChange(formData.doorPinNo + 1)}
          >
            →
          </button>
        </div>
        <button
          className="clear-surveys-button"
          onClick={async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/surveys/clear`, {
                method: 'DELETE',
              });
              const data = await response.json();
              
              if (data.success) {
                localStorage.removeItem('doorNotifications');
                setNotifications([]);
                setError('All surveys cleared successfully');
              } else {
                setError(`Failed to clear surveys: ${data.message}`);
              }
            } catch (error) {
              console.error('Error clearing surveys:', error);
              setError('Failed to clear surveys. Please try again.');
            }
          }}
        >
          Clear All Surveys ({notifications.length})
        </button>
      </div>
      
      {/* Add Notifications Section */}
      {notifications.length > 0 && (
        <div className="notification-section">
          <div className="notification-header">
            <h3>Doors Requiring Attention</h3>
            <button 
              className="toggle-notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              View Notifications
              <span className="notification-count">{notifications.length}</span>
            </button>
          </div>
          
          {showNotifications && (
            <div className="notification-carousel">
              <button
                className="carousel-button"
                onClick={() => setCurrentNotificationIndex(prev => Math.max(0, prev - 1))}
                disabled={currentNotificationIndex === 0}
              >
                ←
              </button>
              
              <div className="notification-content">
                <div className="notification-details">
                  <div className="door-number">Door {notifications[currentNotificationIndex].doorNumber}</div>
                  <div className="location">{notifications[currentNotificationIndex].location}</div>
                  <div className="floor-room">
                    {notifications[currentNotificationIndex].floor && `Floor: ${notifications[currentNotificationIndex].floor}`}
                    {notifications[currentNotificationIndex].room && ` - Room: ${notifications[currentNotificationIndex].room}`}
                  </div>
                  <div className="date">
                    {new Date(notifications[currentNotificationIndex].date).toLocaleDateString()}
                  </div>
                </div>
                
                <button
                  className="remove-notification"
                  onClick={() => handleRemoveNotification(currentNotificationIndex)}
                >
                  Remove
                </button>
              </div>
              
              <button
                className="carousel-button"
                onClick={() => setCurrentNotificationIndex(prev => 
                  Math.min(notifications.length - 1, prev + 1)
                )}
                disabled={currentNotificationIndex === notifications.length - 1}
              >
                →
              </button>
            </div>
          )}
        </div>
      )}

      <div className="form-section">
        <h2>Drawing Upload</h2>
        <div className="drawing-upload-container">
          <button onClick={handleDrawingUpload} className="upload-button">
            Import Drawing
          </button>
          <button onClick={handleSkipDrawing} className="skip-button">
            Skip Drawing
          </button>
        </div>
      </div>

      {/* Drawing Upload Section */}
      <section className="form-section drawing-section">
        <h3>Drawing Upload</h3>
        <div className="drawing-upload-container">
          {!drawingFile && !hasSkippedDrawing ? (
            <div className="drawing-options">
              <div className="drawing-upload-button">
                <input
                  type="file"
                  id="drawing-upload"
                  accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png"
                  onChange={handleDrawingUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="drawing-upload" className="upload-label">
                  Import Drawing
                </label>
              </div>
              <button
                type="button"
                className="skip-drawing-button"
                onClick={handleSkipDrawing}
              >
                Skip Drawing
              </button>
            </div>
          ) : (
            <div className="drawing-status">
              {drawingFile ? (
                <div className="drawing-preview">
                  <span>{drawingFile.name}</span>
                  <button
                    type="button"
                    className="remove-drawing-button"
                    onClick={() => {
                      setDrawingFile(null);
                      setHasSkippedDrawing(false);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="drawing-skipped">
                  <span>Drawing upload skipped</span>
                  <button
                    type="button"
                    className="change-drawing-button"
                    onClick={() => setHasSkippedDrawing(false)}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Door/Pin Number Section */}
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

      {/* Basic Information Section */}
      <section className="form-section">
        <h3>Basic Information</h3>
        {renderFormGroup('Location of Door Set', 'locationOfDoorSet', (
          <input
            type="text"
            value={formData.locationOfDoorSet}
            onChange={(e) => handleInputChange('locationOfDoorSet', e.target.value)}
            className={`text-input ${validationErrors.locationOfDoorSet ? 'error' : ''}`}
            placeholder="Enter door set location"
          />
        ), true)}
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

        <div className="form-group">
          <label>Room</label>
          <select
            value={formData.room}
            onChange={(e) => handleInputChange('room', e.target.value)}
            className="select-input"
          >
            <option value="">Select Room</option>
            <option value="corridor">Corridor</option>
            <option value="stairwell">Stairwell</option>
            <option value="lobby">Lobby</option>
          </select>
        </div>
      </section>

      {/* Door Specifications Section */}
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
          <label>Fire Door Material *</label>
          <div className="door-material-section">
          <div className="options-group">
              {['Timber-Based Door Set', 'Composite Door Set'].map(type => 
                renderOption(
                  type,
                  formData.doorMaterial.type === type,
                  () => handleDoorMaterialChange(type),
                  `door-material-${type}`
                )
            )}
          </div>
            <div className="material-dropdown-section">
              <select
                className="select-input"
                value={formData.doorMaterial.type}
                onChange={(e) => handleDoorMaterialChange(e.target.value)}
              >
                <option value="">Select Additional Options</option>
                <option value="Metal Door Set">Metal Door Set</option>
                <option value="Wooden Leaf with Metal Frame">Wooden Leaf with Metal Frame</option>
                <option value="custom">Other (specify)</option>
              </select>
              {formData.doorMaterial.type === 'custom' && (
                <input
                  type="text"
                  className="text-input custom-material-input"
                  placeholder="Enter custom material"
                  value={formData.doorMaterial.customType}
                  onChange={(e) => handleCustomMaterialChange(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Rating *</label>
          <select
            value={formData.rating}
            onChange={(e) => handleInputChange('rating', e.target.value)}
            className="select-input"
          >
            <option value="Not Fire-Rated">Not Fire-Rated</option>
            <option value="Notional">Notional</option>
            <option value="Nominal">Nominal</option>
            <option value="FD30">FD30</option>
            <option value="FD30s">FD30s</option>
            <option value="FD60">FD60</option>
            <option value="FD60s">FD60s</option>
            <option value="FD90">FD90</option>
            <option value="FD90s">FD90s</option>
            <option value="FD120">FD120</option>
            <option value="FD120s">FD120s</option>
            <option value="FD240">FD240</option>
            <option value="FD240s">FD240s</option>
          </select>
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

      {/* Measurements Section */}
      <section className="form-section">
        <h3>Measurements</h3>
        
        <div className="form-group">
          <label>Leaf thickness (mm)</label>
          <div className="measurement-section">
            <input
              type="number"
              value={formData.leafThickness || ''}
              onChange={(e) => handleInputChange('leafThickness', e.target.value)}
              className="number-input"
              min="0"
              step="1"
              placeholder="Enter thickness"
            />
            <div className="photo-upload-container">
              <input
                type="file"
                id="leaf-thickness-photo"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        leafThicknessPhoto: file,
                        leafThicknessPhotoUrl: URL.createObjectURL(file)
                      }
                    }));
                  }
                }}
                style={{ display: 'none' }}
                capture="environment"
              />
              <label htmlFor="leaf-thickness-photo" className="photo-upload-button">
                <span className="upload-icon">📸</span>
                <span>Upload Photo</span>
              </label>
              {formData.measurements.leafThicknessPhotoUrl && (
                <div className="photo-preview">
                  <img src={formData.measurements.leafThicknessPhotoUrl} alt="Leaf thickness measurement" />
                  <button
                    type="button"
                    className="remove-photo"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      measurements: {
                        ...prev.measurements,
                        leafThicknessPhoto: null,
                        leafThicknessPhotoUrl: null
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
                <span>Upload Photo</span>
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
                <span>Upload Photo</span>
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

      {/* Condition Assessment Section */}
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

      {/* Glazing Section */}
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

      {/* Final Assessment Section */}
      <section className="form-section">
        <h3>Final Assessment</h3>
        <div className="form-group">
          <label>Upgrade/Replacement/No Access *</label>
          <div className="options-group">
            {['Upgrade', 'Replace Doorset', 'Replace leaf', 'No Access'].map(value => 
              renderOption(value, formData.upgradeReplacement === value, () => handleOptionClick('upgradeReplacement', value), `upgrade-${value}`)
            )}
          </div>
        </div>

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

      {/* Photo Upload and Custom Section */}
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
          {isSurveySaved ? 'Update Survey' : 'Save Survey'}
        </button>
      </div>
    </div>
  );
};

export default FireDoorSurveyForm; 
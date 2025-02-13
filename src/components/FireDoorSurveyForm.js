import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import PhotoUpload from './PhotoUpload';
import './FireDoorSurveyForm.css';

const API_BASE_URL = 'http://localhost:5001';

const PHOTO_TYPES = {
  FRONT_DOOR: 'frontDoorPicture',
  TOP_LEAF: 'topLeafPicture',
  TOP_LEAF_DOUBLE: 'topLeafDoublePicture',
  STRIPS_1: 'stripsPhoto1',
  STRIPS_2: 'stripsPhoto2',
  FAULTS_3: 'unmentionedFaults3',
  FAULTS_4: 'unmentionedFaults4',
  FAULTS_5: 'unmentionedFaults5'
};

const FireDoorSurveyForm = () => {
  const navigate = useNavigate();
  const [surveyId, setSurveyId] = useState(null);
  const [isSurveySaved, setIsSurveySaved] = useState(false);
  const [drawingFile, setDrawingFile] = useState(null);
  const [hasSkippedDrawing, setHasSkippedDrawing] = useState(false);
  const [error, setError] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState(
    Object.values(PHOTO_TYPES).reduce((acc, type) => ({ ...acc, [type]: false }), {})
  );

  const [formData, setFormData] = useState({
    doorPinNo: 0,
    floor: '',
    room: '',
    locationOfDoorSet: '',
    doorType: '',
    rating: '',
    surveyed: '',
    leafGap: '',
    thresholdGap: '',
    combinedStripsCondition: '',
    combinedStripsDefect: '',
    selfCloserFunctional: '',
    hingesCondition: '',
    doorGuardWorking: '',
    glazingSufficient: '',
    glazingBeading: '',
    glazing30Minutes: '',
    fanLightsSufficient: '',
    headerPanelsSufficient: '',
    frameCondition: '',
    handlesSufficient: '',
    signageSatisfactory: '',
    upgradeReplacement: '',
    overallCondition: '',
    addDetail: '',
    conditionDetails: {
      leafGap: '',
      thresholdGap: '',
      notes: ''
    }
  });

  const handleInputChange = (field, value, section = null) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
    if (!isSurveySaved) {
      setError('Please save the survey before uploading photos.');
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

  const validateForm = () => {
    // Check required fields with strict validation
    if (!formData.locationOfDoorSet?.trim()) {
      setError('Location of Door Set is required');
      return false;
    }

    if (!formData.rating) {
      setError('Fire Resistance Rating is required');
      return false;
    }

    if (!formData.doorType) {
      setError('Door Type is required');
      return false;
    }

    if (!formData.surveyed) {
      setError('Surveyed field is required');
      return false;
    }

    if (!formData.upgradeReplacement) {
      setError('Upgrade/Replacement field is required');
      return false;
    }

    if (!formData.overallCondition) {
      setError('Overall Condition is required');
      return false;
    }

    return true;
  };

  const generateExcelFile = (data) => {
    const wb = XLSX.utils.book_new();
    const excelData = [
      ['Fire Door Survey Report'],
      ['Generated Date', new Date().toLocaleString()],
      [''],
      ['Initial Information'],
      ['Door/Pin No.', data.doorPinNo],
      ['Floor', data.floor],
      ['Room', data.room],
      ['Location of Door Set', data.locationOfDoorSet],
      [''],
      ['Door Information'],
      ['Door Type', data.doorType],
      ['Rating', data.rating],
      ['Surveyed', data.surveyed],
      [''],
      ['Measurements'],
      ['Leaf Gap Average (mm)', data.leafGap],
      ['Threshold Gap (mm)', data.thresholdGap],
      [''],
      ['Conditions'],
      ['Combined Strips Condition', data.combinedStripsCondition],
      ['Self Closer Device Functional', data.selfCloserFunctional],
      ['3 Hinges in Good Condition', data.hingesCondition],
      [''],
      ['Glazing Checks'],
      ['Glazing Sufficient', data.glazingSufficient],
      ['Fan Lights Sufficient', data.fanLightsSufficient],
      [''],
      ['Final Assessment'],
      ['Upgrade/Replacement/No Access', data.upgradeReplacement],
      ['Overall Condition', data.overallCondition],
      ['Additional Details', data.addDetail]
    ];

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    ws['!cols'] = [{ wch: 30 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Report');
    XLSX.writeFile(wb, `fire-door-survey-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setError('');

      // Create the base survey data
      const surveyData = {
        locationOfDoorSet: formData.locationOfDoorSet.trim(),
        rating: formData.rating,
        doorType: formData.doorType,
        surveyed: formData.surveyed,
        upgradeReplacement: formData.upgradeReplacement,
        overallCondition: formData.overallCondition,
        room: formData.room || '',
        floor: formData.floor || '',
        leafGap: formData.leafGap || '',
        thresholdGap: formData.thresholdGap || '',
        combinedStripsCondition: formData.combinedStripsCondition || '',
        selfCloserFunctional: formData.selfCloserFunctional || '',
        hingesCondition: formData.hingesCondition || '',
        glazingSufficient: formData.glazingSufficient || '',
        fanLightsSufficient: formData.fanLightsSufficient || '',
        notes: formData.conditionDetails?.notes || ''
      };

      // Debug logging
      console.log('Form Data:', surveyData);

      // First, save the survey data
      const response = await fetch(`${API_BASE_URL}/api/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyData)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Server Response:', responseData);
        throw new Error(responseData.message || 'Failed to save survey');
      }

      // If we have a drawing file, upload it separately
      if (drawingFile) {
        const drawingFormData = new FormData();
        drawingFormData.append('drawing', drawingFile);
        
        const drawingResponse = await fetch(`${API_BASE_URL}/api/surveys/${responseData._id}/drawing`, {
          method: 'POST',
          body: drawingFormData
        });

        if (!drawingResponse.ok) {
          console.warn('Failed to upload drawing file');
        }
      }

      setSurveyId(responseData._id);
      setIsSurveySaved(true);
      generateExcelFile(formData);
      setError('Survey saved successfully! You can now upload photos.');
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save survey. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const renderOption = (value, isSelected, onClick, key) => (
    <button
      key={key}
      type="button"
      className={`option-button ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {value}
    </button>
  );

  return (
    <div className="fire-door-survey-form">
      {error && (
        <div className={`message ${error.includes('successfully') ? 'success-message' : 'error-message'}`}>
          {error}
        </div>
      )}

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

      <PhotoUpload
        onUpload={handlePhotoUpload}
        photoTypes={PHOTO_TYPES}
        uploadedPhotos={uploadedPhotos}
        isSurveySaved={isSurveySaved}
        surveyId={surveyId}
      />

      {/* Basic Information Section */}
      <section className="form-section">
        <h3>Basic Information</h3>
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

        <div className="form-group">
          <label>Location of Door Set *</label>
          <input
            type="text"
            value={formData.locationOfDoorSet}
            onChange={(e) => handleInputChange('locationOfDoorSet', e.target.value)}
            className="text-input"
            placeholder="Enter door set location"
          />
        </div>
      </section>

      {/* Door Specifications Section */}
      <section className="form-section">
        <h3>Door Specifications</h3>
        <div className="form-group">
          <label>Door Type *</label>
          <div className="options-group">
            {['Single', 'Double', 'Leaf & half'].map(type => 
              renderOption(type, formData.doorType === type, () => handleOptionClick('doorType', type), `door-type-${type}`)
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Rating *</label>
          <div className="options-group">
            {['FD30', 'FD30s', 'FD60', 'FD60s'].map(rating => 
              renderOption(rating, formData.rating === rating, () => handleOptionClick('rating', rating), `rating-${rating}`)
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Surveyed *</label>
          <div className="options-group">
            {['Y', 'N'].map(value => 
              renderOption(value, formData.surveyed === value, () => handleOptionClick('surveyed', value), `surveyed-${value}`)
            )}
          </div>
        </div>
      </section>

      {/* Measurements Section */}
      <section className="form-section">
        <h3>Measurements</h3>
        <div className="form-group">
          <label>Leaf Gap Average (mm)</label>
          <div className="options-grid">
            {[...Array(14)].map((_, i) => 
              renderOption(
                i === 13 ? '13+' : i.toString(),
                formData.leafGap === i.toString(),
                () => handleOptionClick('leafGap', i.toString()),
                `leaf-gap-${i}`
              )
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Threshold Gap (mm)</label>
          <div className="options-grid">
            {[...Array(25)].map((_, i) => 
              renderOption(
                i.toString(),
                formData.thresholdGap === i.toString(),
                () => handleOptionClick('thresholdGap', i.toString()),
                `threshold-gap-${i}`
              )
            )}
            {renderOption('25+', formData.thresholdGap === '25+', () => handleOptionClick('thresholdGap', '25+'), 'threshold-gap-25-plus')}
          </div>
        </div>
      </section>

      {/* Condition Assessment Section */}
      <section className="form-section">
        <h3>Condition Assessment</h3>
        <div className="form-group">
          <label>Combined Strips Condition</label>
          <div className="options-group">
            {['Y', 'N'].map(value => 
              renderOption(value, formData.combinedStripsCondition === value, () => handleOptionClick('combinedStripsCondition', value), `strips-${value}`)
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Self Closer Device Functional</label>
          <div className="options-group">
            {['Yes', 'No', 'N/A'].map(value => 
              renderOption(value, formData.selfCloserFunctional === value, () => handleOptionClick('selfCloserFunctional', value), `closer-${value}`)
            )}
          </div>
        </div>

        <div className="form-group">
          <label>3 Hinges in Good Condition</label>
          <div className="options-group">
            {['Y', 'N'].map(value => 
              renderOption(value, formData.hingesCondition === value, () => handleOptionClick('hingesCondition', value), `hinges-${value}`)
            )}
          </div>
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
        </div>

        <div className="form-group">
          <label>Fan Lights Sufficient</label>
          <div className="options-group">
            {['Yes', 'No', 'N/A'].map(value => 
              renderOption(value, formData.fanLightsSufficient === value, () => handleOptionClick('fanLightsSufficient', value), `fanlights-${value}`)
            )}
          </div>
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

      <div className="form-actions">
        <button className="cancel-button" onClick={handleCancel}>Cancel</button>
        <button className="save-button" onClick={handleSave}>
          {isSurveySaved ? 'Update Survey' : 'Save Survey'}
        </button>
      </div>
    </div>
  );
};

export default FireDoorSurveyForm; 
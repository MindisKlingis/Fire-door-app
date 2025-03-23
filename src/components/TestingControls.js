import React, { useState } from 'react';
import './TestingControls.css';

const TestingControls = () => {
  const [formData, setFormData] = useState({
    // Selection-Based Controls
    doorType: '',
    doorMaterial: '',
    multipleDefects: [],
    doorPriority: 1,
    isEmergencyExit: false,
    riskLevel: 'medium',
    complianceStatus: [],
    
    // Text-Based Controls
    locationNotes: '',
    defectDescription: '',
    searchQuery: '',
    suggestedLocation: '',
    
    // Numeric & Data Controls
    doorNumber: '',
    inspectionDate: '',
    inspectionTime: '',
    gapMeasurement: 0,
    temperatureReading: 20,
    
    // Specialized Controls
    doorPhoto: null,
    doorLocation: { lat: '', lng: '' },
    signature: null,
    sketchData: null,
    colorCode: '#FF0000',
    
    // Rating Controls
    fireRating: 3,
    conditionRating: 2,
    
    // Advanced Controls
    maintenanceSchedule: 'monthly',
    accessibilityFeatures: {
      autoClose: false,
      holdOpen: false,
      powerAssist: false
    },
    
    // AI Suggestions
    defectSuggestions: []
  });

  // Simulated location suggestions
  const locationSuggestions = [
    'Main Entrance',
    'Fire Exit A',
    'Stairwell B',
    'Emergency Exit',
    'Kitchen Access',
    'Loading Bay'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (value) => {
    setFormData(prev => ({
      ...prev,
      multipleDefects: prev.multipleDefects.includes(value)
        ? prev.multipleDefects.filter(item => item !== value)
        : [...prev.multipleDefects, value]
    }));
  };

  const handleAccessibilityChange = (feature) => {
    setFormData(prev => ({
      ...prev,
      accessibilityFeatures: {
        ...prev.accessibilityFeatures,
        [feature]: !prev.accessibilityFeatures[feature]
      }
    }));
  };

  const handleComplianceChange = (value) => {
    setFormData(prev => ({
      ...prev,
      complianceStatus: prev.complianceStatus.includes(value)
        ? prev.complianceStatus.filter(item => item !== value)
        : [...prev.complianceStatus, value]
    }));
  };

  return (
    <div className="testing-controls">
      <h2>Fire Door Survey Controls Testing</h2>

      {/* 1. Selection-Based Controls */}
      <section className="control-section">
        <h3>Selection-Based Controls</h3>
        
        {/* Single Selection - Radio Buttons */}
        <div className="control-group">
          <label>Door Type:</label>
          <div className="radio-group">
            {['Single', 'Double', 'Leaf & half'].map(type => (
              <label key={type} className="radio-label">
                <input
                  type="radio"
                  name="doorType"
                  value={type}
                  checked={formData.doorType === type}
                  onChange={(e) => handleInputChange('doorType', e.target.value)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        {/* Single Selection - Dropdown */}
        <div className="control-group">
          <label>Door Material:</label>
          <select
            value={formData.doorMaterial}
            onChange={(e) => handleInputChange('doorMaterial', e.target.value)}
          >
            <option value="">Select Material</option>
            <option value="timber">Timber-Based Door Set</option>
            <option value="composite">Composite Door Set</option>
            <option value="metal">Metal Door Set</option>
          </select>
        </div>

        {/* Multiple Selection - Checkboxes */}
        <div className="control-group">
          <label>Door Defects:</label>
          <div className="checkbox-group">
            {['Hinges', 'Frame', 'Glazing', 'Seals'].map(defect => (
              <label key={defect} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.multipleDefects.includes(defect)}
                  onChange={() => handleMultiSelect(defect)}
                />
                {defect}
              </label>
            ))}
          </div>
        </div>

        {/* Ranked Choice - Slider */}
        <div className="control-group">
          <label>Door Priority (1-5):</label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.doorPriority}
            onChange={(e) => handleInputChange('doorPriority', parseInt(e.target.value))}
          />
          <span>Priority: {formData.doorPriority}</span>
        </div>

        {/* Binary Choice - Toggle */}
        <div className="control-group">
          <label>Emergency Exit:</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={formData.isEmergencyExit}
              onChange={(e) => handleInputChange('isEmergencyExit', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </section>

      {/* 2. Text-Based Controls */}
      <section className="control-section">
        <h3>Text-Based Controls</h3>
        
        {/* Short Text Input */}
        <div className="control-group">
          <label>Location Notes:</label>
          <input
            type="text"
            value={formData.locationNotes}
            onChange={(e) => handleInputChange('locationNotes', e.target.value)}
            placeholder="Enter brief location details"
          />
        </div>

        {/* Long Text Input */}
        <div className="control-group">
          <label>Defect Description:</label>
          <textarea
            value={formData.defectDescription}
            onChange={(e) => handleInputChange('defectDescription', e.target.value)}
            placeholder="Describe any defects in detail"
            rows="4"
          />
        </div>
      </section>

      {/* 3. Numeric & Data Controls */}
      <section className="control-section">
        <h3>Numeric & Data Controls</h3>
        
        {/* Number Input */}
        <div className="control-group">
          <label>Door Number:</label>
          <input
            type="number"
            value={formData.doorNumber}
            onChange={(e) => handleInputChange('doorNumber', e.target.value)}
            placeholder="Enter door number"
          />
        </div>

        {/* Date Input */}
        <div className="control-group">
          <label>Inspection Date:</label>
          <input
            type="date"
            value={formData.inspectionDate}
            onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
          />
        </div>

        {/* Time Input */}
        <div className="control-group">
          <label>Inspection Time:</label>
          <input
            type="time"
            value={formData.inspectionTime}
            onChange={(e) => handleInputChange('inspectionTime', e.target.value)}
          />
        </div>

        {/* Measurement Input with Spinner */}
        <div className="control-group">
          <label>Gap Measurement (mm):</label>
          <input
            type="number"
            value={formData.gapMeasurement}
            onChange={(e) => handleInputChange('gapMeasurement', parseFloat(e.target.value))}
            step="0.1"
            min="0"
            max="50"
          />
        </div>
      </section>

      {/* 4. Specialized Controls */}
      <section className="control-section">
        <h3>Specialized Controls</h3>
        
        {/* File Upload */}
        <div className="control-group">
          <label>Door Photo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleInputChange('doorPhoto', e.target.files[0])}
          />
        </div>

        {/* Location Input */}
        <div className="control-group">
          <label>Door Location:</label>
          <div className="location-inputs">
            <input
              type="text"
              placeholder="Latitude"
              value={formData.doorLocation.lat}
              onChange={(e) => handleInputChange('doorLocation', { ...formData.doorLocation, lat: e.target.value })}
            />
            <input
              type="text"
              placeholder="Longitude"
              value={formData.doorLocation.lng}
              onChange={(e) => handleInputChange('doorLocation', { ...formData.doorLocation, lng: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* New: Risk Assessment Controls */}
      <section className="control-section">
        <h3>Risk Assessment Controls</h3>
        
        {/* Segmented Control */}
        <div className="control-group">
          <label>Risk Level:</label>
          <div className="segmented-control">
            {['low', 'medium', 'high'].map(level => (
              <button
                key={level}
                className={`segment ${formData.riskLevel === level ? 'active' : ''}`}
                onClick={() => handleInputChange('riskLevel', level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Star Rating */}
        <div className="control-group">
          <label>Fire Rating (1-5):</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star ${formData.fireRating >= star ? 'filled' : ''}`}
                onClick={() => handleInputChange('fireRating', star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="control-group">
          <label>Compliance Status:</label>
          <div className="compliance-checklist">
            {['Fire Safety', 'Building Code', 'Insurance', 'Accessibility'].map(item => (
              <label key={item} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.complianceStatus.includes(item)}
                  onChange={() => handleComplianceChange(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* New: Advanced Measurements */}
      <section className="control-section">
        <h3>Advanced Measurements</h3>
        
        {/* Temperature Slider */}
        <div className="control-group">
          <label>Temperature Reading (°C):</label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.temperatureReading}
            onChange={(e) => handleInputChange('temperatureReading', parseInt(e.target.value))}
          />
          <span>{formData.temperatureReading}°C</span>
        </div>

        {/* Color Picker */}
        <div className="control-group">
          <label>Color Code:</label>
          <input
            type="color"
            value={formData.colorCode}
            onChange={(e) => handleInputChange('colorCode', e.target.value)}
          />
        </div>
      </section>

      {/* New: Accessibility Features */}
      <section className="control-section">
        <h3>Accessibility Features</h3>
        
        {/* Feature Toggles */}
        <div className="control-group">
          <div className="feature-toggles">
            {Object.entries(formData.accessibilityFeatures).map(([feature, enabled]) => (
              <label key={feature} className="toggle-switch">
                <span className="toggle-label">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => handleAccessibilityChange(feature)}
                />
                <span className="toggle-slider"></span>
              </label>
            ))}
          </div>
        </div>

        {/* Maintenance Schedule */}
        <div className="control-group">
          <label>Maintenance Schedule:</label>
          <select
            value={formData.maintenanceSchedule}
            onChange={(e) => handleInputChange('maintenanceSchedule', e.target.value)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
      </section>

      {/* New: Smart Input with Autocomplete */}
      <section className="control-section">
        <h3>Smart Inputs</h3>
        
        {/* Location Autocomplete */}
        <div className="control-group">
          <label>Location Search:</label>
          <div className="autocomplete-wrapper">
            <input
              type="text"
              value={formData.searchQuery}
              onChange={(e) => {
                handleInputChange('searchQuery', e.target.value);
                // Show suggestions based on input
              }}
              placeholder="Search for location..."
            />
            {formData.searchQuery && (
              <div className="suggestions-list">
                {locationSuggestions
                  .filter(loc => loc.toLowerCase().includes(formData.searchQuery.toLowerCase()))
                  .map(suggestion => (
                    <div
                      key={suggestion}
                      className="suggestion-item"
                      onClick={() => {
                        handleInputChange('suggestedLocation', suggestion);
                        handleInputChange('searchQuery', '');
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
              </div>
            )}
          </div>
          {formData.suggestedLocation && (
            <div className="selected-location">
              Selected: {formData.suggestedLocation}
            </div>
          )}
        </div>

        {/* Sketch Pad */}
        <div className="control-group">
          <label>Quick Sketch:</label>
          <div 
            className="sketch-pad"
            style={{ 
              border: '1px solid #ddd',
              borderRadius: '4px',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <p>Sketch Pad Placeholder</p>
            {/* Would implement actual drawing functionality with canvas */}
          </div>
        </div>
      </section>

      {/* Display Form Data */}
      <section className="control-section">
        <h3>Form Data Preview</h3>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </section>
    </div>
  );
};

export default TestingControls; 
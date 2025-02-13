import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoUpload from './PhotoUpload';
import InputField from './InputField';
import './SurveyForm.css';

const SurveyForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    doorId: '',
    location: {
      text: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    },
    fireResistanceRating: '',
    complianceStatus: '',
    inspectionDate: new Date().toISOString().split('T')[0],
    conditionDetails: '',
    inspectorName: '',
    followUpActions: '',
    photos: []
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Get current location if available
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            }
          }));
        },
        (error) => console.log('Error getting location:', error)
      );
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.doorId) newErrors.doorId = 'Door ID is required';
    if (!formData.location.text) newErrors.locationText = 'Location is required';
    if (!formData.fireResistanceRating) newErrors.fireResistanceRating = 'Fire resistance rating is required';
    if (!formData.complianceStatus) newErrors.complianceStatus = 'Compliance status is required';
    if (!formData.inspectionDate) newErrors.inspectionDate = 'Inspection date is required';
    if (!formData.conditionDetails) newErrors.conditionDetails = 'Condition details are required';
    if (!formData.inspectorName) newErrors.inspectorName = 'Inspector name is required';
    if (formData.complianceStatus === 'Non-compliant' && !formData.followUpActions) {
      newErrors.followUpActions = 'Follow-up actions are required for non-compliant status';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to submit survey');

      const data = await response.json();
      navigate('/confirmation', { state: { surveyId: data._id } });
    } catch (error) {
      console.error('Error submitting survey:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit survey. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (photos) => {
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...photos]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="survey-form">
      <h2>Fire Door Survey Form</h2>

      <InputField
        label="Door ID"
        type="text"
        name="doorId"
        value={formData.doorId}
        onChange={handleInputChange}
        error={errors.doorId}
        required
      />

      <InputField
        label="Location"
        type="text"
        name="location.text"
        value={formData.location.text}
        onChange={handleInputChange}
        error={errors.locationText}
        required
      />

      <div className="form-group">
        <label>Fire Resistance Rating</label>
        <select
          name="fireResistanceRating"
          value={formData.fireResistanceRating}
          onChange={handleInputChange}
          className={errors.fireResistanceRating ? 'error' : ''}
        >
          <option value="">Select Rating</option>
          <option value="20 min">20 min</option>
          <option value="30 min">30 min</option>
          <option value="45 min">45 min</option>
          <option value="60 min">60 min</option>
          <option value="90 min">90 min</option>
          <option value="120 min">120 min</option>
        </select>
        {errors.fireResistanceRating && <span className="error-message">{errors.fireResistanceRating}</span>}
      </div>

      <div className="form-group">
        <label>Compliance Status</label>
        <select
          name="complianceStatus"
          value={formData.complianceStatus}
          onChange={handleInputChange}
          className={errors.complianceStatus ? 'error' : ''}
        >
          <option value="">Select Status</option>
          <option value="Compliant">Compliant</option>
          <option value="Non-compliant">Non-compliant</option>
        </select>
        {errors.complianceStatus && <span className="error-message">{errors.complianceStatus}</span>}
      </div>

      <InputField
        label="Inspection Date"
        type="date"
        name="inspectionDate"
        value={formData.inspectionDate}
        onChange={handleInputChange}
        error={errors.inspectionDate}
        required
      />

      <div className="form-group">
        <label>Condition Details</label>
        <textarea
          name="conditionDetails"
          value={formData.conditionDetails}
          onChange={handleInputChange}
          className={errors.conditionDetails ? 'error' : ''}
          rows="4"
        />
        {errors.conditionDetails && <span className="error-message">{errors.conditionDetails}</span>}
      </div>

      <InputField
        label="Inspector Name"
        type="text"
        name="inspectorName"
        value={formData.inspectorName}
        onChange={handleInputChange}
        error={errors.inspectorName}
        required
      />

      {formData.complianceStatus === 'Non-compliant' && (
        <div className="form-group">
          <label>Follow-up Actions</label>
          <textarea
            name="followUpActions"
            value={formData.followUpActions}
            onChange={handleInputChange}
            className={errors.followUpActions ? 'error' : ''}
            rows="4"
          />
          {errors.followUpActions && <span className="error-message">{errors.followUpActions}</span>}
        </div>
      )}

      <PhotoUpload onUpload={handlePhotoUpload} />

      {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Submitting...' : 'Submit Survey'}
      </button>
    </form>
  );
};

export default SurveyForm; 
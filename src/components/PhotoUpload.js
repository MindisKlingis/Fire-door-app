import React, { useState, useRef } from 'react';
import './PhotoUpload.css';

const API_BASE_URL = 'http://localhost:5001';

const PhotoUpload = ({ onUpload, photoTypes, uploadedPhotos, isSurveySaved, surveyId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Create individual refs for each photo type
  const frontDoorRef = useRef(null);
  const topLeafRef = useRef(null);
  const topLeafDoubleRef = useRef(null);
  const strips1Ref = useRef(null);
  const strips2Ref = useRef(null);
  const faults3Ref = useRef(null);
  const faults4Ref = useRef(null);
  const faults5Ref = useRef(null);

  // Map photo types to their corresponding refs
  const fileInputRefs = {
    [photoTypes.FRONT_DOOR]: frontDoorRef,
    [photoTypes.TOP_LEAF]: topLeafRef,
    [photoTypes.TOP_LEAF_DOUBLE]: topLeafDoubleRef,
    [photoTypes.STRIPS_1]: strips1Ref,
    [photoTypes.STRIPS_2]: strips2Ref,
    [photoTypes.FAULTS_3]: faults3Ref,
    [photoTypes.FAULTS_4]: faults4Ref,
    [photoTypes.FAULTS_5]: faults5Ref
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return `${file.name}: Only JPG, PNG, and GIF files are allowed`;
    }
    if (file.size > 5 * 1024 * 1024) {
      return `${file.name}: File size must be less than 5MB`;
    }
    return null;
  };

  const handleFiles = async (files, photoType = null) => {
    if (!isSurveySaved) {
      setError('Please save the survey before uploading photos');
      return;
    }

    if (!surveyId) {
      setError('Survey ID is required for photo upload');
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('photos', file);
      formData.append('photoType', photoType || file.name);

      const response = await fetch(`http://localhost:5001/api/surveys/${surveyId}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to upload photo');
      }

      setUploadProgress(100);
      onUpload(photoType || file.name, file);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e, photoType) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files, photoType);
    }
  };

  const triggerFileInput = (photoType) => {
    fileInputRefs[photoType]?.current?.click();
  };

  const getPhotoTypeLabel = (type) => {
    return type
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div className="photo-upload-container">
      <h3>Photos</h3>
      
      {!isSurveySaved && (
        <div className="info-message">
          Please save the survey before uploading photos
        </div>
      )}

      {error && (
        <div className="error-message">
          {error.split('\n').map((err, index) => (
            <div key={index}>{err}</div>
          ))}
        </div>
      )}

      <div className="photo-sections">
        {/* Front Door Photos */}
        <div className="photo-section">
          <h4>Door Photos</h4>
          <div className="photo-grid">
            {[photoTypes.FRONT_DOOR, photoTypes.TOP_LEAF, photoTypes.TOP_LEAF_DOUBLE].map((type) => (
              <div key={type} className="photo-upload-item">
                <input
                  type="file"
                  ref={fileInputRefs[type]}
                  onChange={(e) => handleChange(e, type)}
                  accept="image/jpeg,image/png,image/gif"
                  style={{ display: 'none' }}
                  disabled={!isSurveySaved}
                />
                <button
                  type="button"
                  className="photo-upload-button"
                  onClick={() => triggerFileInput(type)}
                  disabled={!isSurveySaved}
                >
                  <span className="upload-icon">📸</span>
                  <span className="upload-label">{getPhotoTypeLabel(type)}</span>
                  {uploadedPhotos[type] && <span className="upload-success">✓</span>}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Strips Photos */}
        <div className="photo-section">
          <h4>Strips Photos</h4>
          <div className="photo-grid">
            {[photoTypes.STRIPS_1, photoTypes.STRIPS_2].map((type) => (
              <div key={type} className="photo-upload-item">
                <input
                  type="file"
                  ref={fileInputRefs[type]}
                  onChange={(e) => handleChange(e, type)}
                  accept="image/jpeg,image/png,image/gif"
                  style={{ display: 'none' }}
                  disabled={!isSurveySaved}
                />
                <button
                  type="button"
                  className="photo-upload-button"
                  onClick={() => triggerFileInput(type)}
                  disabled={!isSurveySaved}
                >
                  <span className="upload-icon">📸</span>
                  <span className="upload-label">{getPhotoTypeLabel(type)}</span>
                  {uploadedPhotos[type] && <span className="upload-success">✓</span>}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Faults Photos */}
        <div className="photo-section">
          <h4>Additional Faults</h4>
          <div className="photo-grid">
            {[photoTypes.FAULTS_3, photoTypes.FAULTS_4, photoTypes.FAULTS_5].map((type) => (
              <div key={type} className="photo-upload-item">
                <input
                  type="file"
                  ref={fileInputRefs[type]}
                  onChange={(e) => handleChange(e, type)}
                  accept="image/jpeg,image/png,image/gif"
                  style={{ display: 'none' }}
                  disabled={!isSurveySaved}
                />
                <button
                  type="button"
                  className="photo-upload-button"
                  onClick={() => triggerFileInput(type)}
                  disabled={!isSurveySaved}
                >
                  <span className="upload-icon">📸</span>
                  <span className="upload-label">{getPhotoTypeLabel(type)}</span>
                  {uploadedPhotos[type] && <span className="upload-success">✓</span>}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-message">
            {uploading ? (
              <>
                <p>Uploading...</p>
                {uploadProgress > 0 && (
                  <div className="upload-progress">
                    <div 
                      className="upload-progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <p>Drag and drop additional photos here</p>
                <p className="upload-hint">Supports: JPG, PNG, GIF (max 5MB each)</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload; 
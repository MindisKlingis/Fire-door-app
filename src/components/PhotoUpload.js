import React, { useState, useRef } from 'react';
import './PhotoUpload.css';

const API_BASE_URL = 'http://localhost:5001';

const PhotoUpload = ({ onUpload, isSurveySaved, surveyId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

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

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress > 90) {
        clearInterval(interval);
        return;
      }
      setUploadProgress(Math.min(progress, 90));
    }, 500);
    return interval;
  };

  const handleFiles = async (files) => {
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

    const progressInterval = simulateProgress();

    try {
      // Store the file temporarily if no surveyId exists
      if (!surveyId) {
        const fileUrl = URL.createObjectURL(file);
        onUpload(file.name, file);
        setUploadProgress(100);
        return;
      }

      const formData = new FormData();
      formData.append('photos', file);
      formData.append('photoType', file.name);

      const response = await fetch(`${API_BASE_URL}/api/surveys/${surveyId}/photos`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to upload photo');
      }

      setUploadProgress(100);
      onUpload(file.name, file);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      clearInterval(progressInterval);
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

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="photo-upload-container">
      <h3>Photos</h3>
      
      {error && (
        <div className="error-message">
          {error.split('\n').map((err, index) => (
            <div key={index}>{err}</div>
          ))}
        </div>
      )}

      <div className="photo-sections">
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="file-input"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <div className="upload-message">
            {uploading ? (
              <>
                <p>
                  <span className="upload-icon">📤</span>
                  Uploading...
                </p>
                {uploadProgress > 0 && (
                  <div className="upload-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <p>
                  <span className="upload-icon">📸</span>
                  Drag and drop photos here or click to browse
                </p>
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
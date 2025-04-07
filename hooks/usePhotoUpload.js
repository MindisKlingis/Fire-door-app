import { useState, useCallback } from 'react';
import { uploadSurveyPhoto } from '../api/surveyApi';

const usePhotoUpload = (onUploadComplete) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  const handlePhotoUpload = useCallback(async (photoType, file) => {
    if (!file) return;

    setUploadProgress(prev => ({
      ...prev,
      [photoType]: 0
    }));
    setUploadErrors(prev => ({
      ...prev,
      [photoType]: null
    }));

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('photoType', photoType);

      const response = await uploadSurveyPhoto(formData, (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [photoType]: progress
        }));
      });

      if (response.success) {
        setUploadProgress(prev => ({
          ...prev,
          [photoType]: 100
        }));
        onUploadComplete?.(photoType, response.url);
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      setUploadErrors(prev => ({
        ...prev,
        [photoType]: error.message
      }));
      setUploadProgress(prev => ({
        ...prev,
        [photoType]: 0
      }));
    }
  }, [onUploadComplete]);

  const resetUpload = useCallback((photoType, index) => {
    setUploadProgress(prev => ({
      ...prev,
      [photoType]: 0
    }));
    setUploadErrors(prev => ({
      ...prev,
      [photoType]: null
    }));
  }, []);

  return {
    uploadProgress,
    uploadErrors,
    handlePhotoUpload,
    resetUpload
  };
};

export default usePhotoUpload; 
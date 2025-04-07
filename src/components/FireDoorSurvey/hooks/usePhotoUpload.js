import { useState, useCallback } from 'react';
import { uploadSurveyPhoto, deletePhoto } from '../../../api/surveyApi';

const usePhotoUpload = () => {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleUpload = useCallback(async (file) => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const onProgress = (progress) => {
        setUploadProgress(progress);
      };

      const result = await uploadSurveyPhoto(formData, onProgress);

      if (result.success) {
        setPhotos(prev => [...prev, {
          id: Date.now(), // temporary ID for demo
          url: result.url,
          name: file.name
        }]);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Photo upload error:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const removePhoto = useCallback(async (photoId) => {
    try {
      await deletePhoto(photoId);
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    } catch (err) {
      setError(err.message);
      console.error('Photo deletion error:', err);
    }
  }, []);

  return {
    photos,
    isUploading,
    uploadProgress,
    error,
    handleUpload,
    removePhoto
  };
};

export default usePhotoUpload; 
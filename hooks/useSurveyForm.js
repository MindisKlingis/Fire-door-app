import { useState, useCallback } from 'react';
import { DEFECT_OPTIONS } from '../constants/formConstants';

const useSurveyForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    
    setFormData(prev => {
      // Handle nested object paths (e.g., 'measurements.doorWidth')
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      
      return {
        ...prev,
        [name]: value
      };
    });
  }, []);

  const handleDefectToggle = useCallback((defectId) => {
    setFormData(prev => {
      const defects = [...prev.defects];
      const index = defects.indexOf(defectId);
      
      if (index === -1) {
        defects.push(defectId);
      } else {
        defects.splice(index, 1);
      }
      
      return {
        ...prev,
        defects
      };
    });
  }, []);

  const handlePhotoChange = useCallback((photoType, file) => {
    setFormData(prev => {
      if (Array.isArray(prev.photos[photoType])) {
        return {
          ...prev,
          photos: {
            ...prev.photos,
            [photoType]: [...prev.photos[photoType], file]
          }
        };
      }
      
      return {
        ...prev,
        photos: {
          ...prev.photos,
          [photoType]: file
        }
      };
    });
  }, []);

  const removePhoto = useCallback((photoType, index) => {
    setFormData(prev => {
      if (Array.isArray(prev.photos[photoType])) {
        const updatedPhotos = [...prev.photos[photoType]];
        updatedPhotos.splice(index, 1);
        return {
          ...prev,
          photos: {
            ...prev.photos,
            [photoType]: updatedPhotos
          }
        };
      }
      
      return {
        ...prev,
        photos: {
          ...prev.photos,
          [photoType]: null
        }
      };
    });
  }, []);

  const getDefectLabel = useCallback((defectId) => {
    for (const category of Object.values(DEFECT_OPTIONS)) {
      const defect = category.find(d => d.id === defectId);
      if (defect) return defect.label;
    }
    return defectId;
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
  }, [initialState]);

  return {
    formData,
    setFormData,
    handleInputChange,
    handleDefectToggle,
    handlePhotoChange,
    removePhoto,
    getDefectLabel,
    resetForm
  };
};

export default useSurveyForm; 
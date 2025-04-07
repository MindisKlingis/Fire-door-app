import { useState, useCallback, useEffect } from 'react';
import { debounce, serializeFormData, deserializeFormData } from '../utils/formHelpers';

const STORAGE_KEY = 'fireDoorSurveyFormData';
const AUTOSAVE_DELAY = 1000;

const useFormState = (initialState = {}) => {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        return {
          ...initialState,
          ...deserializeFormData(savedData)
        };
      } catch (error) {
        console.error('Error loading saved form data:', error);
        return initialState;
      }
    }
    return initialState;
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Debounced save function
  const saveToLocalStorage = useCallback(
    debounce((data) => {
      try {
        localStorage.setItem(STORAGE_KEY, serializeFormData(data));
        setLastSaved(new Date());
        setIsDirty(false);
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }, AUTOSAVE_DELAY),
    []
  );

  // Update form data and trigger save
  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when field is updated
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
    setIsDirty(true);
    saveToLocalStorage(formData);
  }, [formData, saveToLocalStorage]);

  const validateField = useCallback((field, value) => {
    let error = null;
    
    // Add your validation rules here
    if (!value && value !== 0) {
      error = 'This field is required';
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return !error;
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.entries(formData).forEach(([field, value]) => {
      if (!validateField(field, value)) {
        isValid = false;
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Field-level update
  const updateField = useCallback((fieldName, value) => {
    updateFormData(fieldName, value);
  }, [updateFormData]);

  // Array field updates
  const updateArrayField = useCallback((fieldName, index, value) => {
    updateFormData(fieldName, formData[fieldName].map((item, i) => 
      i === index ? value : item
    ));
  }, [formData, updateFormData]);

  // Add item to array field
  const addToArrayField = useCallback((fieldName, item) => {
    updateFormData(fieldName, [...(formData[fieldName] || []), item]);
  }, [formData, updateFormData]);

  // Remove item from array field
  const removeFromArrayField = useCallback((fieldName, index) => {
    updateFormData(fieldName, formData[fieldName].filter((_, i) => i !== index));
  }, [formData, updateFormData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
    setIsDirty(false);
    setLastSaved(null);
    localStorage.removeItem(STORAGE_KEY);
  }, [initialState]);

  // Save form data when component unmounts
  useEffect(() => {
    return () => {
      if (isDirty) {
        saveToLocalStorage.flush();
      }
    };
  }, [isDirty, saveToLocalStorage]);

  return {
    formData,
    errors,
    isSubmitting,
    isDirty,
    lastSaved,
    updateFormData,
    updateField,
    updateArrayField,
    addToArrayField,
    removeFromArrayField,
    resetForm,
    validateField,
    validateForm,
    clearErrors,
    setIsSubmitting,
    setFormData,
    setErrors,
    setIsDirty,
    setLastSaved
  };
};

export default useFormState; 
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
  const updateFormData = useCallback((updates) => {
    setFormData(prev => {
      const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      setIsDirty(true);
      saveToLocalStorage(newData);
      return newData;
    });
  }, [saveToLocalStorage]);

  // Field-level update
  const updateField = useCallback((fieldName, value) => {
    updateFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, [updateFormData]);

  // Array field updates
  const updateArrayField = useCallback((fieldName, index, value) => {
    updateFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => 
        i === index ? value : item
      )
    }));
  }, [updateFormData]);

  // Add item to array field
  const addToArrayField = useCallback((fieldName, item) => {
    updateFormData(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), item]
    }));
  }, [updateFormData]);

  // Remove item from array field
  const removeFromArrayField = useCallback((fieldName, index) => {
    updateFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  }, [updateFormData]);

  // Reset form
  const resetForm = useCallback((newInitialState = initialState) => {
    setFormData(newInitialState);
    setIsDirty(false);
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
    updateFormData,
    updateField,
    updateArrayField,
    addToArrayField,
    removeFromArrayField,
    resetForm,
    isDirty,
    lastSaved
  };
};

export default useFormState; 
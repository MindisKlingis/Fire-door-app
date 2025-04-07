import { useState, useCallback } from 'react';
import { VALIDATION_RULES } from '../constants/formConstants';

const useFormValidation = () => {
  const [errors, setErrors] = useState({});

  const validateField = useCallback((fieldName, value) => {
    // Check required fields
    if (VALIDATION_RULES.required[fieldName] && !value) {
      return 'This field is required';
    }

    // Check measurements
    if (fieldName.startsWith('measurements.')) {
      const measurementField = fieldName.split('.')[1];
      const rules = VALIDATION_RULES.measurements[measurementField];
      
      if (rules && value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          return 'Please enter a valid number';
        }
        if (numValue < rules.min) {
          return `Value must be at least ${rules.min}`;
        }
        if (numValue > rules.max) {
          return `Value must not exceed ${rules.max}`;
        }
      }
    }

    // Check max length
    if (VALIDATION_RULES.maxLength[fieldName] && value) {
      const maxLength = VALIDATION_RULES.maxLength[fieldName];
      if (value.length > maxLength) {
        return `Maximum length is ${maxLength} characters`;
      }
    }

    return null;
  }, []);

  const validateForm = useCallback((formData) => {
    const newErrors = {};
    let isValid = true;

    // Validate required fields
    Object.keys(VALIDATION_RULES.required).forEach(fieldName => {
      const value = fieldName.includes('.')
        ? fieldName.split('.').reduce((obj, key) => obj?.[key], formData)
        : formData[fieldName];
      
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    // Validate measurements
    Object.keys(formData.measurements || {}).forEach(measurementField => {
      const fieldName = `measurements.${measurementField}`;
      const value = formData.measurements[measurementField];
      
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    // Validate text lengths
    Object.keys(VALIDATION_RULES.maxLength).forEach(fieldName => {
      const value = fieldName.includes('.')
        ? fieldName.split('.').reduce((obj, key) => obj?.[key], formData)
        : formData[fieldName];
      
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField]);

  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    errors,
    validateForm,
    validateField,
    clearFieldError
  };
};

export default useFormValidation; 
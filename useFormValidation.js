import { useState, useCallback } from 'react';
import { VALIDATION_MESSAGES } from '../constants/surveyConstants';

const useFormValidation = (initialErrors = {}) => {
  const [errors, setErrors] = useState(initialErrors);

  const validateField = useCallback((fieldName, value, rules = {}) => {
    const fieldErrors = [];

    if (rules.required && !value) {
      fieldErrors.push(VALIDATION_MESSAGES.REQUIRED);
    }

    if (rules.numeric && value && !/^\d+$/.test(value)) {
      fieldErrors.push(VALIDATION_MESSAGES.NUMERIC_ONLY);
    }

    if (rules.measurement && value) {
      const num = parseFloat(value);
      if (isNaN(num) || num < rules.min || num > rules.max) {
        fieldErrors.push(VALIDATION_MESSAGES.INVALID_MEASUREMENT);
      }
    }

    if (rules.custom && !rules.custom(value)) {
      fieldErrors.push(rules.customMessage || VALIDATION_MESSAGES.INVALID_FORMAT);
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }));

    return fieldErrors.length === 0;
  }, []);

  const validateForm = useCallback((formData, validationRules) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const value = formData[fieldName];
      const rules = validationRules[fieldName];
      
      const fieldIsValid = validateField(fieldName, value, rules);
      if (!fieldIsValid) {
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validateField]);

  const clearErrors = useCallback((fieldName) => {
    if (fieldName) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: []
      }));
    } else {
      setErrors({});
    }
  }, []);

  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: Array.isArray(error) ? error : [error]
    }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    setFieldError
  };
};

export default useFormValidation; 
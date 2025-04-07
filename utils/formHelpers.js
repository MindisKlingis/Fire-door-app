import { MEASUREMENT_TYPES } from '../constants/formConstants';

export const formatMeasurement = (value, type) => {
  if (!value) return '';
  
  const num = parseFloat(value);
  if (isNaN(num)) return value;

  switch (type) {
    case MEASUREMENT_TYPES.GAP:
      return `${num.toFixed(1)}mm`;
    case MEASUREMENT_TYPES.THICKNESS:
      return `${num}mm`;
    case MEASUREMENT_TYPES.WIDTH:
    case MEASUREMENT_TYPES.HEIGHT:
      return `${num}mm`;
    default:
      return value;
  }
};

export const parseMeasurement = (value) => {
  if (!value) return '';
  return value.replace(/[^\d.]/g, '');
};

export const generateSummary = (formData) => {
  const summary = [];

  if (formData.doorType) {
    summary.push(`Door Type: ${formData.doorType}`);
  }

  if (formData.location) {
    summary.push(`Location: ${formData.location}`);
  }

  if (formData.defects && formData.defects.length > 0) {
    summary.push(`Defects Found: ${formData.defects.length}`);
  }

  if (formData.condition?.overall) {
    summary.push(`Condition: ${formData.condition.overall}`);
  }

  return summary.join(' | ');
};

export const validateMeasurements = (measurements, rules) => {
  const errors = {};

  Object.entries(measurements).forEach(([field, value]) => {
    if (!value) return;

    const rule = rules[field];
    if (!rule) return;

    const num = parseFloat(value);
    if (isNaN(num)) {
      errors[field] = 'Please enter a valid number';
    } else if (num < rule.min) {
      errors[field] = `Value must be at least ${rule.min}`;
    } else if (num > rule.max) {
      errors[field] = `Value must not exceed ${rule.max}`;
    }
  });

  return errors;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const serializeFormData = (formData) => {
  return JSON.stringify(formData, (key, value) => {
    if (value instanceof File) {
      return {
        type: 'File',
        name: value.name,
        size: value.size,
        lastModified: value.lastModified
      };
    }
    return value;
  });
};

export const deserializeFormData = (serializedData) => {
  return JSON.parse(serializedData, (key, value) => {
    if (value && value.type === 'File') {
      // Return a placeholder for File objects since we can't recreate them
      return {
        name: value.name,
        size: value.size,
        lastModified: value.lastModified
      };
    }
    return value;
  });
}; 
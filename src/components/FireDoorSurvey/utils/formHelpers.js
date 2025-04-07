import { DEFECT_CATEGORIES, MEASUREMENT_TYPES } from '../constants/surveyConstants';

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

export const categorizeDefects = (defects) => {
  return Object.values(DEFECT_CATEGORIES).reduce((acc, category) => {
    acc[category] = defects.filter(defect => defect.category === category);
    return acc;
  }, {});
};

export const validateMeasurement = (value, { min, max }) => {
  if (!value) return true;
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
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

  return summary.join(' | ');
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
      // Return a placeholder for File objects
      return {
        name: value.name,
        size: value.size,
        lastModified: value.lastModified
      };
    }
    return value;
  });
}; 
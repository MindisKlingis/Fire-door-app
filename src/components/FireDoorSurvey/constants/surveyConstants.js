export const API_BASE_URL = 'http://localhost:5001';

export const PHOTO_TYPES = {
  DOOR: 'doorPicture',
  DEFECT: 'defectPicture',
  OTHER: 'otherPicture'
};

export const COMMON_THICKNESS_VALUES = ['44', '54', '58'];

export const FLOOR_OPTIONS = [
  { value: 'Basement', label: 'Basement' },
  { value: 'Ground Floor', label: 'Ground Floor' },
  ...Array.from({ length: 20 }, (_, i) => ({
    value: `${i + 1}`,
    label: `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} Floor`
  }))
];

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  NUMERIC_ONLY: 'Please enter numbers only',
  INVALID_MEASUREMENT: 'Invalid measurement',
  PHOTO_REQUIRED: 'Photo is required',
  INCOMPLETE_FORM: 'Please complete all required fields'
};

export const DEFECT_CATEGORIES = {
  STRUCTURE: 'structure',
  SEALS: 'seals',
  CLOSURE: 'closure',
  ADDITIONAL: 'additional'
};

export const MEASUREMENT_TYPES = {
  GAP: 'gap',
  THICKNESS: 'thickness',
  WIDTH: 'width',
  HEIGHT: 'height'
}; 
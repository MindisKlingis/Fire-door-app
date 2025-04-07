import React from 'react';
import PropTypes from 'prop-types';
import { Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  label, 
  placeholder,
  error,
  helperText,
  disabled
}) => {
  return (
    <FormControl fullWidth error={!!error} disabled={disabled}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
        placeholder={placeholder}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

CustomSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  disabled: PropTypes.bool
};

CustomSelect.defaultProps = {
  value: '',
  label: '',
  placeholder: '',
  error: false,
  helperText: '',
  disabled: false
};

export default CustomSelect; 
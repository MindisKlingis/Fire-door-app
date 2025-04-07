import React from 'react';
import PropTypes from 'prop-types';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { FLOOR_OPTIONS } from '../constants/surveyConstants';

const FloorSelector = ({ value, onChange, previousFloor, disabled }) => {
  return (
    <FormControl fullWidth disabled={disabled}>
      <InputLabel>Floor</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty
      >
        <MenuItem value="" disabled>
          Select floor
        </MenuItem>
        {FLOOR_OPTIONS.map((option) => (
          <MenuItem 
            key={option.value} 
            value={option.value}
            selected={previousFloor === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

FloorSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  previousFloor: PropTypes.string,
  disabled: PropTypes.bool
};

FloorSelector.defaultProps = {
  value: '',
  previousFloor: '',
  disabled: false
};

export default FloorSelector; 
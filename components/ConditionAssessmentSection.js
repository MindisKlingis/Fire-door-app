import React from 'react';
import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper
} from '@mui/material';
import { CONDITION_OPTIONS, PRIORITY_OPTIONS } from '../../constants/formConstants';

const ConditionAssessmentSection = ({ formData, onChange, errors }) => {
  const { condition } = formData;

  return (
    <Box component={Paper} elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Condition Assessment
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth error={!!errors['condition.overall']}>
          <InputLabel id="overall-condition-label">Overall Condition</InputLabel>
          <Select
            labelId="overall-condition-label"
            id="condition.overall"
            name="condition.overall"
            value={condition.overall}
            label="Overall Condition"
            onChange={onChange}
          >
            {CONDITION_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {errors['condition.overall'] && (
            <FormHelperText>{errors['condition.overall']}</FormHelperText>
          )}
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="priority-label">Priority Level</InputLabel>
          <Select
            labelId="priority-label"
            id="condition.priority"
            name="condition.priority"
            value={condition.priority}
            label="Priority Level"
            onChange={onChange}
          >
            {PRIORITY_OPTIONS.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          id="condition.notes"
          name="condition.notes"
          label="Assessment Notes"
          value={condition.notes}
          onChange={onChange}
          error={!!errors['condition.notes']}
          helperText={errors['condition.notes']}
          placeholder="Enter detailed notes about the door's condition..."
        />
      </Box>

      <Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          id="condition.recommendations"
          name="condition.recommendations"
          label="Recommendations"
          value={condition.recommendations}
          onChange={onChange}
          error={!!errors['condition.recommendations']}
          helperText={errors['condition.recommendations']}
          placeholder="Enter recommendations for maintenance or repairs..."
        />
      </Box>
    </Box>
  );
};

export default ConditionAssessmentSection; 
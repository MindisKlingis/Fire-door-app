import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DEFECT_CATEGORIES, DEFECT_OPTIONS } from '../../constants/formConstants';

const DefectsSection = ({ formData, onDefectToggle, errors }) => {
  const { defects } = formData;

  const renderDefectCategory = (category, defectOptions) => (
    <Accordion key={category} defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${category}-content`}
        id={`${category}-header`}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography sx={{ flexGrow: 1, textTransform: 'capitalize' }}>
            {category}
          </Typography>
          {defectOptions.some(d => defects.includes(d.id)) && (
            <Chip
              size="small"
              color="primary"
              label={defectOptions.filter(d => defects.includes(d.id)).length}
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {defectOptions.map(defect => (
            <FormControlLabel
              key={defect.id}
              control={
                <Checkbox
                  checked={defects.includes(defect.id)}
                  onChange={() => onDefectToggle(defect.id)}
                  name={defect.id}
                />
              }
              label={defect.label}
            />
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box component={Paper} elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Defects
      </Typography>

      {Object.entries(DEFECT_OPTIONS).map(([category, options]) =>
        renderDefectCategory(category, options)
      )}

      {errors.defects && (
        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
          {errors.defects}
        </Typography>
      )}
    </Box>
  );
};

export default DefectsSection; 
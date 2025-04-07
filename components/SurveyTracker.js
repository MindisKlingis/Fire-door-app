import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';

const FORM_SECTIONS = [
  { id: 'general', label: 'General Info' },
  { id: 'measurements', label: 'Measurements' },
  { id: 'defects', label: 'Defects' },
  { id: 'photos', label: 'Photos' },
  { id: 'assessment', label: 'Assessment' }
];

const calculateProgress = (formData) => {
  let completedSteps = 0;
  let totalSteps = FORM_SECTIONS.length;

  // Check General Info
  if (formData.doorType && formData.location && formData.doorReference) {
    completedSteps++;
  }

  // Check Measurements
  const hasMeasurements = Object.values(formData.measurements).some(value => value);
  if (hasMeasurements) {
    completedSteps++;
  }

  // Check Defects
  if (formData.defects.length > 0) {
    completedSteps++;
  }

  // Check Photos
  const hasPhotos = formData.photos.doorFront || formData.photos.doorBack ||
    formData.photos.defects.length > 0 || formData.photos.additional.length > 0;
  if (hasPhotos) {
    completedSteps++;
  }

  // Check Assessment
  if (formData.condition.overall) {
    completedSteps++;
  }

  return (completedSteps / totalSteps) * 100;
};

const SurveyTracker = ({ formData, currentSection }) => {
  const progress = calculateProgress(formData);
  const currentStepIndex = FORM_SECTIONS.findIndex(section => section.id === currentSection);

  return (
    <Box component={Paper} elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Survey Progress
      </Typography>

      <Box sx={{ mb: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4
            }
          }}
        />
        <Typography variant="body2" color="text.secondary" align="right" sx={{ mt: 1 }}>
          {Math.round(progress)}% Complete
        </Typography>
      </Box>

      <Stepper
        activeStep={currentStepIndex}
        alternativeLabel
        sx={{
          '& .MuiStepLabel-root': {
            cursor: 'pointer'
          }
        }}
      >
        {FORM_SECTIONS.map((section) => (
          <Step key={section.id}>
            <StepLabel>{section.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default SurveyTracker; 
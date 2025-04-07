import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Paper, Typography, Grid, Collapse } from '@mui/material';
import useFormState from '../hooks/useFormState';
import { saveSurveyData } from '../../../api/surveyApi';
import './FireDoorSurveyForm.css';

const FireDoorSurveyForm = () => {
  const {
    formData,
    errors,
    isSubmitting,
    updateFormData,
    validateField,
    validateForm,
    clearErrors,
    setIsSubmitting
  } = useFormState({
    // Initial form state
    customerInfo: {},
    doorDetails: {},
    conditionAssessment: {
      structure: [],
      seals: [],
      closure: [],
      additional: []
    },
    photos: [],
    notes: ''
  });

  const [expandedSections, setExpandedSections] = useState({
    customerInfo: true,
    doorDetails: true,
    conditionAssessment: true,
    photos: true,
    notes: true
  });

  const sectionSummaryRef = useRef(null);

  const updateScrollIndicators = () => {
    if (!sectionSummaryRef.current) return;

    const element = sectionSummaryRef.current;
    const canScrollUp = element.scrollTop > 0;
    const canScrollDown = element.scrollTop < (element.scrollHeight - element.clientHeight);

    element.classList.toggle('can-scroll-up', canScrollUp);
    element.classList.toggle('can-scroll-down', canScrollDown);
  };

  useEffect(() => {
    const element = sectionSummaryRef.current;
    if (!element) return;

    // Initial update
    updateScrollIndicators();

    // Update on scroll
    element.addEventListener('scroll', updateScrollIndicators);

    // Update on content changes
    const observer = new MutationObserver(updateScrollIndicators);
    observer.observe(element, { childList: true, subtree: true });

    return () => {
      element.removeEventListener('scroll', updateScrollIndicators);
      observer.disconnect();
    };
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));

    // Reset scroll position when expanding
    if (!expandedSections[section] && sectionSummaryRef.current) {
      sectionSummaryRef.current.scrollTop = 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await saveSurveyData(formData);
      // Handle success (e.g., show success message, redirect)
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionSummary = () => {
    const { conditionAssessment } = formData;
    const defects = [];

    // Flatten all defects into a single array
    Object.values(conditionAssessment).forEach(category => {
      defects.push(...category);
    });

    return defects.map((defect, index) => (
      <Box key={index} sx={{ mb: 1 }}>
        <Typography variant="body2">
          {defect.description}
        </Typography>
      </Box>
    ));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Condition Assessment Summary
        </Typography>
        <Button
          onClick={() => toggleSection('conditionAssessment')}
          fullWidth
          sx={{ mb: 1 }}
        >
          {expandedSections.conditionAssessment ? 'Collapse' : 'Expand'} Summary
        </Button>
        <Collapse in={expandedSections.conditionAssessment}>
          <Box
            ref={sectionSummaryRef}
            className="section-summary"
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              position: 'relative',
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 1
            }}
          >
            {getSectionSummary()}
          </Box>
        </Collapse>
      </Paper>

      <Grid container spacing={2} justifyContent="flex-end">
        <Grid item>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FireDoorSurveyForm; 
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import usePhotoUpload from './hooks/usePhotoUpload';
import useSurveyForm from './hooks/useSurveyForm';
import useFormValidation from './hooks/useFormValidation';
import useFormNavigation from './hooks/useFormNavigation';

import PhotoUploadSection from './components/PhotoUploadSection';
import MeasurementsSection from './components/MeasurementsSection';
import DefectsSection from './components/DefectsSection';
import ConditionAssessmentSection from './components/ConditionAssessmentSection';
import GeneralInfoSection from './components/GeneralInfoSection';
import LocationSelector from './components/LocationSelector';
import RoomTypeSelector from './components/RoomTypeSelector';
import SurveyTracker from './components/SurveyTracker';

import { formatMeasurement, parseMeasurement } from './utils/formHelpers';
import { INITIAL_FORM_STATE } from './constants/formConstants';
import { saveSurveyData } from './api/surveyApi';

import './FireDoorSurveyForm.css';

const FireDoorSurveyForm = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = React.useState(false);
  
  const {
    formData,
    setFormData,
    handleInputChange,
    handleDefectToggle,
    handlePhotoChange,
    resetForm
  } = useSurveyForm(INITIAL_FORM_STATE);

  const {
    uploadProgress,
    uploadErrors,
    handlePhotoUpload,
    resetUpload
  } = usePhotoUpload((photoType, url) => {
    setFormData(prev => ({
      ...prev,
      photos: {
        ...prev.photos,
        [photoType]: url
      }
    }));
  });

  const {
    errors,
    validateForm,
    validateField,
    clearFieldError
  } = useFormValidation();

  const {
    currentSection,
    nextSection,
    previousSection,
    canGoNext,
    canGoPrevious
  } = useFormNavigation(['general', 'measurements', 'defects', 'photos', 'assessment']);

  const handleSave = async () => {
    const isValid = validateForm(formData);
    if (!isValid) return;

    setIsSaving(true);
    try {
      await saveSurveyData(formData);
      navigate('/surveys');
    } catch (error) {
      console.error('Error saving survey:', error);
      // Handle error appropriately
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/surveys');
  };

  const handleAddNewLocation = (location) => {
    // This would typically make an API call to save the new location
    console.log('Adding new location:', location);
  };

  const handleAddNewRoomType = (roomType) => {
    // This would typically make an API call to save the new room type
    console.log('Adding new room type:', roomType);
  };

  return (
    <Container maxWidth="md" className="survey-form-container">
      <Paper elevation={3} className="survey-form-paper">
        <Box className="form-header">
          <Typography variant="h5" component="h1">
            Fire Door Survey Form
          </Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            variant="outlined"
            className="back-button"
          >
            Back to Surveys
          </Button>
        </Box>

        <SurveyTracker
          formData={formData}
          currentSection={currentSection}
        />

        <form onSubmit={(e) => e.preventDefault()}>
          {currentSection === 'general' && (
            <>
              <GeneralInfoSection
                formData={formData}
                onChange={handleInputChange}
                errors={errors}
              />
              <LocationSelector
                location={formData.location}
                buildingName={formData.buildingName}
                floorLevel={formData.floorLevel}
                onChange={handleInputChange}
                onAddNewLocation={handleAddNewLocation}
                errors={errors}
              />
              <RoomTypeSelector
                roomType={formData.roomType}
                onChange={handleInputChange}
                onAddNewType={handleAddNewRoomType}
                errors={errors}
              />
            </>
          )}

          {currentSection === 'measurements' && (
            <MeasurementsSection
              formData={formData}
              onChange={handleInputChange}
              errors={errors}
              formatMeasurement={formatMeasurement}
              parseMeasurement={parseMeasurement}
            />
          )}

          {currentSection === 'defects' && (
            <DefectsSection
              formData={formData}
              onDefectToggle={handleDefectToggle}
              errors={errors}
            />
          )}

          {currentSection === 'photos' && (
            <PhotoUploadSection
              formData={formData}
              onPhotoChange={handlePhotoChange}
              uploadProgress={uploadProgress}
              uploadErrors={uploadErrors}
              handlePhotoUpload={handlePhotoUpload}
              resetUpload={resetUpload}
            />
          )}

          {currentSection === 'assessment' && (
            <ConditionAssessmentSection
              formData={formData}
              onChange={handleInputChange}
              errors={errors}
            />
          )}

          <Box className="form-navigation">
            {canGoPrevious && (
              <Button
                onClick={previousSection}
                variant="outlined"
                className="nav-button"
              >
                Previous
              </Button>
            )}
            
            {canGoNext ? (
              <Button
                onClick={nextSection}
                variant="contained"
                color="primary"
                className="nav-button"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                disabled={isSaving}
                className="nav-button"
              >
                {isSaving ? 'Saving...' : 'Save Survey'}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default FireDoorSurveyForm; 
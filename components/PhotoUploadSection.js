import React from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  Alert
} from '@mui/material';
import {
  PhotoCamera,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const PhotoUploadSection = ({
  formData,
  onPhotoChange,
  uploadProgress,
  uploadErrors,
  handlePhotoUpload,
  resetUpload
}) => {
  const { photos } = formData;

  const handleFileSelect = async (event, photoType) => {
    const file = event.target.files[0];
    if (file) {
      onPhotoChange(photoType, file);
      await handlePhotoUpload(photoType, file);
    }
  };

  const renderPhotoUpload = (photoType, label, multiple = false) => {
    const progress = uploadProgress[photoType] || 0;
    const error = uploadErrors[photoType];
    const photoValue = photos[photoType];
    const hasPhoto = multiple ? photoValue?.length > 0 : photoValue;

    return (
      <Grid item xs={12} sm={6}>
        <Card variant="outlined">
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {label}
            </Typography>

            {hasPhoto ? (
              <Box>
                {multiple ? (
                  <Grid container spacing={1}>
                    {photoValue.map((photo, index) => (
                      <Grid item key={index} xs={6}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="140"
                            image={URL.createObjectURL(photo)}
                            alt={`${label} ${index + 1}`}
                          />
                          <CardActions>
                            <IconButton
                              size="small"
                              onClick={() => resetUpload(photoType, index)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box>
                    <CardMedia
                      component="img"
                      height="200"
                      image={URL.createObjectURL(photoValue)}
                      alt={label}
                    />
                    <CardActions>
                      <IconButton
                        size="small"
                        onClick={() => resetUpload(photoType)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                  borderRadius: 1
                }}
              >
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id={`photo-upload-${photoType}`}
                  type="file"
                  onChange={(e) => handleFileSelect(e, photoType)}
                  multiple={multiple}
                />
                <label htmlFor={`photo-upload-${photoType}`}>
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={multiple ? <AddIcon /> : <PhotoCamera />}
                  >
                    {multiple ? 'Add Photos' : 'Upload Photo'}
                  </Button>
                </label>
              </Box>
            )}

            {progress > 0 && progress < 100 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Card>
      </Grid>
    );
  };

  return (
    <Box component={Paper} elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Photos
      </Typography>

      <Grid container spacing={3}>
        {renderPhotoUpload('doorFront', 'Front View')}
        {renderPhotoUpload('doorBack', 'Back View')}
        {renderPhotoUpload('defects', 'Defect Photos', true)}
        {renderPhotoUpload('additional', 'Additional Photos', true)}
      </Grid>
    </Box>
  );
};

export default PhotoUploadSection; 
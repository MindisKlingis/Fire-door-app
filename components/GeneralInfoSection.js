import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper
} from '@mui/material';

const GeneralInfoSection = ({ formData, onChange, errors }) => {
  return (
    <Box component={Paper} elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        General Information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="doorType"
            name="doorType"
            label="Door Type"
            value={formData.doorType}
            onChange={onChange}
            error={!!errors.doorType}
            helperText={errors.doorType}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="location"
            name="location"
            label="Location"
            value={formData.location}
            onChange={onChange}
            error={!!errors.location}
            helperText={errors.location}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="buildingName"
            name="buildingName"
            label="Building Name"
            value={formData.buildingName}
            onChange={onChange}
            error={!!errors.buildingName}
            helperText={errors.buildingName}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="floorLevel"
            name="floorLevel"
            label="Floor Level"
            value={formData.floorLevel}
            onChange={onChange}
            error={!!errors.floorLevel}
            helperText={errors.floorLevel}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            id="doorReference"
            name="doorReference"
            label="Door Reference"
            value={formData.doorReference}
            onChange={onChange}
            error={!!errors.doorReference}
            helperText={errors.doorReference}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="date"
            id="surveyDate"
            name="surveyDate"
            label="Survey Date"
            value={formData.surveyDate}
            onChange={onChange}
            error={!!errors.surveyDate}
            helperText={errors.surveyDate}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default GeneralInfoSection; 
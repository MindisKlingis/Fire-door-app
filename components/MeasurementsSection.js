import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  InputAdornment
} from '@mui/material';
import { MEASUREMENT_TYPES } from '../../constants/formConstants';

const MeasurementsSection = ({
  formData,
  onChange,
  errors,
  formatMeasurement,
  parseMeasurement
}) => {
  const { measurements } = formData;

  const handleMeasurementChange = (event) => {
    const { name, value } = event.target;
    const parsedValue = parseMeasurement(value);
    const measurementField = name.split('.')[1];
    const measurementType = getMeasurementType(measurementField);
    
    event.target.value = formatMeasurement(parsedValue, measurementType);
    onChange(event);
  };

  const getMeasurementType = (field) => {
    if (field.toLowerCase().includes('thickness')) {
      return MEASUREMENT_TYPES.THICKNESS;
    }
    if (field.toLowerCase().includes('gap')) {
      return MEASUREMENT_TYPES.GAP;
    }
    if (field.toLowerCase().includes('width')) {
      return MEASUREMENT_TYPES.WIDTH;
    }
    if (field.toLowerCase().includes('height')) {
      return MEASUREMENT_TYPES.HEIGHT;
    }
    return null;
  };

  return (
    <Box component={Paper} elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Measurements
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="measurements.doorLeafThickness"
            name="measurements.doorLeafThickness"
            label="Door Leaf Thickness"
            value={measurements.doorLeafThickness}
            onChange={handleMeasurementChange}
            error={!!errors['measurements.doorLeafThickness']}
            helperText={errors['measurements.doorLeafThickness']}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="measurements.frameThickness"
            name="measurements.frameThickness"
            label="Frame Thickness"
            value={measurements.frameThickness}
            onChange={handleMeasurementChange}
            error={!!errors['measurements.frameThickness']}
            helperText={errors['measurements.frameThickness']}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Gap Measurements
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="measurements.headGap"
            name="measurements.headGap"
            label="Head Gap"
            value={measurements.headGap}
            onChange={handleMeasurementChange}
            error={!!errors['measurements.headGap']}
            helperText={errors['measurements.headGap']}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="measurements.leadingEdgeGap"
            name="measurements.leadingEdgeGap"
            label="Leading Edge Gap"
            value={measurements.leadingEdgeGap}
            onChange={handleMeasurementChange}
            error={!!errors['measurements.leadingEdgeGap']}
            helperText={errors['measurements.leadingEdgeGap']}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="measurements.hingeGap"
            name="measurements.hingeGap"
            label="Hinge Gap"
            value={measurements.hingeGap}
            onChange={handleMeasurementChange}
            error={!!errors['measurements.hingeGap']}
            helperText={errors['measurements.hingeGap']}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="measurements.thresholdGap"
            name="measurements.thresholdGap"
            label="Threshold Gap"
            value={measurements.thresholdGap}
            onChange={handleMeasurementChange}
            error={!!errors['measurements.thresholdGap']}
            helperText={errors['measurements.thresholdGap']}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Door Dimensions
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="measurements.doorWidth"
            name="measurements.doorWidth"
            label="Door Width"
            value={measurements.doorWidth}
            onChange={handleMeasurementChange}
            error={!!errors['measurements.doorWidth']}
            helperText={errors['measurements.doorWidth']}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>,
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            id="measurements.doorHeight"
            name="measurements.doorHeight"
            label="Door Height"
            value={measurements.doorHeight}
            onChange={handleMeasurementChange}
            error={!!errors['measurements.doorHeight']}
            helperText={errors['measurements.doorHeight']}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MeasurementsSection; 
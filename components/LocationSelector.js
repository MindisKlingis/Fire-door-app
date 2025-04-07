import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const LocationSelector = ({
  location,
  buildingName,
  floorLevel,
  onChange,
  onAddNewLocation,
  errors,
  availableLocations = []
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newLocation, setNewLocation] = React.useState({
    building: '',
    floor: '',
    description: ''
  });

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewLocation({ building: '', floor: '', description: '' });
  };

  const handleAddLocation = () => {
    onAddNewLocation(newLocation);
    handleCloseDialog();
  };

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth error={!!errors?.location}>
          <InputLabel id="location-label">Location</InputLabel>
          <Select
            labelId="location-label"
            id="location"
            name="location"
            value={location}
            label="Location"
            onChange={onChange}
          >
            {availableLocations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {`${loc.building} - Floor ${loc.floor} - ${loc.description}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ mt: 1 }}
        >
          Add New Location
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add New Location</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Building Name"
              value={newLocation.building}
              onChange={(e) => setNewLocation(prev => ({ ...prev, building: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Floor Level"
              value={newLocation.floor}
              onChange={(e) => setNewLocation(prev => ({ ...prev, floor: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newLocation.description}
              onChange={(e) => setNewLocation(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddLocation}
            variant="contained"
            disabled={!newLocation.building || !newLocation.floor}
          >
            Add Location
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LocationSelector; 
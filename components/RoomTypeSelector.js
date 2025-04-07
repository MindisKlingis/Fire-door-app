import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const ROOM_TYPES = [
  { id: 'office', label: 'Office' },
  { id: 'meeting', label: 'Meeting Room' },
  { id: 'corridor', label: 'Corridor' },
  { id: 'stairwell', label: 'Stairwell' },
  { id: 'storage', label: 'Storage Room' },
  { id: 'utility', label: 'Utility Room' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'lobby', label: 'Lobby' },
  { id: 'other', label: 'Other' }
];

const RoomTypeSelector = ({
  roomType,
  onChange,
  onAddNewType,
  errors,
  customTypes = []
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newType, setNewType] = React.useState({
    name: '',
    description: ''
  });

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewType({ name: '', description: '' });
  };

  const handleAddType = () => {
    onAddNewType(newType);
    handleCloseDialog();
  };

  const allTypes = [...ROOM_TYPES, ...customTypes];

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth error={!!errors?.roomType}>
          <InputLabel id="room-type-label">Room Type</InputLabel>
          <Select
            labelId="room-type-label"
            id="roomType"
            name="roomType"
            value={roomType}
            label="Room Type"
            onChange={onChange}
          >
            {allTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
          {errors?.roomType && (
            <FormHelperText>{errors.roomType}</FormHelperText>
          )}
        </FormControl>
        <Button
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ mt: 1 }}
        >
          Add Custom Room Type
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add Custom Room Type</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Room Type Name"
              value={newType.name}
              onChange={(e) => setNewType(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newType.description}
              onChange={(e) => setNewType(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddType}
            variant="contained"
            disabled={!newType.name}
          >
            Add Room Type
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RoomTypeSelector; 
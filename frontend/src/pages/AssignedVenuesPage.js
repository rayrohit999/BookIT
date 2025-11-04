import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import {
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Info as InfoIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { venueService, bookingService } from '../services';

const AssignedVenuesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch assigned venues
      const venuesData = await venueService.getMyVenues();
      setVenues(venuesData);

      // Fetch all bookings
      const bookingsData = await bookingService.getMyBookings();
      setBookings(bookingsData.results || bookingsData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to load venues data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (venueId) => {
    try {
      setToggling(venueId);
      setError('');
      setSuccess('');

      await venueService.toggleAvailability(venueId);
      
      // Refresh venues list
      const venuesData = await venueService.getMyVenues();
      setVenues(venuesData);

      setSuccess('Venue availability updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Error toggling availability:', err);
      setError(err.response?.data?.error || 'Failed to update venue availability');
    } finally {
      setToggling(null);
    }
  };

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVenue(null);
  };

  const handleEditClick = (venue) => {
    setEditingVenue(venue);
    setEditFormData({
      name: venue.name,
      capacity: venue.capacity,
      location: venue.location || '',
      description: venue.description || '',
      facilities: venue.facilities ? venue.facilities.join(', ') : '',
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingVenue(null);
    setEditFormData({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveVenue = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Prepare data
      const updateData = {
        name: editFormData.name,
        capacity: parseInt(editFormData.capacity),
        location: editFormData.location,
        description: editFormData.description,
        facilities: editFormData.facilities ? editFormData.facilities.split(',').map(f => f.trim()).filter(f => f) : [],
      };

      await venueService.partialUpdate(editingVenue.id, updateData);
      
      // Refresh venues list
      const venuesData = await venueService.getMyVenues();
      setVenues(venuesData);

      setSuccess('Venue updated successfully');
      handleCloseEditDialog();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Error updating venue:', err);
      setError(err.response?.data?.error || 'Failed to update venue');
    } finally {
      setSaving(false);
    }
  };

  const getVenueBookings = (venueId) => {
    return bookings.filter(booking => 
      booking.venue === venueId && booking.status === 'confirmed'
    );
  };

  const getUpcomingBookings = (venueId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter(booking => {
      if (booking.venue !== venueId || booking.status !== 'confirmed') {
        return false;
      }
      const bookingDate = new Date(booking.date);
      return bookingDate >= today;
    }).length;
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Assigned Venues
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {venues.length === 0 ? (
        <Alert severity="info">
          No venues assigned to you yet.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {venues.map(venue => (
            <Grid item xs={12} md={6} key={venue.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {venue.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          icon={venue.is_active ? <ActiveIcon /> : <InactiveIcon />}
                          label={venue.is_active ? 'Active' : 'Inactive'}
                          color={venue.is_active ? 'success' : 'default'}
                          size="small"
                        />
                        <Chip 
                          label={venue.venue_type}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Capacity: {venue.capacity} people
                      </Typography>
                      {venue.location && (
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Location: {venue.location}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton 
                        color="primary"
                        onClick={() => handleEditClick(venue)}
                        title="Edit Venue"
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="primary"
                        onClick={() => handleViewDetails(venue)}
                        title="View Details"
                        size="small"
                      >
                        <InfoIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Venue Statistics */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h6">
                          {getVenueBookings(venue.id).length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Bookings
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper variant="outlined" sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h6">
                          {getUpcomingBookings(venue.id)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Upcoming
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Toggle Availability Button */}
                  <Button
                    fullWidth
                    variant={venue.is_active ? 'outlined' : 'contained'}
                    color={venue.is_active ? 'error' : 'success'}
                    startIcon={
                      toggling === venue.id ? (
                        <CircularProgress size={20} />
                      ) : venue.is_active ? (
                        <ToggleOffIcon />
                      ) : (
                        <ToggleOnIcon />
                      )
                    }
                    onClick={() => handleToggleAvailability(venue.id)}
                    disabled={toggling === venue.id}
                  >
                    {venue.is_active ? 'Mark as Unavailable' : 'Mark as Available'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Venue Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedVenue && (
          <>
            <DialogTitle>
              {selectedVenue.name}
              <Chip 
                icon={selectedVenue.is_active ? <ActiveIcon /> : <InactiveIcon />}
                label={selectedVenue.is_active ? 'Active' : 'Inactive'}
                color={selectedVenue.is_active ? 'success' : 'default'}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Venue Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedVenue.venue_type}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Capacity
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedVenue.capacity} people
                </Typography>
              </Box>

              {selectedVenue.location && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Location
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedVenue.location}
                  </Typography>
                </Box>
              )}

              {selectedVenue.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedVenue.description}
                  </Typography>
                </Box>
              )}

              {selectedVenue.facilities && selectedVenue.facilities.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Facilities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedVenue.facilities.map((facility, index) => (
                      <Chip 
                        key={index}
                        label={facility}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Upcoming Bookings for this venue */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Upcoming Bookings
                </Typography>
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const upcomingBookings = bookings
                    .filter(booking => {
                      if (booking.venue !== selectedVenue.id || booking.status !== 'confirmed') {
                        return false;
                      }
                      const bookingDate = new Date(booking.date);
                      return bookingDate >= today;
                    })
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .slice(0, 5);

                  if (upcomingBookings.length === 0) {
                    return (
                      <Typography variant="body2" color="text.secondary">
                        No upcoming bookings
                      </Typography>
                    );
                  }

                  return (
                    <List dense>
                      {upcomingBookings.map((booking, index) => (
                        <React.Fragment key={booking.id}>
                          <ListItem sx={{ px: 0 }}>
                            <ListItemText
                              primary={booking.event_name}
                              secondary={
                                <>
                                  {formatDate(booking.date)}
                                  <br />
                                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                </>
                              }
                            />
                          </ListItem>
                          {index < upcomingBookings.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  );
                })()}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Edit Venue Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={handleCloseEditDialog}
        maxWidth="sm"
        fullWidth
      >
        {editingVenue && (
          <>
            <DialogTitle>
              Edit Venue: {editingVenue.name}
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  label="Venue Name"
                  name="name"
                  value={editFormData.name || ''}
                  onChange={handleEditFormChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Capacity"
                  name="capacity"
                  type="number"
                  value={editFormData.capacity || ''}
                  onChange={handleEditFormChange}
                  fullWidth
                  required
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Location"
                  name="location"
                  value={editFormData.location || ''}
                  onChange={handleEditFormChange}
                  fullWidth
                />
                <TextField
                  label="Description"
                  name="description"
                  value={editFormData.description || ''}
                  onChange={handleEditFormChange}
                  fullWidth
                  multiline
                  rows={3}
                />
                <TextField
                  label="Facilities (comma-separated)"
                  name="facilities"
                  value={editFormData.facilities || ''}
                  onChange={handleEditFormChange}
                  fullWidth
                  helperText="e.g., Projector, Wi-Fi, AC, Microphone"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseEditDialog} disabled={saving}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveVenue} 
                variant="contained"
                disabled={saving || !editFormData.name || !editFormData.capacity}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AssignedVenuesPage;

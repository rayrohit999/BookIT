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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Event as EventIcon,
  Place as VenueIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { bookingService, venueService } from '../services';

const HallAdminBookingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true); // Default to show upcoming only
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

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

      // Fetch all bookings (Hall Admin sees only bookings for assigned venues)
      const bookingsData = await bookingService.getMyBookings();
      setBookings(bookingsData.results || bookingsData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || 'Failed to load bookings data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBooking(null);
  };

  const handleCancelClick = (booking) => {
    setCancellingBooking(booking);
    setCancelReason('');
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setCancellingBooking(null);
    setCancelReason('');
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      setError('Cancellation reason is required');
      return;
    }

    try {
      setCancelling(true);
      setError('');

      await bookingService.cancel(cancellingBooking.id, cancelReason);
      
      // Refresh bookings list
      const bookingsData = await bookingService.getMyBookings();
      setBookings(bookingsData.results || bookingsData);

      setSuccess('Booking cancelled successfully');
      handleCloseCancelDialog();
      if (openDialog && selectedBooking?.id === cancellingBooking.id) {
        handleCloseDialog();
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
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
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getFilteredBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter(booking => {
      // Filter upcoming only
      if (showUpcomingOnly) {
        const bookingDate = new Date(booking.date);
        bookingDate.setHours(0, 0, 0, 0);
        if (bookingDate < today) {
          return false;
        }
      }

      // Filter by venue
      if (selectedVenue !== 'all' && booking.venue !== parseInt(selectedVenue)) {
        return false;
      }
      
      // Filter by status
      if (selectedStatus !== 'all' && booking.status !== selectedStatus) {
        return false;
      }
      
      // Filter by date
      if (selectedDate && booking.date !== selectedDate) {
        return false;
      }
      
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleClearFilters = () => {
    setSelectedVenue('all');
    setSelectedStatus('all');
    setSelectedDate('');
    setShowUpcomingOnly(true);
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
        Venue Bookings
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

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Venue</InputLabel>
                <Select
                  value={selectedVenue}
                  label="Venue"
                  onChange={(e) => setSelectedVenue(e.target.value)}
                >
                  <MenuItem value="all">All Venues</MenuItem>
                  {venues.map(venue => (
                    <MenuItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={selectedStatus}
                  label="Status"
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showUpcomingOnly}
                    onChange={(e) => setShowUpcomingOnly(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show upcoming bookings only"
              />
            </Grid>

            <Grid item xs={12}>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {getFilteredBookings().length === 0 ? (
        <Alert severity="info">
          No bookings found matching the selected filters.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {getFilteredBookings().map(booking => (
            <Grid item xs={12} key={booking.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {booking.event_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <VenueIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {booking.venue_name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <EventIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(booking.date)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Chip 
                        label={booking.status.toUpperCase()}
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleViewDetails(booking)}
                      >
                        View Details
                      </Button>
                      {booking.status === 'confirmed' && (
                        <Button 
                          variant="outlined" 
                          color="error"
                          size="small"
                          onClick={() => handleCancelClick(booking)}
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Requested by: {booking.requester_name}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Booking Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedBooking && (
          <>
            <DialogTitle>
              Booking Details
              <Chip 
                label={selectedBooking.status.toUpperCase()}
                color={getStatusColor(selectedBooking.status)}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Event Name
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBooking.event_name}
                </Typography>
              </Box>

              {selectedBooking.event_description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Event Description
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedBooking.event_description}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Venue
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedBooking.venue_name}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Date & Time
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedBooking.date)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Requested By
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <PersonIcon fontSize="small" color="action" />
                  <Typography variant="body1">
                    {selectedBooking.requester_name}
                  </Typography>
                </Box>
                {selectedBooking.contact_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {selectedBooking.contact_number}
                    </Typography>
                  </Box>
                )}
              </Box>

              {selectedBooking.special_requirements && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Special Requirements
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedBooking.special_requirements}
                  </Typography>
                </Box>
              )}

              {selectedBooking.status === 'cancelled' && selectedBooking.cancellation_reason && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Cancellation Reason
                  </Typography>
                  <Typography variant="body1" color="error" gutterBottom>
                    {selectedBooking.cancellation_reason}
                  </Typography>
                  {selectedBooking.cancelled_at && (
                    <Typography variant="body2" color="text.secondary">
                      Cancelled at: {new Date(selectedBooking.cancelled_at).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Created At
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(selectedBooking.created_at).toLocaleString()}
                </Typography>
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

      {/* Cancel Booking Dialog */}
      <Dialog 
        open={openCancelDialog} 
        onClose={handleCloseCancelDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent dividers>
          {cancellingBooking && (
            <>
              <Typography variant="body1" gutterBottom>
                Are you sure you want to cancel this booking?
              </Typography>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <strong>Event:</strong> {cancellingBooking.event_name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Venue:</strong> {cancellingBooking.venue_name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Date:</strong> {formatDate(cancellingBooking.date)}
                </Typography>
                <Typography variant="body2">
                  <strong>Time:</strong> {formatTime(cancellingBooking.start_time)} - {formatTime(cancellingBooking.end_time)}
                </Typography>
              </Box>
              <TextField
                label="Cancellation Reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                fullWidth
                required
                multiline
                rows={3}
                sx={{ mt: 3 }}
                helperText="Please provide a reason for cancellation"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={cancelling}>
            Close
          </Button>
          <Button 
            onClick={handleCancelBooking} 
            color="error"
            variant="contained"
            disabled={cancelling || !cancelReason.trim()}
          >
            {cancelling ? <CircularProgress size={24} /> : 'Cancel Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HallAdminBookingsPage;

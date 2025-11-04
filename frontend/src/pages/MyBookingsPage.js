import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import CancelIcon from '@mui/icons-material/Cancel';
import { bookingService } from '../services';
import { formatDate, formatTime, canCancelBooking } from '../utils/dateUtils';
import { getStatusColor, getStatusDisplayName, handleApiError } from '../utils/helpers';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [cancelDialog, setCancelDialog] = useState({ open: false, booking: null });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      setBookings(data);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelDialog = (booking) => {
    setCancelDialog({ open: true, booking });
    setCancelReason('');
  };

  const handleCloseCancelDialog = () => {
    setCancelDialog({ open: false, booking: null });
    setCancelReason('');
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }

    setCancelling(true);

    try {
      await bookingService.cancel(cancelDialog.booking.id, cancelReason);
      await fetchBookings();
      handleCloseCancelDialog();
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setCancelling(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(`${b.date}T${b.start_time}`);
    return bookingDate >= now && b.status === 'confirmed';
  });

  const pastBookings = bookings.filter(b => {
    const bookingDate = new Date(`${b.date}T${b.start_time}`);
    return bookingDate < now || b.status === 'cancelled';
  });

  const renderBookingCard = (booking) => {
    const canCancel = booking.status === 'confirmed' && canCancelBooking(booking.date, booking.start_time);
    
    return (
      <Paper key={booking.id} elevation={2} sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Typography variant="h6">
            {booking.venue_name || 'Venue'}
          </Typography>
          <Chip
            label={getStatusDisplayName(booking.status)}
            color={getStatusColor(booking.status)}
            size="small"
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2">
                {formatDate(booking.date)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationOnIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2">
                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2">
                {booking.expected_attendees} attendees
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" color="text.secondary" gutterBottom>
          <strong>Event:</strong> {booking.event_name || 'N/A'}
        </Typography>

        {booking.special_requirements && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <strong>Special Requirements:</strong> {booking.special_requirements}
          </Typography>
        )}

        {booking.cancellation_reason && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <strong>Cancellation Reason:</strong> {booking.cancellation_reason}
          </Alert>
        )}

        {canCancel && (
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => handleOpenCancelDialog(booking)}
            >
              Cancel Booking
            </Button>
          </Box>
        )}
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" component="h1">
          My Bookings
        </Typography>
        <Button
          component={Link}
          to="/bookings/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Booking
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="booking tabs">
          <Tab label={`Upcoming (${upcomingBookings.length})`} />
          <Tab label={`Past (${pastBookings.length})`} />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Box>
          {upcomingBookings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No upcoming bookings
              </Typography>
              <Button
                component={Link}
                to="/bookings/new"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Create Your First Booking
              </Button>
            </Paper>
          ) : (
            upcomingBookings.map(renderBookingCard)
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          {pastBookings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No past bookings
              </Typography>
            </Paper>
          ) : (
            pastBookings.map(renderBookingCard)
          )}
        </Box>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Are you sure you want to cancel this booking?
          </Typography>
          {cancelDialog.booking && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {cancelDialog.booking.venue_details?.name} - {formatDate(cancelDialog.booking.date)}
              <br />
              {formatTime(cancelDialog.booking.start_time)} - {formatTime(cancelDialog.booking.end_time)}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            multiline
            rows={3}
            margin="normal"
            required
            placeholder="Please provide a reason for cancellation"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Keep Booking</Button>
          <Button
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
            disabled={cancelling || !cancelReason.trim()}
          >
            {cancelling ? <CircularProgress size={24} /> : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBookingsPage;

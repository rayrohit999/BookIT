import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Box,
} from '@mui/material';
import { CheckCircle as ConfirmIcon, Warning as WarningIcon } from '@mui/icons-material';
import axios from 'axios';
import { format, parseISO, differenceInHours } from 'date-fns';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * ConfirmBookingButton Component
 * 
 * Allows users to confirm their booking to prevent auto-cancellation.
 * Shows urgency if booking is within 24 hours.
 * 
 * Props:
 * - booking: object - Booking details with id, venue, date, start_time, confirmed, reminder_sent
 * - onSuccess: function - Callback when booking confirmed successfully
 * - variant: string - Button variant (default: 'contained')
 * - size: string - Button size (default: 'medium')
 */
const ConfirmBookingButton = ({ booking, onSuccess, variant = 'contained', size = 'medium' }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate hours until event
  const hoursUntilEvent = () => {
    try {
      const eventDateTime = new Date(`${booking.date}T${booking.start_time}`);
      return differenceInHours(eventDateTime, new Date());
    } catch (err) {
      return null;
    }
  };

  const hours = hoursUntilEvent();
  const isUrgent = hours !== null && hours <= 24 && hours > 0;
  const isAutoCancelWindow = hours !== null && hours <= 2 && hours > 0;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${API_BASE_URL}/bookings/${booking.id}/confirm/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (onSuccess) {
        onSuccess();
      }

      setDialogOpen(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to confirm booking';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if already confirmed
  if (booking.confirmed) {
    return (
      <Chip
        label="Confirmed"
        color="success"
        size="small"
        icon={<ConfirmIcon />}
      />
    );
  }

  // Don't show button if event has passed
  if (hours !== null && hours < 0) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        color={isAutoCancelWindow ? 'error' : isUrgent ? 'warning' : 'primary'}
        size={size}
        startIcon={isUrgent ? <WarningIcon /> : <ConfirmIcon />}
        onClick={() => setDialogOpen(true)}
      >
        {isAutoCancelWindow ? 'Urgent: Confirm Now!' : isUrgent ? 'Confirm Booking' : 'Confirm'}
      </Button>

      <Dialog
        open={dialogOpen}
        onClose={() => !loading && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isAutoCancelWindow ? '⚠️ Urgent: Confirm Booking' : 'Confirm Your Booking'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Please confirm that you still plan to use this booking:
          </Typography>

          <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2">Venue</Typography>
            <Typography variant="body2" gutterBottom>
              {booking.venue_name || booking.venue?.name}
            </Typography>

            <Typography variant="subtitle2" mt={1}>
              Date & Time
            </Typography>
            <Typography variant="body2">
              {format(parseISO(booking.date), 'MMMM dd, yyyy')}
              <br />
              {booking.start_time} - {booking.end_time}
            </Typography>

            {booking.event_name && (
              <>
                <Typography variant="subtitle2" mt={1}>
                  Event
                </Typography>
                <Typography variant="body2">{booking.event_name}</Typography>
              </>
            )}
          </Box>

          {isAutoCancelWindow ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>Critical: Your event is in {hours} hour{hours !== 1 ? 's' : ''}!</strong>
              <br />
              If you don't confirm within 2 hours of your event, it will be automatically cancelled.
              Other users are waiting for this slot.
            </Alert>
          ) : isUrgent ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Reminder: Your event is in {hours} hours</strong>
              <br />
              Please confirm to avoid auto-cancellation. Bookings are automatically cancelled
              if not confirmed 2 hours before the event.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Why confirm?</strong>
              <br />
              Confirming helps prevent "ghost bookings" and ensures venue availability for others.
              Unconfirmed bookings are automatically cancelled 2 hours before the event.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={isAutoCancelWindow ? 'error' : 'primary'}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <ConfirmIcon />}
          >
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmBookingButton;

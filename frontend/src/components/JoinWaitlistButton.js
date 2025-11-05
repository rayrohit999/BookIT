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
  Box,
  Paper,
} from '@mui/material';
import { HourglassEmpty as WaitlistIcon } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * JoinWaitlistButton Component
 * 
 * Allows users to join a waitlist when a venue slot is fully booked.
 * 
 * Props:
 * - venue: { id, name } - Venue information
 * - date: Date object or string - Booking date
 * - startTime: string - Start time (HH:MM:SS format)
 * - endTime: string - End time (HH:MM:SS format)
 * - onSuccess: function - Callback when successfully joined waitlist
 * - onError: function - Callback on error
 */
const JoinWaitlistButton = ({ venue, date, startTime, endTime, onSuccess, onError }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return '';
    try {
      const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      return format(dateObj, 'MMMM dd, yyyy');
    } catch (err) {
      return dateInput.toString();
    }
  };

  const handleJoinWaitlist = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      
      // Format date for API (YYYY-MM-DD)
      let formattedDate;
      if (typeof date === 'string') {
        // If already a string, use it
        formattedDate = date.split('T')[0]; // Remove time part if present
      } else {
        // If Date object, format it
        formattedDate = format(date, 'yyyy-MM-dd');
      }

      // Format time to HH:MM:SS if only HH:MM is provided
      const formatTimeWithSeconds = (time) => {
        if (!time) return time;
        // If already has seconds (HH:MM:SS), return as is
        if (time.split(':').length === 3) return time;
        // Add :00 seconds
        return `${time}:00`;
      };

      const response = await axios.post(
        `${API_BASE_URL}/waitlist/`,
        {
          venue: venue.id,
          date: formattedDate,
          start_time: formatTimeWithSeconds(startTime),
          end_time: formatTimeWithSeconds(endTime),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      if (onSuccess) {
        onSuccess(response.data);
      }

      // Close dialog after 2 seconds
      setTimeout(() => {
        setDialogOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Waitlist join error:', err.response?.data);
      let errorMsg = 'Failed to join waitlist';
      
      if (err.response?.data) {
        // Handle Django validation errors
        if (err.response.data.error) {
          errorMsg = err.response.data.error;
        } else if (err.response.data.non_field_errors) {
          errorMsg = err.response.data.non_field_errors[0];
        } else if (typeof err.response.data === 'object') {
          // Get first error from any field
          const firstError = Object.values(err.response.data)[0];
          errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }
      
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setError('');
    setSuccess(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="warning"
        startIcon={<WaitlistIcon />}
        onClick={handleOpenDialog}
        fullWidth
      >
        Join Waitlist
      </Button>

      <Dialog 
        open={dialogOpen} 
        onClose={() => !loading && setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Join Waitlist</DialogTitle>
        <DialogContent>
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              <strong>Successfully joined waitlist!</strong>
              <br />
              You'll be notified when this slot becomes available.
            </Alert>
          ) : (
            <>
              <Typography variant="body1" paragraph>
                This time slot is currently booked. Join the waitlist to be notified if it becomes available.
              </Typography>

              <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
                <Typography variant="subtitle2">Venue</Typography>
                <Typography variant="body2" gutterBottom>
                  {venue?.name || 'Unknown Venue'}
                </Typography>

                <Typography variant="subtitle2" mt={1}>
                  Date & Time
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {formatDate(date)}
                  <br />
                  {formatTime(startTime)} - {formatTime(endTime)}
                </Typography>
              </Paper>

              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>How it works:</strong>
                </Typography>
                <Typography variant="body2" component="div">
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>You'll be added to a first-come, first-served queue</li>
                    <li>When the slot becomes available, you'll get an email and in-app notification</li>
                    <li>You'll have 15 minutes to claim the slot</li>
                    <li>If you don't claim it, the next person in line will be notified</li>
                  </ul>
                </Typography>
              </Alert>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading || success}>
            {success ? 'Close' : 'Cancel'}
          </Button>
          {!success && (
            <Button
              onClick={handleJoinWaitlist}
              variant="contained"
              color="warning"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <WaitlistIcon />}
            >
              {loading ? 'Joining...' : 'Join Waitlist'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default JoinWaitlistButton;

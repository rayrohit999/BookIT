import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Delete as DeleteIcon,
  CheckCircle as ClaimIcon,
  HourglassEmpty as WaitingIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const MyWaitlistPage = () => {
  const navigate = useNavigate();
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [claiming, setClaiming] = useState(false);

  const fetchWaitlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/waitlist/my_waitlist/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWaitlistEntries(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch waitlist entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
    // Refresh every 30 seconds to update countdown timers
    const interval = setInterval(fetchWaitlist, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLeaveWaitlist = async (entryId) => {
    if (!window.confirm('Are you sure you want to leave this waitlist?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/waitlist/${entryId}/leave/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess('Successfully left the waitlist');
      fetchWaitlist();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave waitlist');
    }
  };

  const handleClaimClick = (entry) => {
    setSelectedEntry(entry);
    setClaimDialogOpen(true);
  };

  const handleClaimSlot = async () => {
    if (!selectedEntry) return;

    setClaiming(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/waitlist/${selectedEntry.id}/claim/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(response.data.message);
      setClaimDialogOpen(false);
      fetchWaitlist();
      // Navigate to My Bookings after successful claim
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to claim slot';
      setError(errorMsg);
      setClaimDialogOpen(false);
      if (err.response?.status === 409) {
        // Slot was taken, refresh list
        fetchWaitlist();
      }
    } finally {
      setClaiming(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // timeString format: "HH:MM:SS"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusChip = (entry) => {
    if (entry.expired) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    if (entry.claimed) {
      return <Chip label="Claimed" color="success" size="small" />;
    }
    if (entry.notified) {
      return (
        <Chip
          icon={<TimerIcon />}
          label={`Notified - ${entry.time_remaining || 'Expired'}`}
          color="warning"
          size="small"
        />
      );
    }
    return (
      <Chip
        icon={<WaitingIcon />}
        label={`Waiting (${entry.priority + 1} in queue)`}
        color="info"
        size="small"
      />
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Waitlist
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track your waitlist positions and claim slots when they become available.
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

      {waitlistEntries.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You're not on any waitlists
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            When a venue slot is full, you can join the waitlist to be notified when it becomes available.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/venues')} sx={{ mt: 2 }}>
            Browse Venues
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {waitlistEntries.map((entry) => (
            <Grid item xs={12} md={6} key={entry.id}>
              <Card elevation={3}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div">
                      {entry.venue_name}
                    </Typography>
                    {getStatusChip(entry)}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" alignItems="center" mb={1}>
                    <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {format(parseISO(entry.date), 'MMMM dd, yyyy')}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1}>
                    <TimerIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Position: {entry.priority + 1} in queue
                    </Typography>
                  </Box>

                  {entry.notified && !entry.is_expired && !entry.claimed && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <strong>Slot Available!</strong>
                      <br />
                      Time remaining: {entry.time_remaining}
                      <br />
                      Claim now or it will go to the next person.
                    </Alert>
                  )}

                  {entry.is_expired && !entry.expired && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Your 15-minute claim window has expired. The slot has been offered to the next person in line.
                    </Alert>
                  )}

                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Joined: {format(parseISO(entry.created_at), 'MMM dd, yyyy h:mm a')}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  {entry.notified && !entry.is_expired && !entry.claimed && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ClaimIcon />}
                      onClick={() => handleClaimClick(entry)}
                    >
                      Claim Slot
                    </Button>
                  )}
                  {!entry.claimed && !entry.expired && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleLeaveWaitlist(entry.id)}
                    >
                      Leave Waitlist
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Claim Confirmation Dialog */}
      <Dialog open={claimDialogOpen} onClose={() => !claiming && setClaimDialogOpen(false)}>
        <DialogTitle>Claim Waitlist Slot</DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <>
              <Typography variant="body1" paragraph>
                You're about to claim this booking slot:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2">Venue</Typography>
                <Typography variant="body2" gutterBottom>
                  {selectedEntry.venue_name}
                </Typography>

                <Typography variant="subtitle2" mt={1}>
                  Date & Time
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {format(parseISO(selectedEntry.date), 'MMMM dd, yyyy')}
                  <br />
                  {formatTime(selectedEntry.start_time)} - {formatTime(selectedEntry.end_time)}
                </Typography>

                <Typography variant="subtitle2" mt={1}>
                  Time Remaining
                </Typography>
                <Typography variant="body2" color="error.main">
                  {selectedEntry.time_remaining}
                </Typography>
              </Paper>
              <Alert severity="info" sx={{ mt: 2 }}>
                Once claimed, a confirmed booking will be created. You can view it in "My Bookings".
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClaimDialogOpen(false)} disabled={claiming}>
            Cancel
          </Button>
          <Button
            onClick={handleClaimSlot}
            variant="contained"
            color="success"
            disabled={claiming}
            startIcon={claiming ? <CircularProgress size={20} /> : <ClaimIcon />}
          >
            {claiming ? 'Claiming...' : 'Confirm Claim'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyWaitlistPage;

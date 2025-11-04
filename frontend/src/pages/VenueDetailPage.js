import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { venueService } from '../services';
import { useAuth } from '../context/AuthContext';
import { handleApiError } from '../utils/helpers';

const VenueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canBook } = useAuth();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVenue = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await venueService.getById(id);
      setVenue(data);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVenue();
  }, [fetchVenue]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: `/venues/${id}` } });
      return;
    }
    navigate('/bookings/new', { state: { venueId: id, venueName: venue.name } });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
        <Button
          component={Link}
          to="/venues"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Venues
        </Button>
      </Container>
    );
  }

  if (!venue) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Venue not found
        </Alert>
        <Button
          component={Link}
          to="/venues"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Venues
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Button
        component={Link}
        to="/venues"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Venues
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
          <Typography variant="h3" component="h1">
            {venue.name}
          </Typography>
          {venue.is_active ? (
            <Chip label="Available" color="success" size="large" />
          ) : (
            <Chip label="Unavailable" color="error" size="large" />
          )}
        </Box>

        {venue.description && (
          <Typography variant="body1" paragraph>
            {venue.description}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOnIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">{venue.location}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PeopleIcon sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Capacity
                </Typography>
                <Typography variant="body1">{venue.capacity} people</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {venue.facilities && venue.facilities.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                Available Facilities
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {venue.facilities.map((facility, index) => (
                  <Chip
                    key={index}
                    label={facility}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          {venue.is_active ? (
            <>
              {user && canBook() ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<EventIcon />}
                  onClick={handleBookNow}
                  fullWidth
                  sx={{ maxWidth: 400 }}
                >
                  Book This Venue
                </Button>
              ) : user ? (
                <Alert severity="info">
                  You don't have permission to book venues. Contact admin if you need access.
                </Alert>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleBookNow}
                  fullWidth
                  sx={{ maxWidth: 400 }}
                >
                  Login to Book
                </Button>
              )}
            </>
          ) : (
            <Alert severity="warning">
              This venue is currently unavailable for booking
            </Alert>
          )}
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Booking Information:</strong>
            <br />
            • Book time slots from 30 minutes to full day
            <br />
            • Bookings can be made up to 90 days in advance
            <br />
            • Cancellations must be made at least 2 hours before start time
            <br />
            • Instant confirmation - no approval needed
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default VenueDetailPage;

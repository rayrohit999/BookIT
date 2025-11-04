import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  Business as VenueIcon,
  EventAvailable as BookingIcon,
  Schedule as UpcomingIcon,
  CheckCircle as ActiveIcon,
} from '@mui/icons-material';
import { venueService, bookingService } from '../services';
import { useNavigate } from 'react-router-dom';

const HallAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalVenues: 0,
    activeVenues: 0,
    todayBookings: 0,
    upcomingBookings: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch assigned venues
      const venuesData = await venueService.getMyVenues();
      setVenues(venuesData);

      // Fetch all bookings for assigned venues
      const bookingsData = await bookingService.getMyBookings();
      setBookings(bookingsData.results || bookingsData);

      // Calculate statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayBookings = (bookingsData.results || bookingsData).filter(
        booking => {
          const bookingDate = new Date(booking.date);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate.getTime() === today.getTime() && 
                 booking.status === 'confirmed';
        }
      );

      const upcomingBookings = (bookingsData.results || bookingsData).filter(
        booking => {
          const bookingDate = new Date(booking.date);
          return bookingDate > today && booking.status === 'confirmed';
        }
      );

      setStats({
        totalVenues: venuesData.length,
        activeVenues: venuesData.filter(v => v.is_active).length,
        todayBookings: todayBookings.length,
        upcomingBookings: upcomingBookings.length,
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getTodayBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime() && 
             booking.status === 'confirmed';
    });
  };

  const getUpcomingBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate > today && booking.status === 'confirmed';
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5); // Show only next 5 upcoming bookings
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
        Hall Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <VenueIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {stats.totalVenues}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Assigned Venues
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ActiveIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {stats.activeVenues}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active Venues
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BookingIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {stats.todayBookings}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Today's Bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <UpcomingIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6" component="div">
                  {stats.upcomingBookings}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Upcoming Bookings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Assigned Venues */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                My Venues
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/hall-admin/venues')}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {venues.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No venues assigned
              </Typography>
            ) : (
              <List>
                {venues.map((venue, index) => (
                  <React.Fragment key={venue.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body1">
                              {venue.name}
                            </Typography>
                            <Chip 
                              label={venue.is_active ? 'Active' : 'Inactive'}
                              color={venue.is_active ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            Capacity: {venue.capacity} | {venue.venue_type}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < venues.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Today's Bookings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Today's Bookings
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/hall-admin/bookings')}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {getTodayBookings().length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No bookings for today
              </Typography>
            ) : (
              <List>
                {getTodayBookings().map((booking, index) => (
                  <React.Fragment key={booking.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={booking.event_name}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {booking.venue_name}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span" color="text.secondary">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < getTodayBookings().length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Upcoming Bookings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Upcoming Bookings
              </Typography>
              <Button 
                size="small" 
                onClick={() => navigate('/hall-admin/bookings')}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {getUpcomingBookings().length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No upcoming bookings
              </Typography>
            ) : (
              <List>
                {getUpcomingBookings().map((booking, index) => (
                  <React.Fragment key={booking.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body1">
                              {booking.event_name}
                            </Typography>
                            <Chip 
                              label={formatDate(booking.date)}
                              variant="outlined"
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {booking.venue_name}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span" color="text.secondary">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < getUpcomingBookings().length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HallAdminDashboard;

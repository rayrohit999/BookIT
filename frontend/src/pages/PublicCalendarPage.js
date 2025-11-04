import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  CalendarToday,
} from '@mui/icons-material';
import { bookingService, venueService } from '../services';

const PublicCalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [weekDays, setWeekDays] = useState([]);

  // Helper function to get Monday of the week
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format time to HH:MM AM/PM
  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate week days array
  useEffect(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    setWeekDays(days);
  }, [currentWeekStart]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Calculate week end date
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        // Fetch bookings and venues
        const [bookingsData, venuesData] = await Promise.all([
          bookingService.getPublicCalendar(
            formatDate(currentWeekStart),
            formatDate(weekEnd)
          ),
          venueService.getAll()
        ]);
        
        setBookings(bookingsData.bookings || []);
        // Handle paginated response - extract results array
        setVenues(venuesData.results || venuesData || []);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        setError('Failed to load calendar data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentWeekStart]);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Navigate to current week
  const goToCurrentWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Get bookings for a specific venue and date
  const getBookingsForVenueAndDate = (venueId, date) => {
    const dateStr = formatDate(date);
    return bookings.filter(
      (booking) =>
        booking.venue.id === venueId &&
        booking.date === dateStr
    );
  };

  // Get color for booking chip
  const getBookingColor = (index) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'info'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading calendar...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday /> Booking Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View venue bookings for the week • No login required
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Week Navigation */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton onClick={goToPreviousWeek} color="primary">
            <ChevronLeft />
          </IconButton>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">
              {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {' - '}
              {weekDays[6]?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
            <Chip 
              label="Today" 
              size="small" 
              onClick={goToCurrentWeek}
              color="primary"
              sx={{ mt: 0.5 }}
            />
          </Box>
          
          <IconButton onClick={goToNextWeek} color="primary">
            <ChevronRight />
          </IconButton>
        </Box>
      </Paper>

      {/* Calendar Grid */}
      <Paper sx={{ overflow: 'auto' }}>
        <Box sx={{ minWidth: 900 }}>
          {/* Header Row - Days */}
          <Grid container sx={{ borderBottom: 2, borderColor: 'divider', bgcolor: 'grey.50' }}>
            <Grid item xs={1.5} sx={{ p: 1.5, borderRight: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Venue
              </Typography>
            </Grid>
            {weekDays.map((day, index) => {
              const isToday = formatDate(day) === formatDate(new Date());
              return (
                <Grid 
                  key={index} 
                  item 
                  xs={1.5} 
                  sx={{ 
                    p: 1.5, 
                    borderRight: index < 6 ? 1 : 0, 
                    borderColor: 'divider',
                    bgcolor: isToday ? 'primary.light' : 'transparent',
                    color: isToday ? 'white' : 'inherit'
                  }}
                >
                  <Typography variant="caption" display="block" fontWeight="bold">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {day.getDate()}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>

          {/* Venue Rows */}
          {venues.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No venues available</Typography>
            </Box>
          ) : (
            venues.map((venue) => (
              <Grid 
                key={venue.id} 
                container 
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'grey.50' }
                }}
              >
                {/* Venue Name */}
                <Grid 
                  item 
                  xs={1.5} 
                  sx={{ 
                    p: 1.5, 
                    borderRight: 1, 
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight="bold" noWrap>
                      {venue.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {venue.capacity} capacity
                    </Typography>
                  </Box>
                </Grid>

                {/* Day Cells */}
                {weekDays.map((day, dayIndex) => {
                  const dayBookings = getBookingsForVenueAndDate(venue.id, day);
                  const isToday = formatDate(day) === formatDate(new Date());
                  
                  return (
                    <Grid 
                      key={dayIndex} 
                      item 
                      xs={1.5} 
                      sx={{ 
                        p: 0.5, 
                        borderRight: dayIndex < 6 ? 1 : 0, 
                        borderColor: 'divider',
                        minHeight: 80,
                        bgcolor: isToday ? 'primary.lighter' : 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5
                      }}
                    >
                      {dayBookings.length === 0 ? (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          height: '100%',
                          color: 'text.disabled'
                        }}>
                          <Typography variant="caption">-</Typography>
                        </Box>
                      ) : (
                        dayBookings.map((booking, bookingIndex) => (
                          <Tooltip
                            key={booking.id}
                            title={
                              <Box>
                                <Typography variant="body2" fontWeight="bold">
                                  {booking.event_name}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                </Typography>
                                <Typography variant="caption" display="block">
                                  Department: {booking.department}
                                </Typography>
                              </Box>
                            }
                            arrow
                          >
                            <Chip
                              label={
                                <Box>
                                  <Typography variant="caption" display="block" fontWeight="bold">
                                    {booking.event_name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                  </Typography>
                                </Box>
                              }
                              size="small"
                              color={getBookingColor(bookingIndex)}
                              sx={{ 
                                width: '100%',
                                height: 'auto',
                                py: 0.5,
                                '& .MuiChip-label': {
                                  whiteSpace: 'normal',
                                  textAlign: 'left',
                                  display: 'block'
                                }
                              }}
                            />
                          </Tooltip>
                        ))
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            ))
          )}
        </Box>
      </Paper>

      {/* Legend */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          <strong>Legend:</strong> Hover over booking blocks to see full details (event name, time, department)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {['primary', 'secondary', 'success', 'warning', 'info'].map((color) => (
            <Chip key={color} label="Booked" size="small" color={color} />
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default PublicCalendarPage;

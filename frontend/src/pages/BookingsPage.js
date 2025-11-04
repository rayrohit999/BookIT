import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
} from '@mui/material';
import { bookingService, venueService } from '../services';
import { formatDate, formatTime } from '../utils/dateUtils';
import { getStatusColor, getStatusDisplayName, handleApiError } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const BookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    venue: '',
    status: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsData, venuesData] = await Promise.all([
        bookingService.getAll(),
        venueService.getAll(),
      ]);
      setBookings(bookingsData.results || bookingsData);
      setVenues(venuesData.results || venuesData);
      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filters.venue && booking.venue !== parseInt(filters.venue)) {
      return false;
    }
    if (filters.status && booking.status !== filters.status) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom>
        All Bookings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {user.role === 'super_admin' && 'View all bookings across all venues'}
        {user.role === 'hall_admin' && 'View bookings for your assigned venues'}
        {(user.role === 'hod' || user.role === 'dean') && 'View your bookings'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            label="Filter by Venue"
            name="venue"
            value={filters.venue}
            onChange={handleFilterChange}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Venues</MenuItem>
            {venues.map((venue) => (
              <MenuItem key={venue.id} value={venue.id}>
                {venue.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Filter by Status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {filteredBookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No bookings found
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Venue</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Time</strong></TableCell>
                <TableCell><strong>Purpose</strong></TableCell>
                <TableCell><strong>Booked By</strong></TableCell>
                <TableCell><strong>Attendees</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.venue_details?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDate(booking.date)}</TableCell>
                  <TableCell>
                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                  </TableCell>
                  <TableCell>{booking.purpose}</TableCell>
                  <TableCell>
                    {booking.user_details?.full_name || booking.user_details?.email || 'N/A'}
                  </TableCell>
                  <TableCell>{booking.expected_attendees}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusDisplayName(booking.status)}
                      color={getStatusColor(booking.status)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Total bookings: {filteredBookings.length}
        </Typography>
      </Box>
    </Container>
  );
};

export default BookingsPage;

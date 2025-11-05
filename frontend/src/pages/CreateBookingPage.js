import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { venueService, bookingService } from '../services';
import { getTodayDate, getMaxBookingDate, validateTimeRange } from '../utils/dateUtils';
import { handleApiError } from '../utils/helpers';
import JoinWaitlistButton from '../components/JoinWaitlistButton';

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    venue: location.state?.venueId || '',
    date: '',
    start_time: '',
    end_time: '',
    event_name: '',
    event_description: '',
    expected_attendees: '',
    contact_number: '',
    special_requirements: '',
  });
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Generate time slots from 8:00 AM to 9:00 PM in 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 21; // 9 PM (21:00 in 24-hour format)
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Stop at 9:00 PM (don't add 9:30 PM)
        if (hour === endHour && minute > 0) break;
        
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const minuteStr = minute.toString().padStart(2, '0');
        
        slots.push({
          value: time24,
          label: `${hour12}:${minuteStr} ${period}`
        });
      }
    }
    
    return slots;
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const data = await venueService.getAll();
      setVenues(data.results || data);
    } catch (err) {
      setErrors({ general: handleApiError(err) });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    setAvailability(null);
  };

  const handleCheckAvailability = async () => {
    if (!formData.venue || !formData.date || !formData.start_time || !formData.end_time) {
      setErrors({ general: 'Please fill venue, date, and time fields to check availability' });
      return;
    }

    if (!validateTimeRange(formData.start_time, formData.end_time)) {
      setErrors({ time: 'End time must be after start time' });
      return;
    }

    setCheckingAvailability(true);
    setErrors({});

    try {
      const result = await bookingService.checkAvailability(
        formData.venue,
        formData.date,
        formData.start_time,
        formData.end_time
      );
      setAvailability(result);
    } catch (err) {
      setErrors({ general: handleApiError(err) });
    } finally {
      setCheckingAvailability(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.venue) newErrors.venue = 'Venue is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (!formData.event_name) newErrors.event_name = 'Event name is required';
    if (!formData.expected_attendees) newErrors.expected_attendees = 'Expected attendees is required';

    if (formData.start_time && formData.end_time && !validateTimeRange(formData.start_time, formData.end_time)) {
      newErrors.time = 'End time must be after start time';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await bookingService.create(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (err) {
      const errorMsg = handleApiError(err);
      if (typeof errorMsg === 'object') {
        setErrors(errorMsg);
      } else {
        setErrors({ general: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedVenue = venues.find(v => v.id === parseInt(formData.venue));

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

      <Typography variant="h3" component="h1" gutterBottom>
        Create New Booking
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Fill in the details below to book a venue
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Booking Hours:</strong> 8:00 AM - 9:00 PM | <strong>Minimum Duration:</strong> 1 hour
      </Alert>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Booking created successfully! Redirecting...
        </Alert>
      )}

      {errors.general && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.general}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            select
            label="Select Venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            error={!!errors.venue}
            helperText={errors.venue}
            margin="normal"
            required
          >
            <MenuItem value="">
              <em>Select a venue</em>
            </MenuItem>
            {venues.map((venue) => (
              <MenuItem key={venue.id} value={venue.id}>
                {venue.name} - Capacity: {venue.capacity}
              </MenuItem>
            ))}
          </TextField>

          {selectedVenue && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Location:</strong> {selectedVenue.location}
                <br />
                <strong>Capacity:</strong> {selectedVenue.capacity} people
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            type="date"
            label="Date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            error={!!errors.date}
            helperText={errors.date}
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: getTodayDate(),
              max: getMaxBookingDate(),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              select
              label="Start Time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              error={!!errors.start_time}
              helperText={errors.start_time || 'Select booking start time'}
              margin="normal"
              required
            >
              <MenuItem value="">
                <em>Select start time</em>
              </MenuItem>
              {generateTimeSlots().map((time) => (
                <MenuItem key={time.value} value={time.value}>
                  {time.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="End Time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              error={!!errors.end_time}
              helperText={errors.end_time || errors.time || 'Select booking end time'}
              margin="normal"
              required
            >
              <MenuItem value="">
                <em>Select end time</em>
              </MenuItem>
              {generateTimeSlots().map((time) => (
                <MenuItem key={time.value} value={time.value}>
                  {time.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {formData.venue && formData.date && formData.start_time && formData.end_time && (
            <Box sx={{ my: 2 }}>
              <Button
                variant="outlined"
                onClick={handleCheckAvailability}
                disabled={checkingAvailability}
                fullWidth
              >
                {checkingAvailability ? 'Checking...' : 'Check Availability'}
              </Button>
              
              {availability && (
                <Box sx={{ mt: 2 }}>
                  {availability.available ? (
                    <Alert severity="success" icon={<CheckCircleIcon />}>
                      {availability.message}
                    </Alert>
                  ) : (
                    <>
                      <Alert severity="error">
                        {availability.message}
                        {availability.conflicts && availability.conflicts.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">Conflicting bookings:</Typography>
                            {availability.conflicts.map((conflict, index) => (
                              <Typography key={index} variant="caption" display="block">
                                • {conflict.start_time} - {conflict.end_time}: {conflict.purpose}
                              </Typography>
                            ))}
                          </Box>
                        )}
                      </Alert>
                      <Box sx={{ mt: 2 }}>
                        <JoinWaitlistButton
                          venue={selectedVenue}
                          date={formData.date}
                          startTime={formData.start_time}
                          endTime={formData.end_time}
                          onSuccess={() => {
                            setSuccess(true);
                            setTimeout(() => {
                              navigate('/my-waitlist');
                            }, 2000);
                          }}
                          onError={(error) => {
                            setErrors({ general: error });
                          }}
                        />
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <TextField
            fullWidth
            label="Event Name"
            name="event_name"
            value={formData.event_name}
            onChange={handleChange}
            error={!!errors.event_name}
            helperText={errors.event_name}
            margin="normal"
            required
            placeholder="e.g., Department Meeting, Annual Workshop"
          />

          <TextField
            fullWidth
            label="Event Description (Optional)"
            name="event_description"
            value={formData.event_description}
            onChange={handleChange}
            error={!!errors.event_description}
            helperText={errors.event_description}
            margin="normal"
            multiline
            rows={2}
            placeholder="Brief description of the event"
          />

          <TextField
            fullWidth
            type="number"
            label="Expected Attendees"
            name="expected_attendees"
            value={formData.expected_attendees}
            onChange={handleChange}
            error={!!errors.expected_attendees}
            helperText={errors.expected_attendees || (selectedVenue ? `Maximum: ${selectedVenue.capacity}` : '')}
            margin="normal"
            required
            inputProps={{ min: 1, max: selectedVenue?.capacity }}
          />

          <TextField
            fullWidth
            label="Contact Number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            error={!!errors.contact_number}
            helperText={errors.contact_number}
            margin="normal"
            placeholder="e.g., +91-9876543210"
          />

          <TextField
            fullWidth
            label="Special Requirements (Optional)"
            name="special_requirements"
            value={formData.special_requirements}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={2}
            placeholder="e.g., Extra chairs, specific equipment"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || !availability?.available}
            sx={{ mt: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Booking'}
          </Button>

          {!availability?.available && formData.venue && formData.date && (
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 1 }}>
              Please check availability before creating booking
            </Typography>
          )}
        </form>
      </Paper>
    </Container>
  );
};

export default CreateBookingPage;

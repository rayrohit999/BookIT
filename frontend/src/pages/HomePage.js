import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Box, Grid, Card, CardContent } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to BookIT
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Pimpri Chinchwad College of Engineering - Venue Booking System
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: 'auto' }}>
          Efficiently manage and book college venues with our time-slot based booking system.
          Say goodbye to full-day bookings and maximize venue utilization.
        </Typography>
        <Box sx={{ mt: 4 }}>
          {user ? (
            <>
              {user.can_book && (
                <Button
                  component={Link}
                  to="/bookings/new"
                  variant="contained"
                  size="large"
                  sx={{ mr: 2 }}
                >
                  Book a Venue
                </Button>
              )}
              <Button
                component={Link}
                to="/venues"
                variant="outlined"
                size="large"
              >
                Browse Venues
              </Button>
            </>
          ) : (
            <>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
                sx={{ mr: 2 }}
              >
                Login
              </Button>
              <Button
                component={Link}
                to="/venues"
                variant="outlined"
                size="large"
              >
                Browse Venues
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 6 }}>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <EventIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Time-Slot Booking
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Book venues for specific time slots, not full days. Maximize venue utilization
                  and accommodate multiple events on the same day.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <LocationOnIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Multiple Venues
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Access to LRDC Hall (150 capacity) and Seminar Hall (250 capacity) with
                  modern facilities including projectors, sound systems, and more.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Role-Based Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Different access levels for HODs, Deans, Hall Admins, and Super Admins.
                  Instant booking confirmation with no approval delays.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper', borderRadius: 2, px: 4 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4 }}>
          How It Works
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Step 1
              </Typography>
              <Typography variant="body1">
                Browse available venues and check their facilities
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Step 2
              </Typography>
              <Typography variant="body1">
                Select date and time slot for your event
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Step 3
              </Typography>
              <Typography variant="body1">
                Check availability and provide event details
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Step 4
              </Typography>
              <Typography variant="body1">
                Get instant confirmation - no approval needed!
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>


    </Container>
  );
};

export default HomePage;

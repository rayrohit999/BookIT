import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Layout = ({ children }) => {
  const { user, logout, isSuperAdmin, isHallAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontWeight: 'bold',
            }}
          >
            BookIT - PCCOE
          </Typography>

          <Button color="inherit" component={Link} to="/venues">
            Venues
          </Button>

          <Button color="inherit" component={Link} to="/calendar">
            Calendar
          </Button>

          {user ? (
            <>
              {user.can_book && (
                <Button color="inherit" component={Link} to="/bookings/new">
                  New Booking
                </Button>
              )}
              <Button color="inherit" component={Link} to="/my-bookings">
                My Bookings
              </Button>
              {isSuperAdmin() && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin
                </Button>
              )}
              {isHallAdmin() && (
                <Button color="inherit" component={Link} to="/hall-admin">
                  Hall Admin
                </Button>
              )}
              <NotificationBell />
              <Button color="inherit" component={Link} to="/profile">
                Profile
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
        {children}
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 BookIT - Pimpri Chinchwad College of Engineering. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;

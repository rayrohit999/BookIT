import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { venueService, bookingService, userService, venueAdminService } from '../services';
import { handleApiError, getRoleDisplayName } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [stats, setStats] = useState({
    totalVenues: 0,
    totalBookings: 0,
    totalUsers: 0,
    upcomingBookings: 0,
  });

  // Data states
  const [venues, setVenues] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [venueAdmins, setVenueAdmins] = useState([]);

  // Dialog states
  const [venueDialog, setVenueDialog] = useState({ open: false, venue: null });
  const [userDialog, setUserDialog] = useState({ open: false, user: null });
  const [venueAdminDialog, setVenueAdminDialog] = useState({ open: false, assignment: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: null });

  // Form data
  const [venueForm, setVenueForm] = useState({
    name: '',
    location: '',
    capacity: '',
    description: '',
    facilities: '',
  });

  const [userForm, setUserForm] = useState({
    email: '',
    full_name: '',
    role: 'hod',
  });

  const [venueAdminForm, setVenueAdminForm] = useState({
    user: '',
    venue: '',
  });

  useEffect(() => {
    if (user && user.role === 'super_admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [venuesData, bookingsData, usersData, venueAdminsData] = await Promise.all([
        venueService.getAll(),
        bookingService.getAll(),
        userService.getAll(),
        venueAdminService.getAll(),
      ]);

      const venuesList = venuesData.results || venuesData;
      const bookingsList = bookingsData.results || bookingsData;
      const usersList = usersData.results || usersData;
      const venueAdminsList = venueAdminsData.results || venueAdminsData;

      setVenues(venuesList);
      setBookings(bookingsList);
      setUsers(usersList);
      setVenueAdmins(venueAdminsList);

      const now = new Date();
      const upcomingCount = bookingsList.filter(
        (b) => new Date(b.date) >= now && b.status === 'confirmed'
      ).length;

      setStats({
        totalVenues: venuesList.length,
        totalBookings: bookingsList.length,
        totalUsers: usersList.length,
        upcomingBookings: upcomingCount,
      });

      setError('');
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Venue management
  const openVenueDialog = (venue = null) => {
    if (venue) {
      setVenueForm({
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity,
        description: venue.description || '',
        facilities: venue.facilities || '',
      });
    } else {
      setVenueForm({
        name: '',
        location: '',
        capacity: '',
        description: '',
        facilities: '',
      });
    }
    setVenueDialog({ open: true, venue });
  };

  const closeVenueDialog = () => {
    setVenueDialog({ open: false, venue: null });
  };

  const handleVenueSubmit = async () => {
    try {
      if (venueDialog.venue) {
        await venueService.update(venueDialog.venue.id, venueForm);
      } else {
        await venueService.create(venueForm);
      }
      fetchDashboardData();
      closeVenueDialog();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  // User management
  const openUserDialog = (userData = null) => {
    if (userData) {
      setUserForm({
        email: userData.email,
        full_name: userData.full_name || '',
        role: userData.role,
      });
    } else {
      setUserForm({
        email: '',
        full_name: '',
        role: 'hod',
      });
    }
    setUserDialog({ open: true, user: userData });
  };

  const closeUserDialog = () => {
    setUserDialog({ open: false, user: null });
  };

  const handleUserSubmit = async () => {
    try {
      if (userDialog.user) {
        await userService.update(userDialog.user.id, userForm);
      } else {
        await userService.create({ ...userForm, password: 'password123' });
      }
      fetchDashboardData();
      closeUserDialog();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  // Venue Admin assignment
  const openVenueAdminDialog = (assignment = null) => {
    if (assignment) {
      setVenueAdminForm({
        user: assignment.user,
        venue: assignment.venue,
      });
    } else {
      setVenueAdminForm({
        user: '',
        venue: '',
      });
    }
    setVenueAdminDialog({ open: true, assignment });
  };

  const closeVenueAdminDialog = () => {
    setVenueAdminDialog({ open: false, assignment: null });
  };

  const handleVenueAdminSubmit = async () => {
    try {
      if (venueAdminDialog.assignment) {
        await venueAdminService.update(venueAdminDialog.assignment.id, venueAdminForm);
      } else {
        await venueAdminService.create(venueAdminForm);
      }
      fetchDashboardData();
      closeVenueAdminDialog();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  // Delete functionality
  const openDeleteDialog = (type, id) => {
    setDeleteDialog({ open: true, type, id });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, type: '', id: null });
  };

  const handleDelete = async () => {
    try {
      switch (deleteDialog.type) {
        case 'venue':
          await venueService.delete(deleteDialog.id);
          break;
        case 'user':
          await userService.delete(deleteDialog.id);
          break;
        case 'venueAdmin':
          await venueAdminService.delete(deleteDialog.id);
          break;
        default:
          break;
      }
      fetchDashboardData();
      closeDeleteDialog();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  if (!user || user.role !== 'super_admin') {
    return (
      <Container maxWidth="lg">
        <Alert severity="error">Access Denied. Super Admin privileges required.</Alert>
      </Container>
    );
  }

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
        Admin Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Venues
                  </Typography>
                  <Typography variant="h4">{stats.totalVenues}</Typography>
                </Box>
                <BusinessIcon color="primary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Bookings
                  </Typography>
                  <Typography variant="h4">{stats.totalBookings}</Typography>
                </Box>
                <EventIcon color="success" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">{stats.totalUsers}</Typography>
                </Box>
                <PeopleIcon color="info" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Upcoming
                  </Typography>
                  <Typography variant="h4">{stats.upcomingBookings}</Typography>
                </Box>
                <EventIcon color="warning" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Venues" />
          <Tab label="Users" />
          <Tab label="Venue Assignments" />
        </Tabs>
      </Paper>

      {/* Venues Tab */}
      {currentTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Manage Venues</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openVenueDialog()}
            >
              Add Venue
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Capacity</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {venues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell>{venue.name}</TableCell>
                    <TableCell>{venue.location}</TableCell>
                    <TableCell>{venue.capacity}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openVenueDialog(venue)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog('venue', venue.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Users Tab */}
      {currentTab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Manage Users</Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => openUserDialog()}
            >
              Add User
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Full Name</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell>{userData.email}</TableCell>
                    <TableCell>{userData.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={getRoleDisplayName(userData.role)} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openUserDialog(userData)}>
                        <EditIcon />
                      </IconButton>
                      {userData.id !== user.id && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openDeleteDialog('user', userData.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Venue Assignments Tab */}
      {currentTab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Venue Admin Assignments</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => openVenueAdminDialog()}
            >
              Add Assignment
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Venue</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {venueAdmins.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.user_details?.email || 'N/A'}</TableCell>
                    <TableCell>{assignment.venue_details?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openVenueAdminDialog(assignment)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteDialog('venueAdmin', assignment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Venue Dialog */}
      <Dialog open={venueDialog.open} onClose={closeVenueDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{venueDialog.venue ? 'Edit Venue' : 'Add Venue'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={venueForm.name}
            onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={venueForm.location}
            onChange={(e) => setVenueForm({ ...venueForm, location: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Capacity"
            value={venueForm.capacity}
            onChange={(e) => setVenueForm({ ...venueForm, capacity: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={venueForm.description}
            onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Facilities (comma-separated)"
            value={venueForm.facilities}
            onChange={(e) => setVenueForm({ ...venueForm, facilities: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVenueDialog}>Cancel</Button>
          <Button onClick={handleVenueSubmit} variant="contained">
            {venueDialog.venue ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userDialog.open} onClose={closeUserDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{userDialog.user ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            margin="normal"
            disabled={!!userDialog.user}
          />
          <TextField
            fullWidth
            label="Full Name"
            value={userForm.full_name}
            onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
            margin="normal"
          />
          <TextField
            select
            fullWidth
            label="Role"
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            margin="normal"
          >
            <MenuItem value="hod">HOD</MenuItem>
            <MenuItem value="dean">Dean</MenuItem>
            <MenuItem value="hall_admin">Hall Admin</MenuItem>
            <MenuItem value="super_admin">Super Admin</MenuItem>
          </TextField>
          {!userDialog.user && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Default password will be set to: password123
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeUserDialog}>Cancel</Button>
          <Button onClick={handleUserSubmit} variant="contained">
            {userDialog.user ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Venue Admin Dialog */}
      <Dialog open={venueAdminDialog.open} onClose={closeVenueAdminDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {venueAdminDialog.assignment ? 'Edit Assignment' : 'Add Assignment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            label="User (Hall Admin)"
            value={venueAdminForm.user}
            onChange={(e) => setVenueAdminForm({ ...venueAdminForm, user: e.target.value })}
            margin="normal"
          >
            {users
              .filter((u) => u.role === 'hall_admin')
              .map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.email} - {u.full_name || 'N/A'}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Venue"
            value={venueAdminForm.venue}
            onChange={(e) => setVenueAdminForm({ ...venueAdminForm, venue: e.target.value })}
            margin="normal"
          >
            {venues.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVenueAdminDialog}>Cancel</Button>
          <Button onClick={handleVenueAdminSubmit} variant="contained">
            {venueAdminDialog.assignment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this {deleteDialog.type}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Avatar,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { getRoleDisplayName, handleApiError } from '../utils/helpers';
import { formatDate } from '../utils/dateUtils';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
  });

  // Password change dialog
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - reset form
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        department: user.department || '',
      });
      setError('');
    }
    setEditMode(!editMode);
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authService.updateProfile(profileData);
      updateUser(response.user);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenPasswordDialog = () => {
    setPasswordDialog(true);
    setPasswordData({
      old_password: '',
      new_password: '',
      confirm_password: '',
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialog(false);
    setPasswordData({
      old_password: '',
      new_password: '',
      confirm_password: '',
    });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    setChangingPassword(true);

    try {
      await authService.changePassword(user.id, {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      
      setPasswordSuccess('Password changed successfully!');
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClosePasswordDialog();
      }, 2000);
    } catch (err) {
      setPasswordError(handleApiError(err));
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" component="h1">
          My Profile
        </Typography>
        {!editMode && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEditToggle}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'primary.main',
              mr: 3,
              fontSize: '2.5rem',
            }}
          >
            {profileData.first_name?.[0]}{profileData.last_name?.[0]}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            {!editMode ? (
              <>
                <Typography variant="h4">
                  {user.first_name} {user.last_name}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={getRoleDisplayName(user.role)}
                    color="primary"
                    size="small"
                  />
                  {user.can_book && (
                    <Chip 
                      label="Can Book Venues" 
                      color="success" 
                      size="small" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </Box>
              </>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileChange}
                    size="small"
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileChange}
                    size="small"
                    required
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Email (Read-only) */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Phone */}
          <Grid item xs={12} md={6}>
            {!editMode ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {user.phone || 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                placeholder="+91-XXXXXXXXXX"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            )}
          </Grid>

          {/* Department */}
          <Grid item xs={12} md={6}>
            {!editMode ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1">
                    {user.department || 'Not specified'}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={profileData.department}
                onChange={handleProfileChange}
                placeholder="e.g., Computer Engineering"
                InputProps={{
                  startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            )}
          </Grid>

          {/* Role (Read-only) */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Role
                </Typography>
                <Typography variant="body1">
                  {getRoleDisplayName(user.role)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Member Since */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {formatDate(user.date_joined)}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Last Updated */}
          {user.updated_at && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(user.updated_at)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Edit Mode Actions */}
        {editMode && (
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleEditToggle}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveProfile}
              disabled={loading}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Paper>

      {/* Change Password Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Password & Security
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Keep your account secure by using a strong password
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LockIcon />}
            onClick={handleOpenPasswordDialog}
          >
            Change Password
          </Button>
        </Box>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Account Status:</strong> {user.is_active ? 'Active ✅' : 'Inactive ❌'}
          </Typography>
        </Box>
      </Paper>

      {/* Change Password Dialog */}
      <Dialog 
        open={passwordDialog} 
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}

          <TextField
            fullWidth
            type="password"
            label="Current Password"
            name="old_password"
            value={passwordData.old_password}
            onChange={handlePasswordChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            name="new_password"
            value={passwordData.new_password}
            onChange={handlePasswordChange}
            margin="normal"
            required
            helperText="Minimum 8 characters"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            name="confirm_password"
            value={passwordData.confirm_password}
            onChange={handlePasswordChange}
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={changingPassword}>
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={changingPassword}
            startIcon={changingPassword ? <CircularProgress size={20} /> : <LockIcon />}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;

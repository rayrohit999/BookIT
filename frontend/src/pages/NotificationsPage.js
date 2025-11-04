import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState(0); // 0: All, 1: Unread

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificationService.getAll();
      // Handle both paginated and non-paginated responses
      const notificationsList = data.results || data;
      setNotifications(Array.isArray(notificationsList) ? notificationsList : []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
      setSuccess('Notification marked as read');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setSuccess('All notifications marked as read');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setSuccess('Notification deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAll();
      setNotifications(notifications.filter(n => !n.is_read));
      setSuccess('All read notifications cleared');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to clear notifications');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getFilteredNotifications = () => {
    if (tab === 1) {
      return notifications.filter(n => !n.is_read);
    }
    return notifications;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return '✅';
      case 'booking_cancelled':
        return '❌';
      case 'new_booking':
        return '📅';
      case 'venue_assigned':
        return '🏢';
      case 'user_created':
        return '👤';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return 'success';
      case 'booking_cancelled':
        return 'error';
      case 'new_booking':
        return 'info';
      case 'venue_assigned':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<CheckCircleIcon />}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
                <Tab label={`All (${notifications.length})`} />
                <Tab label={`Unread (${unreadCount})`} />
              </Tabs>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : filteredNotifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {tab === 1 ? 'No unread notifications' : 'No notifications yet'}
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {filteredNotifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    {index > 0 && <Divider />}
                    <ListItem
                      sx={{
                        cursor: notification.link ? 'pointer' : 'default',
                        bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                        py: 2,
                        borderLeft: 4,
                        borderColor: `${getNotificationColor(notification.notification_type)}.main`,
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', mr: 2 }}>
                        <Typography variant="h5" sx={{ mr: 2, mt: 0.5 }}>
                          {getNotificationIcon(notification.notification_type)}
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={notification.is_read ? 400 : 600}
                            >
                              {notification.title}
                            </Typography>
                            {!notification.is_read && (
                              <CircleIcon sx={{ fontSize: 10, color: 'primary.main' }} />
                            )}
                          </Box>
                          <ListItemText
                            primary={
                              <Typography variant="body2" color="text.secondary">
                                {notification.message}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Chip
                                  label={notification.notification_type.replace('_', ' ')}
                                  size="small"
                                  color={getNotificationColor(notification.notification_type)}
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.disabled">
                                  {notification.time_ago}
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {notifications.filter(n => n.is_read).length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="text"
              color="error"
              onClick={handleClearAll}
              startIcon={<DeleteIcon />}
            >
              Clear all read notifications
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default NotificationsPage;

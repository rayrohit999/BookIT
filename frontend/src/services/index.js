import api from './api';

// Authentication Services
export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    const { access, refresh, user } = response.data;
    
    // Store tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { access, refresh, user };
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/auth/logout/', { refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  // Change password
  changePassword: async (userId, passwords) => {
    const response = await api.post(`/users/${userId}/change_password/`, passwords);
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Get stored user
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/update_profile/', userData);
    // Update stored user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Change password
  changePassword: async (userId, passwords) => {
    const response = await api.post(`/users/${userId}/change_password/`, passwords);
    return response.data;
  },
};

// Venue Services
export const venueService = {
  // Get all venues
  getAll: async (params = {}) => {
    const response = await api.get('/venues/', { params });
    return response.data;
  },

  // Get venue by ID
  getById: async (id) => {
    const response = await api.get(`/venues/${id}/`);
    return response.data;
  },

  // Create venue (Super Admin only)
  create: async (venueData) => {
    const response = await api.post('/venues/', venueData);
    return response.data;
  },

  // Update venue (Super Admin only)
  update: async (id, venueData) => {
    const response = await api.put(`/venues/${id}/`, venueData);
    return response.data;
  },

  // Partial update venue (Super Admin only)
  partialUpdate: async (id, venueData) => {
    const response = await api.patch(`/venues/${id}/`, venueData);
    return response.data;
  },

  // Delete venue (Super Admin only)
  delete: async (id) => {
    const response = await api.delete(`/venues/${id}/`);
    return response.data;
  },

  // Get venues assigned to current Hall Admin
  getMyVenues: async () => {
    const response = await api.get('/venue-admins/my_venues/');
    return response.data;
  },

  // Toggle venue availability (Super Admin or assigned Hall Admin)
  toggleAvailability: async (id) => {
    const response = await api.post(`/venues/${id}/toggle-availability/`);
    return response.data;
  },
};

// Booking Services
export const bookingService = {
  // Get all bookings (filtered by role)
  getAll: async (params = {}) => {
    const response = await api.get('/bookings/', { params });
    return response.data;
  },

  // Get booking by ID
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}/`);
    return response.data;
  },

  // Create booking
  create: async (bookingData) => {
    const response = await api.post('/bookings/', bookingData);
    return response.data;
  },

  // Update booking (Super Admin only)
  update: async (id, bookingData) => {
    const response = await api.put(`/bookings/${id}/`, bookingData);
    return response.data;
  },

  // Cancel booking
  cancel: async (id, reason) => {
    const response = await api.post(`/bookings/${id}/cancel/`, {
      cancellation_reason: reason,
    });
    return response.data;
  },

  // Get my bookings
  getMyBookings: async () => {
    const response = await api.get('/bookings/my_bookings/');
    return response.data;
  },

  // Check availability
  checkAvailability: async (venueId, date, startTime, endTime) => {
    const response = await api.post('/bookings/check_availability/', {
      venue: venueId,
      date,
      start_time: startTime,
      end_time: endTime,
    });
    return response.data;
  },

  // Get upcoming bookings
  getUpcoming: async () => {
    const response = await api.get('/bookings/upcoming/');
    return response.data;
  },

  // Get past bookings
  getPast: async () => {
    const response = await api.get('/bookings/past/');
    return response.data;
  },

  // Get public calendar data (no auth required)
  getPublicCalendar: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/bookings/public_calendar/', { params });
    return response.data;
  },
};

// User Services
export const userService = {
  // Get all users
  getAll: async (params = {}) => {
    const response = await api.get('/users/', { params });
    return response.data;
  },

  // Get user by ID
  getById: async (id) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },

  // Update user (Super Admin only)
  update: async (id, userData) => {
    const response = await api.put(`/users/${id}/`, userData);
    return response.data;
  },

  // Delete user (Super Admin only)
  delete: async (id) => {
    const response = await api.delete(`/users/${id}/`);
    return response.data;
  },
};

// Venue Admin Services
export const venueAdminService = {
  // Get all venue admin assignments
  getAll: async () => {
    const response = await api.get('/venue-admins/');
    return response.data;
  },

  // Create venue admin assignment
  create: async (assignmentData) => {
    const response = await api.post('/venue-admins/', assignmentData);
    return response.data;
  },

  // Delete venue admin assignment
  delete: async (id) => {
    const response = await api.delete(`/venue-admins/${id}/`);
    return response.data;
  },

  // Get admins by venue
  getByVenue: async (venueId) => {
    const response = await api.get('/venue-admins/by_venue/', {
      params: { venue_id: venueId },
    });
    return response.data;
  },

  // Get venues by admin
  getByAdmin: async (adminId) => {
    const response = await api.get('/venue-admins/by_admin/', {
      params: { admin_id: adminId },
    });
    return response.data;
  },
};

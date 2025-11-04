export const getRoleDisplayName = (role) => {
  const roleMap = {
    super_admin: 'Super Admin',
    hod: 'Head of Department',
    dean: 'Dean',
    hall_admin: 'Hall Admin',
  };
  return roleMap[role] || role;
};

export const getStatusColor = (status) => {
  const colorMap = {
    confirmed: 'success',
    cancelled: 'error',
    pending: 'warning',
  };
  return colorMap[status] || 'default';
};

export const getStatusDisplayName = (status) => {
  const statusMap = {
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    pending: 'Pending',
  };
  return statusMap[status] || status;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return password.length >= 8;
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const { data, status } = error.response;
    
    if (status === 401) {
      return 'Authentication failed. Please login again.';
    }
    
    if (status === 403) {
      return 'You do not have permission to perform this action.';
    }
    
    if (status === 404) {
      return 'Resource not found.';
    }
    
    if (status === 500) {
      return 'Server error. Please try again later.';
    }
    
    // Handle validation errors
    if (data && typeof data === 'object') {
      const errors = [];
      for (const [field, messages] of Object.entries(data)) {
        if (Array.isArray(messages)) {
          errors.push(`${field}: ${messages.join(', ')}`);
        } else {
          errors.push(`${field}: ${messages}`);
        }
      }
      return errors.join('\n');
    }
    
    return data?.message || data?.error || 'An error occurred';
  }
  
  if (error.request) {
    return 'No response from server. Please check your connection.';
  }
  
  return error.message || 'An unexpected error occurred';
};

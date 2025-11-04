export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  // Convert 24-hour time to 12-hour format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const d = new Date(dateTime);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

export const formatTimeForInput = (time) => {
  if (!time) return '';
  // Ensure time is in HH:MM format
  const [hours, minutes] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

export const getMaxBookingDate = () => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90); // 90 days from today
  return maxDate.toISOString().split('T')[0];
};

export const isDateInPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

export const canCancelBooking = (bookingDate, startTime) => {
  const now = new Date();
  const bookingDateTime = new Date(`${bookingDate}T${startTime}`);
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return bookingDateTime > twoHoursFromNow;
};

export const getTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
      slots.push(time);
    }
  }
  return slots;
};

export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return false;
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  return end > start;
};

from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import datetime, time


class Booking(models.Model):
    """Model representing a venue booking"""
    
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    # Foreign Keys
    venue = models.ForeignKey(
        'venue_management.Venue',
        on_delete=models.PROTECT,
        related_name='bookings',
        help_text="Venue being booked"
    )
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='bookings',
        help_text="User who made the booking"
    )
    
    # Event Details
    event_name = models.CharField(
        max_length=200,
        help_text="Name/title of the event"
    )
    event_description = models.TextField(
        null=True,
        blank=True,
        help_text="Purpose/details of the event"
    )
    
    # Date and Time
    date = models.DateField(help_text="Booking date")
    start_time = models.TimeField(help_text="Event start time")
    end_time = models.TimeField(help_text="Event end time")
    
    # Attendees and Contact
    expected_attendees = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Expected number of attendees"
    )
    contact_number = models.CharField(
        max_length=20,
        help_text="Contact number for the event"
    )
    
    # Additional Requirements
    special_requirements = models.TextField(
        null=True,
        blank=True,
        help_text="Any special needs/requirements"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='confirmed',
        help_text="Booking status"
    )
    
    # Cancellation
    cancellation_reason = models.TextField(
        null=True,
        blank=True,
        help_text="Reason for cancellation (if cancelled)"
    )
    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Cancellation timestamp"
    )
    
    # Reminder System Fields (Auto-Cancel & Waitlist Feature)
    reminder_sent = models.BooleanField(
        default=False,
        help_text="Whether 24-hour reminder has been sent"
    )
    reminder_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when reminder was sent"
    )
    
    # Confirmation System Fields
    confirmed = models.BooleanField(
        default=False,
        help_text="Whether user has confirmed the booking"
    )
    confirmed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when booking was confirmed"
    )
    
    # Auto-Cancellation Fields
    auto_cancelled = models.BooleanField(
        default=False,
        help_text="Whether booking was auto-cancelled by system"
    )
    auto_cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when auto-cancelled"
    )
    auto_cancel_reason = models.CharField(
        max_length=255,
        blank=True,
        help_text="Reason for auto-cancellation"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-date', '-start_time']
        # Prevent double booking: same venue, date, and overlapping time
        constraints = [
            models.UniqueConstraint(
                fields=['venue', 'date', 'start_time', 'end_time'],
                name='unique_venue_datetime'
            )
        ]
        indexes = [
            models.Index(fields=['venue', 'date']),
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['date']),
            # Indexes for auto-cancel & waitlist feature
            models.Index(fields=['date', 'status', 'reminder_sent']),
            models.Index(fields=['date', 'start_time', 'confirmed']),
            models.Index(fields=['venue', 'date', 'status']),
        ]

    def __str__(self):
        return f"{self.event_name} - {self.venue.name} on {self.date}"
    
    def clean(self):
        """Validate booking data"""
        errors = {}
        
        # Check if end time is after start time
        if self.start_time and self.end_time:
            if self.end_time <= self.start_time:
                errors['end_time'] = 'End time must be after start time'
        
        # Check if date is not in the past
        if self.date and self.date < timezone.now().date():
            errors['date'] = 'Cannot book dates in the past'
        
        # Check if attendees don't exceed venue capacity
        if self.venue and self.expected_attendees:
            if self.expected_attendees > self.venue.capacity:
                errors['expected_attendees'] = f'Expected attendees ({self.expected_attendees}) exceed venue capacity ({self.venue.capacity})'
        
        # Check if booking is not too far in advance (90 days)
        if self.date:
            days_ahead = (self.date - timezone.now().date()).days
            if days_ahead > 90:
                errors['date'] = 'Cannot book more than 90 days in advance'
        
        if errors:
            raise ValidationError(errors)
    
    def save(self, *args, **kwargs):
        """Override save to run validation"""
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def duration_hours(self):
        """Calculate duration in hours"""
        if self.start_time and self.end_time:
            start = datetime.combine(self.date, self.start_time)
            end = datetime.combine(self.date, self.end_time)
            duration = end - start
            return duration.total_seconds() / 3600
        return 0
    
    @property
    def is_past(self):
        """Check if booking is in the past"""
        booking_datetime = datetime.combine(self.date, self.end_time)
        return timezone.make_aware(booking_datetime) < timezone.now()
    
    @property
    def is_upcoming(self):
        """Check if booking is in the future"""
        booking_datetime = datetime.combine(self.date, self.start_time)
        return timezone.make_aware(booking_datetime) > timezone.now()
    
    @property
    def is_ongoing(self):
        """Check if booking is currently happening"""
        now = timezone.now()
        start_datetime = timezone.make_aware(datetime.combine(self.date, self.start_time))
        end_datetime = timezone.make_aware(datetime.combine(self.date, self.end_time))
        return start_datetime <= now <= end_datetime
    
    def can_cancel(self):
        """Check if booking can be cancelled"""
        if self.status == 'cancelled':
            return False
        if self.is_past:
            return False
        # Cannot cancel within 2 hours of start time
        start_datetime = timezone.make_aware(datetime.combine(self.date, self.start_time))
        hours_until_start = (start_datetime - timezone.now()).total_seconds() / 3600
        return hours_until_start > 2
    
    def cancel(self, reason=''):
        """Cancel the booking"""
        if not self.can_cancel():
            raise ValidationError('Cannot cancel this booking')
        self.status = 'cancelled'
        self.cancellation_reason = reason
        self.cancelled_at = timezone.now()
        self.save()


class VenueAdmin(models.Model):
    """Model mapping Hall Admins to their assigned venues"""
    
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='managed_venues',
        limit_choices_to={'role': 'hall_admin'},
        help_text="Hall Admin user"
    )
    venue = models.ForeignKey(
        'venue_management.Venue',
        on_delete=models.CASCADE,
        related_name='venue_admins',
        help_text="Assigned venue"
    )
    assigned_date = models.DateTimeField(
        auto_now_add=True,
        help_text="Assignment date"
    )

    class Meta:
        db_table = 'venue_admins'
        verbose_name = 'Venue Administrator'
        verbose_name_plural = 'Venue Administrators'
        unique_together = ['user', 'venue']
        ordering = ['venue__name', 'user__first_name']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.venue.name}"
    
    def clean(self):
        """Validate venue admin assignment"""
        if self.user and self.user.role != 'hall_admin':
            raise ValidationError('Only users with hall_admin role can be assigned as venue administrators')


class Waitlist(models.Model):
    """
    Waitlist entries for fully booked time slots.
    Users are notified when a slot becomes available.
    """
    
    # Booking Details
    venue = models.ForeignKey(
        'venue_management.Venue',
        on_delete=models.CASCADE,
        related_name='waitlist_entries',
        help_text="Venue for waitlist"
    )
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='waitlist_entries',
        help_text="User waiting for this slot"
    )
    date = models.DateField(help_text="Requested booking date")
    start_time = models.TimeField(help_text="Requested start time")
    end_time = models.TimeField(help_text="Requested end time")
    
    # Metadata
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When user joined waitlist"
    )
    
    # Notification Status
    notified = models.BooleanField(
        default=False,
        help_text="Whether user has been notified of available slot"
    )
    notified_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When user was notified"
    )
    
    # Claim Status
    claimed = models.BooleanField(
        default=False,
        help_text="Whether user claimed the slot"
    )
    claimed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When slot was claimed"
    )
    expired = models.BooleanField(
        default=False,
        help_text="Whether notification expired (15-min window passed)"
    )
    
    # Priority (for future enhancements)
    priority = models.IntegerField(
        default=0,
        help_text="Lower number = higher priority (0 = normal)"
    )
    
    class Meta:
        db_table = 'waitlist'
        verbose_name = 'Waitlist Entry'
        verbose_name_plural = 'Waitlist Entries'
        ordering = ['priority', 'created_at']  # FIFO with priority
        indexes = [
            models.Index(fields=['venue', 'date', 'start_time']),
            models.Index(fields=['user', 'claimed', 'expired']),
            models.Index(fields=['notified', 'expired', 'claimed']),
            models.Index(fields=['priority', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.venue.name} on {self.date}"
    
    def is_expired(self):
        """Check if notification has expired (15 minutes passed)"""
        if not self.notified_at:
            return False
        from datetime import timedelta
        expiry_time = self.notified_at + timedelta(minutes=15)
        return timezone.now() > expiry_time
    
    def time_remaining(self):
        """Get seconds remaining to claim slot"""
        if not self.notified_at or self.expired:
            return 0
        from datetime import timedelta
        expiry_time = self.notified_at + timedelta(minutes=15)
        remaining = (expiry_time - timezone.now()).total_seconds()
        return max(0, int(remaining))


# Import Notification model from separate file to keep models organized
from .notification_models import Notification

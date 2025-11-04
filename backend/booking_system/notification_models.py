from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    Model for in-app notifications
    """
    
    NOTIFICATION_TYPES = [
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('booking_reminder', 'Booking Reminder'),
        ('new_booking', 'New Booking'),  # For Hall Admin
        ('venue_assigned', 'Venue Assigned'),  # For Hall Admin
        ('user_created', 'User Created'),
        ('system', 'System Notification'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="User who will receive this notification"
    )
    
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        help_text="Type of notification"
    )
    
    title = models.CharField(
        max_length=200,
        help_text="Notification title"
    )
    
    message = models.TextField(
        help_text="Notification message"
    )
    
    link = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Optional link to related page"
    )
    
    is_read = models.BooleanField(
        default=False,
        help_text="Whether notification has been read"
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When notification was created"
    )
    
    read_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When notification was marked as read"
    )
    
    # Optional: Link to related objects
    related_booking_id = models.IntegerField(
        blank=True,
        null=True,
        help_text="ID of related booking"
    )
    
    related_venue_id = models.IntegerField(
        blank=True,
        null=True,
        help_text="ID of related venue"
    )
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.title} ({'Read' if self.is_read else 'Unread'})"
    
    def mark_as_read(self):
        """Mark notification as read"""
        from django.utils import timezone
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

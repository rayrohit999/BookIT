# Auto-Cancellation & Waitlist System - Implementation Guide

## 📋 Table of Contents
1. [Phase 1: Foundation](#phase-1-foundation)
2. [Phase 2: Auto-Cancellation](#phase-2-auto-cancellation)
3. [Phase 3: Waitlist System](#phase-3-waitlist-system)
4. [Testing Guide](#testing-guide)
5. [Troubleshooting](#troubleshooting)

---

## Phase 1: Foundation

### Step 1.1: Update Booking Model

**File**: `backend/booking_system/models.py`

**Add these fields to the Booking model:**
```python
class Booking(models.Model):
    # ... existing fields ...
    
    # Reminder System Fields
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
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['date', 'status', 'reminder_sent']),
            models.Index(fields=['date', 'start_time', 'confirmed']),
            models.Index(fields=['venue', 'date', 'status']),
        ]
```

### Step 1.2: Create Waitlist Model

**File**: `backend/booking_system/models.py`

**Add new Waitlist model:**
```python
class Waitlist(models.Model):
    """
    Waitlist entries for fully booked time slots.
    Users are notified when a slot becomes available.
    """
    
    # Booking Details
    venue = models.ForeignKey(
        'venue_management.Venue',
        on_delete=models.CASCADE,
        related_name='waitlist_entries'
    )
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='waitlist_entries'
    )
    date = models.DateField(help_text="Requested booking date")
    start_time = models.TimeField(help_text="Requested start time")
    end_time = models.TimeField(help_text="Requested end time")
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
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
        ordering = ['priority', 'created_at']  # FIFO with priority
        indexes = [
            models.Index(fields=['venue', 'date', 'start_time']),
            models.Index(fields=['user', 'claimed', 'expired']),
            models.Index(fields=['notified', 'expired', 'claimed']),
            models.Index(fields=['priority', 'created_at']),
        ]
        verbose_name_plural = "Waitlist entries"
    
    def __str__(self):
        return f"{self.user.email} - {self.venue.name} on {self.date}"
    
    def is_expired(self):
        """Check if notification has expired (15 minutes passed)"""
        if not self.notified_at:
            return False
        from django.utils import timezone
        expiry_time = self.notified_at + timedelta(minutes=15)
        return timezone.now() > expiry_time
    
    def time_remaining(self):
        """Get seconds remaining to claim slot"""
        if not self.notified_at or self.expired:
            return 0
        from django.utils import timezone
        expiry_time = self.notified_at + timedelta(minutes=15)
        remaining = (expiry_time - timezone.now()).total_seconds()
        return max(0, int(remaining))
```

### Step 1.3: Create Database Migrations

**Commands to run:**
```bash
cd D:\PCCOE\Projects\BookIT\backend
.\venv\Scripts\activate
python manage.py makemigrations booking_system
python manage.py migrate booking_system
```

**Expected output:**
```
Migrations for 'booking_system':
  booking_system\migrations\0003_booking_reminder_fields_and_waitlist.py
    - Add field reminder_sent to booking
    - Add field reminder_sent_at to booking
    - Add field confirmed to booking
    - Add field confirmed_at to booking
    - Add field auto_cancelled to booking
    - Add field auto_cancelled_at to booking
    - Add field auto_cancel_reason to booking
    - Create model Waitlist
    - Add indexes to Booking
    - Add indexes to Waitlist
```

### Step 1.4: Configure Celery Beat

**File**: `backend/config/settings.py`

**Add to the end of the file:**
```python
# ============================
# CELERY BEAT CONFIGURATION
# ============================

from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    # Send reminder emails 24 hours before event
    'send-booking-reminders': {
        'task': 'booking_system.tasks.send_booking_reminders',
        'schedule': crontab(minute=0),  # Every hour at :00
        'options': {
            'expires': 3600,  # Task expires after 1 hour
        }
    },
    
    # Auto-cancel unconfirmed bookings 2 hours before event
    'auto-cancel-unconfirmed': {
        'task': 'booking_system.tasks.auto_cancel_unconfirmed_bookings',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
        'options': {
            'expires': 1800,  # Task expires after 30 minutes
        }
    },
    
    # Process waitlist notification expirations
    'expire-old-waitlist-notifications': {
        'task': 'booking_system.tasks.expire_old_waitlist_notifications',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
        'options': {
            'expires': 300,  # Task expires after 5 minutes
        }
    },
}

# Celery Beat will create this file to track schedules
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'
```

### Step 1.5: Create Tasks File

**File**: `backend/booking_system/tasks.py` (create new file)

```python
"""
Celery tasks for booking system automation.
Handles reminders, auto-cancellation, and waitlist processing.
"""

from celery import shared_task
from django.utils import timezone
from django.db import transaction
from datetime import timedelta, datetime, time as datetime_time
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_booking_reminders(self):
    """
    Periodic task: Runs every hour
    Sends reminder emails 24 hours before event starts
    """
    logger.info("Starting send_booking_reminders task")
    
    try:
        # TODO: Implement in Phase 2
        pass
    
    except Exception as exc:
        logger.error(f"Error in send_booking_reminders: {exc}")
        raise self.retry(exc=exc, countdown=300)  # Retry after 5 minutes


@shared_task(bind=True, max_retries=3)
def auto_cancel_unconfirmed_bookings(self):
    """
    Periodic task: Runs every 30 minutes
    Cancels unconfirmed bookings 2 hours before event starts
    Triggers waitlist notifications for cancelled slots
    """
    logger.info("Starting auto_cancel_unconfirmed_bookings task")
    
    try:
        # TODO: Implement in Phase 2
        pass
    
    except Exception as exc:
        logger.error(f"Error in auto_cancel_unconfirmed_bookings: {exc}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def expire_old_waitlist_notifications(self):
    """
    Periodic task: Runs every 5 minutes
    Expires waitlist notifications after 15 minutes
    Notifies next person in queue
    """
    logger.info("Starting expire_old_waitlist_notifications task")
    
    try:
        # TODO: Implement in Phase 3
        pass
    
    except Exception as exc:
        logger.error(f"Error in expire_old_waitlist_notifications: {exc}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def notify_waitlist_users(self, venue_id, date_str, start_time_str, end_time_str):
    """
    On-demand task: Called when a booking is cancelled
    Notifies the first user in waitlist for that slot
    
    Args:
        venue_id: ID of the venue
        date_str: Date string in 'YYYY-MM-DD' format
        start_time_str: Start time string in 'HH:MM' format
        end_time_str: End time string in 'HH:MM' format
    """
    logger.info(f"Processing waitlist for venue {venue_id}, date {date_str}")
    
    try:
        # TODO: Implement in Phase 3
        pass
    
    except Exception as exc:
        logger.error(f"Error in notify_waitlist_users: {exc}")
        raise self.retry(exc=exc, countdown=60)
```

### Step 1.6: Test Celery Beat Setup

**Commands to run:**
```bash
# Terminal 1: Start Redis (if not running)
cd C:\Users\Lenovo\Downloads\redis-x64-5.0.14.1
.\redis-server.exe

# Terminal 2: Start Django
cd D:\PCCOE\Projects\BookIT\backend
.\venv\Scripts\activate
python manage.py runserver

# Terminal 3: Start Celery Worker
cd D:\PCCOE\Projects\BookIT\backend
.\venv\Scripts\activate
celery -A config worker -l info --pool=solo

# Terminal 4: Start Celery Beat
cd D:\PCCOE\Projects\BookIT\backend
.\venv\Scripts\activate
celery -A config beat -l info
```

**Expected Celery Beat output:**
```
celery beat v5.5.3 (Opalescent) is starting.
__    -    ... __   -        _
LocalTime -> 2025-11-05 10:00:00
Configuration ->
    . broker -> redis://localhost:6379/0
    . loader -> celery.loaders.app.AppLoader
    . scheduler -> django_celery_beat.schedulers.DatabaseScheduler

[2025-11-05 10:00:00,000: INFO/MainProcess] Scheduler: Sending due task send-booking-reminders
[2025-11-05 10:00:00,000: INFO/MainProcess] Scheduler: Sending due task auto-cancel-unconfirmed
[2025-11-05 10:00:00,000: INFO/MainProcess] Scheduler: Sending due task expire-old-waitlist-notifications
```

---

## Phase 2: Auto-Cancellation System

### Step 2.1: Create Email Templates

**File**: `backend/templates/emails/booking_reminder.html`

```html
{% extends 'emails/base.html' %}

{% block title %}Reminder: Upcoming Booking{% endblock %}

{% block content %}
<h1 style="color: #1976d2; margin-bottom: 20px;">Booking Reminder</h1>

<p>Hi {{ user_name }},</p>

<p>This is a friendly reminder about your upcoming booking:</p>

<div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #333; margin-top: 0;">Booking Details</h2>
    <p><strong>Venue:</strong> {{ venue_name }}</p>
    <p><strong>Date:</strong> {{ booking_date }}</p>
    <p><strong>Time:</strong> {{ start_time }} - {{ end_time }}</p>
    <p><strong>Purpose:</strong> {{ purpose }}</p>
</div>

<div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
    <p style="margin: 0; color: #856404;">
        <strong>⏰ Your booking is in 24 hours!</strong>
    </p>
    <p style="margin: 10px 0 0 0; color: #856404;">
        If your plans have changed, please cancel the booking to make the venue available for others.
    </p>
</div>

<div style="margin: 30px 0; text-align: center;">
    <a href="{{ confirm_url }}" 
       style="background-color: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
        Confirm Booking
    </a>
    
    <a href="{{ cancel_url }}" 
       style="background-color: #f44336; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; margin-left: 10px;">
        Cancel Booking
    </a>
</div>

<div style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0;">
    <p style="margin: 0; font-size: 14px; color: #1976d2;">
        <strong>Note:</strong> If you don't confirm or cancel within 22 hours, the booking will be automatically cancelled 2 hours before the event to allow others to book the venue.
    </p>
</div>

<p>Thank you for using BookIT!</p>

<p style="color: #666; font-size: 14px; margin-top: 30px;">
    Questions? Contact us at carrerhub.com@gmail.com
</p>
{% endblock %}
```

**File**: `backend/templates/emails/booking_auto_cancelled.html`

```html
{% extends 'emails/base.html' %}

{% block title %}Booking Auto-Cancelled{% endblock %}

{% block content %}
<h1 style="color: #f44336; margin-bottom: 20px;">Booking Automatically Cancelled</h1>

<p>Hi {{ user_name }},</p>

<p>Your booking has been automatically cancelled because it was not confirmed in time.</p>

<div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #333; margin-top: 0;">Cancelled Booking Details</h2>
    <p><strong>Venue:</strong> {{ venue_name }}</p>
    <p><strong>Date:</strong> {{ booking_date }}</p>
    <p><strong>Time:</strong> {{ start_time }} - {{ end_time }}</p>
    <p><strong>Reason:</strong> {{ cancel_reason }}</p>
</div>

<div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
    <p style="margin: 0; color: #c62828;">
        <strong>Why was this cancelled?</strong>
    </p>
    <p style="margin: 10px 0 0 0; color: #c62828;">
        To ensure optimal venue utilization, bookings that are not confirmed are automatically cancelled 2 hours before the event. This allows other users to book the venue.
    </p>
</div>

<p>If you still need the venue, please check if it's available and create a new booking.</p>

<div style="margin: 30px 0; text-align: center;">
    <a href="{{ booking_url }}" 
       style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
        Book Another Venue
    </a>
</div>

<div style="background-color: #e8f5e9; padding: 15px; border-radius: 4px; margin: 20px 0;">
    <p style="margin: 0; font-size: 14px; color: #2e7d32;">
        <strong>💡 Tip:</strong> Always confirm your bookings when you receive the reminder email to avoid auto-cancellation!
    </p>
</div>

<p>Thank you for using BookIT!</p>

<p style="color: #666; font-size: 14px; margin-top: 30px;">
    Questions? Contact us at carrerhub.com@gmail.com
</p>
{% endblock %}
```

**File**: `backend/templates/emails/waitlist_slot_available.html`

```html
{% extends 'emails/base.html' %}

{% block title %}Venue Slot Available!{% endblock %}

{% block content %}
<h1 style="color: #4caf50; margin-bottom: 20px;">🎉 Great News! Venue Slot Available</h1>

<p>Hi {{ user_name }},</p>

<p>A venue slot you've been waiting for is now available!</p>

<div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2 style="color: #333; margin-top: 0;">Available Slot Details</h2>
    <p><strong>Venue:</strong> {{ venue_name }}</p>
    <p><strong>Date:</strong> {{ booking_date }}</p>
    <p><strong>Time:</strong> {{ start_time }} - {{ end_time }}</p>
</div>

<div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
    <p style="margin: 0; color: #f57c00;">
        <strong>⏰ Act Fast! You have 15 minutes to claim this slot.</strong>
    </p>
    <p style="margin: 10px 0 0 0; color: #f57c00;">
        If you don't claim it within 15 minutes, the next person in the waitlist will be notified.
    </p>
</div>

<div style="margin: 30px 0; text-align: center;">
    <a href="{{ claim_url }}" 
       style="background-color: #4caf50; color: white; padding: 15px 40px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 16px;">
        Claim This Slot Now!
    </a>
</div>

<div style="text-align: center; margin: 20px 0;">
    <p style="font-size: 24px; font-weight: bold; color: #f57c00; margin: 0;">
        Time Remaining: <span id="countdown">15:00</span>
    </p>
</div>

<div style="background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0;">
    <p style="margin: 0; font-size: 14px; color: #1976d2;">
        <strong>What happens if I claim it?</strong><br>
        A booking will be created immediately in your name. You'll receive a confirmation email with all the details.
    </p>
</div>

<p>Don't miss this opportunity!</p>

<p style="color: #666; font-size: 14px; margin-top: 30px;">
    Questions? Contact us at carrerhub.com@gmail.com
</p>
{% endblock %}
```

### Step 2.2: Implement Email Sending Functions

**File**: `backend/utils/email_utils.py`

**Add these functions at the end of the file:**

```python
# ============================
# REMINDER & AUTO-CANCEL EMAILS
# ============================

def send_booking_reminder_email(booking):
    """Send 24-hour reminder email for booking"""
    try:
        frontend_url = "http://localhost:3000"
        
        context = {
            'user_name': booking.user.get_full_name(),
            'venue_name': booking.venue.name,
            'booking_date': booking.date.strftime('%B %d, %Y'),
            'start_time': booking.start_time.strftime('%I:%M %p'),
            'end_time': booking.end_time.strftime('%I:%M %p'),
            'purpose': booking.purpose,
            'confirm_url': f"{frontend_url}/bookings/{booking.id}/confirm",
            'cancel_url': f"{frontend_url}/bookings/{booking.id}/cancel",
        }
        
        html_content = render_to_string('emails/booking_reminder.html', context)
        
        send_mail(
            subject=f'Reminder: Your booking at {booking.venue.name}',
            message='',  # Plain text version
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.user.email],
            html_message=html_content,
            fail_silently=False,
        )
        
        logger.info(f"Reminder email sent to {booking.user.email} for booking {booking.id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send reminder email for booking {booking.id}: {e}")
        return False


def send_auto_cancel_email(booking, reason="Not confirmed in time"):
    """Send email when booking is auto-cancelled"""
    try:
        frontend_url = "http://localhost:3000"
        
        context = {
            'user_name': booking.user.get_full_name(),
            'venue_name': booking.venue.name,
            'booking_date': booking.date.strftime('%B %d, %Y'),
            'start_time': booking.start_time.strftime('%I:%M %p'),
            'end_time': booking.end_time.strftime('%I:%M %p'),
            'cancel_reason': reason,
            'booking_url': f"{frontend_url}/venues",
        }
        
        html_content = render_to_string('emails/booking_auto_cancelled.html', context)
        
        send_mail(
            subject=f'Booking Auto-Cancelled: {booking.venue.name}',
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[booking.user.email],
            html_message=html_content,
            fail_silently=False,
        )
        
        logger.info(f"Auto-cancel email sent to {booking.user.email} for booking {booking.id}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send auto-cancel email for booking {booking.id}: {e}")
        return False


def send_waitlist_notification_email(waitlist_entry):
    """Send email when waitlist slot becomes available"""
    try:
        frontend_url = "http://localhost:3000"
        
        context = {
            'user_name': waitlist_entry.user.get_full_name(),
            'venue_name': waitlist_entry.venue.name,
            'booking_date': waitlist_entry.date.strftime('%B %d, %Y'),
            'start_time': waitlist_entry.start_time.strftime('%I:%M %p'),
            'end_time': waitlist_entry.end_time.strftime('%I:%M %p'),
            'claim_url': f"{frontend_url}/waitlist/{waitlist_entry.id}/claim",
        }
        
        html_content = render_to_string('emails/waitlist_slot_available.html', context)
        
        send_mail(
            subject=f'🎉 Venue Available: {waitlist_entry.venue.name}',
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[waitlist_entry.user.email],
            html_message=html_content,
            fail_silently=False,
        )
        
        logger.info(f"Waitlist notification sent to {waitlist_entry.user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send waitlist notification for entry {waitlist_entry.id}: {e}")
        return False
```

### Step 2.3: Implement Celery Tasks (Phase 2)

**File**: `backend/booking_system/tasks.py`

**Replace the TODO sections with actual implementation:**

```python
@shared_task(bind=True, max_retries=3)
def send_booking_reminders(self):
    """
    Periodic task: Runs every hour
    Sends reminder emails 24 hours before event starts
    """
    from booking_system.models import Booking
    from utils.email_utils import send_booking_reminder_email
    
    logger.info("Starting send_booking_reminders task")
    
    try:
        now = timezone.now()
        reminder_time = now + timedelta(hours=24)
        
        # Find bookings that need reminders
        # - Happening ~24 hours from now (within next hour)
        # - Status is 'confirmed' (active bookings)
        # - Reminder not yet sent
        bookings_needing_reminder = Booking.objects.filter(
            date=reminder_time.date(),
            start_time__gte=reminder_time.time(),
            start_time__lt=(reminder_time + timedelta(hours=1)).time(),
            status='confirmed',
            reminder_sent=False
        )
        
        sent_count = 0
        failed_count = 0
        
        for booking in bookings_needing_reminder:
            try:
                # Send reminder email
                if send_booking_reminder_email(booking):
                    # Mark as sent
                    booking.reminder_sent = True
                    booking.reminder_sent_at = now
                    booking.save(update_fields=['reminder_sent', 'reminder_sent_at'])
                    sent_count += 1
                else:
                    failed_count += 1
                    
            except Exception as e:
                logger.error(f"Error sending reminder for booking {booking.id}: {e}")
                failed_count += 1
        
        logger.info(f"Reminder task complete: {sent_count} sent, {failed_count} failed")
        return {
            'sent': sent_count,
            'failed': failed_count,
            'timestamp': now.isoformat()
        }
    
    except Exception as exc:
        logger.error(f"Error in send_booking_reminders: {exc}")
        raise self.retry(exc=exc, countdown=300)


@shared_task(bind=True, max_retries=3)
def auto_cancel_unconfirmed_bookings(self):
    """
    Periodic task: Runs every 30 minutes
    Cancels unconfirmed bookings 2 hours before event starts
    Triggers waitlist notifications for cancelled slots
    """
    from booking_system.models import Booking
    from utils.email_utils import send_auto_cancel_email
    
    logger.info("Starting auto_cancel_unconfirmed_bookings task")
    
    try:
        now = timezone.now()
        cancel_threshold = now + timedelta(hours=2)
        
        # Find bookings to auto-cancel
        # - Happening in ~2 hours
        # - Status is 'confirmed' (not already cancelled)
        # - Not confirmed by user
        # - Reminder was sent (grace period given)
        bookings_to_cancel = Booking.objects.filter(
            date=cancel_threshold.date(),
            start_time__gte=cancel_threshold.time(),
            start_time__lt=(cancel_threshold + timedelta(minutes=30)).time(),
            status='confirmed',
            confirmed=False,
            reminder_sent=True  # Only cancel if reminder was sent
        )
        
        cancelled_count = 0
        
        for booking in bookings_to_cancel:
            try:
                with transaction.atomic():
                    # Mark as cancelled
                    booking.status = 'cancelled'
                    booking.auto_cancelled = True
                    booking.auto_cancelled_at = now
                    booking.auto_cancel_reason = "Not confirmed before event"
                    booking.save()
                    
                    # Send cancellation email
                    send_auto_cancel_email(booking, booking.auto_cancel_reason)
                    
                    # Trigger waitlist processing
                    notify_waitlist_users.delay(
                        booking.venue.id,
                        booking.date.strftime('%Y-%m-%d'),
                        booking.start_time.strftime('%H:%M'),
                        booking.end_time.strftime('%H:%M')
                    )
                    
                    cancelled_count += 1
                    logger.info(f"Auto-cancelled booking {booking.id}")
                    
            except Exception as e:
                logger.error(f"Error auto-cancelling booking {booking.id}: {e}")
        
        logger.info(f"Auto-cancel task complete: {cancelled_count} bookings cancelled")
        return {
            'cancelled': cancelled_count,
            'timestamp': now.isoformat()
        }
    
    except Exception as exc:
        logger.error(f"Error in auto_cancel_unconfirmed_bookings: {exc}")
        raise self.retry(exc=exc, countdown=300)
```

### Step 2.4: Create Confirmation API Endpoint

**File**: `backend/booking_system/views.py`

**Add this new view:**

```python
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

class BookingViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def confirm(self, request, pk=None):
        """
        Confirm a booking to prevent auto-cancellation
        """
        booking = self.get_object()
        
        # Check if user owns this booking
        if booking.user != request.user:
            return Response(
                {'error': 'You can only confirm your own bookings'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if booking is still active
        if booking.status != 'confirmed':
            return Response(
                {'error': 'Only active bookings can be confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if booking is in the future
        from django.utils import timezone
        now = timezone.now()
        booking_datetime = timezone.make_aware(
            datetime.combine(booking.date, booking.start_time)
        )
        
        if booking_datetime <= now:
            return Response(
                {'error': 'Cannot confirm past bookings'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Confirm the booking
        booking.confirmed = True
        booking.confirmed_at = now
        booking.save(update_fields=['confirmed', 'confirmed_at'])
        
        return Response({
            'message': 'Booking confirmed successfully',
            'booking_id': booking.id,
            'confirmed_at': booking.confirmed_at
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def override_autocancel(self, request, pk=None):
        """
        Hall Admin can override auto-cancellation for a booking
        """
        booking = self.get_object()
        
        # Force confirm the booking
        booking.confirmed = True
        booking.confirmed_at = timezone.now()
        booking.save(update_fields=['confirmed', 'confirmed_at'])
        
        return Response({
            'message': 'Auto-cancellation overridden by admin',
            'booking_id': booking.id
        })
```

---

## Phase 3: Waitlist System

### Step 3.1: Create Waitlist Serializer

**File**: `backend/booking_system/serializers.py`

**Add new serializer:**

```python
class WaitlistSerializer(serializers.ModelSerializer):
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    time_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Waitlist
        fields = [
            'id', 'venue', 'venue_name', 'user', 'user_email',
            'date', 'start_time', 'end_time', 'created_at',
            'notified', 'notified_at', 'claimed', 'claimed_at',
            'expired', 'priority', 'time_remaining'
        ]
        read_only_fields = [
            'id', 'created_at', 'notified', 'notified_at',
            'claimed', 'claimed_at', 'expired'
        ]
    
    def get_time_remaining(self, obj):
        """Get seconds remaining to claim slot"""
        return obj.time_remaining()
    
    def validate(self, data):
        """Validate waitlist entry"""
        user = self.context['request'].user
        venue = data.get('venue')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        # Check if user already has a booking for this slot
        existing_booking = Booking.objects.filter(
            user=user,
            venue=venue,
            date=date,
            start_time=start_time,
            end_time=end_time,
            status='confirmed'
        ).exists()
        
        if existing_booking:
            raise serializers.ValidationError(
                "You already have a booking for this time slot"
            )
        
        # Check if user already in waitlist for this slot
        existing_waitlist = Waitlist.objects.filter(
            user=user,
            venue=venue,
            date=date,
            start_time=start_time,
            end_time=end_time,
            claimed=False,
            expired=False
        ).exists()
        
        if existing_waitlist:
            raise serializers.ValidationError(
                "You are already in the waitlist for this time slot"
            )
        
        # Check max waitlist entries per day (prevent abuse)
        daily_count = Waitlist.objects.filter(
            user=user,
            date=date,
            claimed=False,
            expired=False
        ).count()
        
        if daily_count >= 3:
            raise serializers.ValidationError(
                "Maximum 3 waitlist entries allowed per day"
            )
        
        return data
```

### Step 3.2: Create Waitlist ViewSet

**File**: `backend/booking_system/views.py`

**Add new viewset:**

```python
class WaitlistViewSet(viewsets.ModelViewSet):
    """
    API endpoints for waitlist management
    """
    serializer_class = WaitlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Users can only see their own waitlist entries"""
        user = self.request.user
        if user.is_staff:
            return Waitlist.objects.all()
        return Waitlist.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Add user to waitlist"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_waitlist(self, request):
        """Get current user's active waitlist entries"""
        entries = Waitlist.objects.filter(
            user=request.user,
            claimed=False,
            expired=False
        ).order_by('date', 'start_time')
        
        serializer = self.get_serializer(entries, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def claim(self, request, pk=None):
        """
        Claim an available slot from waitlist
        Creates a booking if slot is still available
        """
        waitlist_entry = self.get_object()
        
        # Verify user owns this waitlist entry
        if waitlist_entry.user != request.user:
            return Response(
                {'error': 'You can only claim your own waitlist entries'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already claimed
        if waitlist_entry.claimed:
            return Response(
                {'error': 'This slot has already been claimed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if expired
        if waitlist_entry.expired or waitlist_entry.is_expired():
            waitlist_entry.expired = True
            waitlist_entry.save(update_fields=['expired'])
            return Response(
                {'error': 'This notification has expired (15-minute window passed)'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if notified (can only claim after notification)
        if not waitlist_entry.notified:
            return Response(
                {'error': 'You have not been notified yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Check if slot is still available
                conflicting_booking = Booking.objects.filter(
                    venue=waitlist_entry.venue,
                    date=waitlist_entry.date,
                    start_time=waitlist_entry.start_time,
                    end_time=waitlist_entry.end_time,
                    status='confirmed'
                ).exists()
                
                if conflicting_booking:
                    return Response(
                        {'error': 'Sorry, this slot has already been booked by someone else'},
                        status=status.HTTP_409_CONFLICT
                    )
                
                # Create the booking
                booking = Booking.objects.create(
                    user=waitlist_entry.user,
                    venue=waitlist_entry.venue,
                    date=waitlist_entry.date,
                    start_time=waitlist_entry.start_time,
                    end_time=waitlist_entry.end_time,
                    purpose=f"Claimed from waitlist",
                    status='confirmed',
                    confirmed=True,
                    confirmed_at=timezone.now()
                )
                
                # Mark waitlist entry as claimed
                waitlist_entry.claimed = True
                waitlist_entry.claimed_at = timezone.now()
                waitlist_entry.save()
                
                # Send confirmation email
                from utils.email_utils import send_booking_confirmation_smart
                send_booking_confirmation_smart(booking)
                
                return Response({
                    'message': 'Slot claimed successfully!',
                    'booking_id': booking.id,
                    'waitlist_entry_id': waitlist_entry.id
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            logger.error(f"Error claiming waitlist slot: {e}")
            return Response(
                {'error': 'Failed to claim slot. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['delete'])
    def leave(self, request, pk=None):
        """Remove user from waitlist"""
        waitlist_entry = self.get_object()
        
        # Verify user owns this entry
        if waitlist_entry.user != request.user:
            return Response(
                {'error': 'You can only remove your own waitlist entries'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Delete the entry
        waitlist_entry.delete()
        
        return Response({
            'message': 'Removed from waitlist successfully'
        }, status=status.HTTP_200_OK)
```

### Step 3.3: Update URLs

**File**: `backend/booking_system/urls.py`

**Add waitlist routes:**

```python
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, NotificationViewSet, WaitlistViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'waitlist', WaitlistViewSet, basename='waitlist')

urlpatterns = router.urls
```

### Step 3.4: Implement Waitlist Tasks (Phase 3)

**File**: `backend/booking_system/tasks.py`

**Complete the waitlist task implementations:**

```python
@shared_task(bind=True, max_retries=3)
def notify_waitlist_users(self, venue_id, date_str, start_time_str, end_time_str):
    """
    On-demand task: Called when a booking is cancelled
    Notifies the first user in waitlist for that slot
    """
    from booking_system.models import Waitlist
    from venue_management.models import Venue
    from utils.email_utils import send_waitlist_notification_email
    from datetime import datetime
    
    logger.info(f"Processing waitlist for venue {venue_id}, date {date_str}")
    
    try:
        # Parse date and time
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        start_time_obj = datetime.strptime(start_time_str, '%H:%M').time()
        end_time_obj = datetime.strptime(end_time_str, '%H:%M').time()
        
        # Find the highest priority unclaimed, unexpired waitlist entry
        waitlist_entry = Waitlist.objects.filter(
            venue_id=venue_id,
            date=date_obj,
            start_time=start_time_obj,
            end_time=end_time_obj,
            notified=False,
            claimed=False,
            expired=False
        ).order_by('priority', 'created_at').first()
        
        if waitlist_entry:
            # Send notification email
            if send_waitlist_notification_email(waitlist_entry):
                # Mark as notified
                waitlist_entry.notified = True
                waitlist_entry.notified_at = timezone.now()
                waitlist_entry.save()
                
                logger.info(f"Notified user {waitlist_entry.user.email} for waitlist entry {waitlist_entry.id}")
                return {
                    'notified': True,
                    'user_email': waitlist_entry.user.email,
                    'waitlist_entry_id': waitlist_entry.id
                }
            else:
                logger.error(f"Failed to send notification email for waitlist entry {waitlist_entry.id}")
                return {'notified': False, 'error': 'Email sending failed'}
        else:
            logger.info(f"No waitlist entries found for venue {venue_id} on {date_str}")
            return {'notified': False, 'reason': 'No waitlist entries'}
    
    except Exception as exc:
        logger.error(f"Error in notify_waitlist_users: {exc}")
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def expire_old_waitlist_notifications(self):
    """
    Periodic task: Runs every 5 minutes
    Expires waitlist notifications after 15 minutes
    Notifies next person in queue
    """
    from booking_system.models import Waitlist
    
    logger.info("Starting expire_old_waitlist_notifications task")
    
    try:
        now = timezone.now()
        expiry_threshold = now - timedelta(minutes=15)
        
        # Find notifications that are 15+ minutes old and not yet claimed
        expired_entries = Waitlist.objects.filter(
            notified=True,
            notified_at__lte=expiry_threshold,
            claimed=False,
            expired=False
        )
        
        expired_count = 0
        
        for entry in expired_entries:
            try:
                with transaction.atomic():
                    # Mark as expired
                    entry.expired = True
                    entry.save(update_fields=['expired'])
                    
                    # Notify next person in queue
                    notify_waitlist_users.delay(
                        entry.venue.id,
                        entry.date.strftime('%Y-%m-%d'),
                        entry.start_time.strftime('%H:%M'),
                        entry.end_time.strftime('%H:%M')
                    )
                    
                    expired_count += 1
                    logger.info(f"Expired waitlist entry {entry.id}, notifying next person")
                    
            except Exception as e:
                logger.error(f"Error expiring waitlist entry {entry.id}: {e}")
        
        logger.info(f"Expiration task complete: {expired_count} entries expired")
        return {
            'expired': expired_count,
            'timestamp': now.isoformat()
        }
    
    except Exception as exc:
        logger.error(f"Error in expire_old_waitlist_notifications: {exc}")
        raise self.retry(exc=exc, countdown=60)
```

---

## Testing Guide

### Manual Testing Scenarios

**Test 1: Reminder Email (24 hours)**
```bash
# Create a booking for tomorrow same time
# Wait for next hourly run or manually trigger:
python manage.py shell
>>> from booking_system.tasks import send_booking_reminders
>>> send_booking_reminders.delay()
```

**Test 2: Auto-Cancellation (2 hours)**
```bash
# Create a booking, don't confirm
# Wait for it to be 2 hours before event
# Or manually trigger the task
python manage.py shell
>>> from booking_system.tasks import auto_cancel_unconfirmed_bookings
>>> auto_cancel_unconfirmed_bookings.delay()
```

**Test 3: Waitlist Flow**
```bash
# 1. User A books a slot
# 2. User B tries to book same slot → joins waitlist
# 3. User A's booking gets auto-cancelled
# 4. User B receives notification
# 5. User B claims the slot within 15 minutes
```

### Automated Test Script

**File**: `backend/test_auto_cancel_waitlist.py`

```python
"""
Test script for auto-cancellation and waitlist system
Run with: python manage.py shell < test_auto_cancel_waitlist.py
"""

from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from venue_management.models import Venue
from booking_system.models import Booking, Waitlist

# Create test users
user1 = User.objects.create_user(
    email='test1@example.com',
    password='test123',
    first_name='Test',
    last_name='User1'
)

user2 = User.objects.create_user(
    email='test2@example.com',
    password='test123',
    first_name='Test',
    last_name='User2'
)

# Get a test venue
venue = Venue.objects.first()

# Create a booking for tomorrow
tomorrow = timezone.now().date() + timedelta(days=1)
booking = Booking.objects.create(
    user=user1,
    venue=venue,
    date=tomorrow,
    start_time='14:00',
    end_time='16:00',
    purpose='Test booking',
    status='confirmed'
)

print(f"✅ Created test booking: {booking.id}")

# User2 joins waitlist
waitlist = Waitlist.objects.create(
    user=user2,
    venue=venue,
    date=tomorrow,
    start_time='14:00',
    end_time='16:00'
)

print(f"✅ User2 joined waitlist: {waitlist.id}")

# Simulate reminder sent
booking.reminder_sent = True
booking.reminder_sent_at = timezone.now() - timedelta(hours=23)
booking.save()

print(f"✅ Simulated reminder sent 23 hours ago")

# Test auto-cancellation
from booking_system.tasks import auto_cancel_unconfirmed_bookings
result = auto_cancel_unconfirmed_bookings.delay()

print(f"✅ Triggered auto-cancel task")
print(f"Result: {result.get()}")

# Check booking status
booking.refresh_from_db()
print(f"Booking status: {booking.status}")
print(f"Auto-cancelled: {booking.auto_cancelled}")

# Check waitlist notification
waitlist.refresh_from_db()
print(f"Waitlist notified: {waitlist.notified}")

print("\n✅ Test complete!")
```

---

## Troubleshooting

### Issue: Celery Beat not running tasks

**Solution:**
```bash
# Check if Beat is registered in database
python manage.py shell
>>> from django_celery_beat.models import PeriodicTask
>>> PeriodicTask.objects.all()

# Clear Beat schedule cache
python manage.py shell
>>> from django_celery_beat.models import PeriodicTask
>>> PeriodicTask.objects.all().delete()

# Restart Celery Beat
celery -A config beat -l info
```

### Issue: Tasks not appearing in worker

**Solution:**
```bash
# Make sure worker is discovering tasks
celery -A config inspect registered

# Should see:
# - booking_system.tasks.send_booking_reminders
# - booking_system.tasks.auto_cancel_unconfirmed_bookings
# - booking_system.tasks.expire_old_waitlist_notifications
```

### Issue: Race condition in waitlist claiming

**Solution:**
Already handled with `select_for_update()` in the claim view:
```python
with transaction.atomic():
    # Lock the booking record
    conflicting_booking = Booking.objects.select_for_update().filter(...)
```

### Issue: Email not sending

**Solution:**
```bash
# Test email configuration
python manage.py shell
>>> from django.core.mail import send_mail
>>> send_mail('Test', 'Body', 'from@example.com', ['to@example.com'])

# Check Celery logs
celery -A config worker -l debug
```

---

## Production Deployment

### Supervisor Configuration (Linux)

**File**: `/etc/supervisor/conf.d/bookit.conf`

```ini
[program:bookit-celery-worker]
command=/path/to/venv/bin/celery -A config worker -l info
directory=/path/to/BookIT/backend
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/bookit/celery-worker.err.log
stdout_logfile=/var/log/bookit/celery-worker.out.log

[program:bookit-celery-beat]
command=/path/to/venv/bin/celery -A config beat -l info
directory=/path/to/BookIT/backend
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/bookit/celery-beat.err.log
stdout_logfile=/var/log/bookit/celery-beat.out.log
```

### Windows Service (Windows Server)

Use NSSM (Non-Sucking Service Manager):
```bash
nssm install BookIT-Celery-Worker "C:\Path\To\venv\Scripts\celery.exe" "-A config worker -l info"
nssm install BookIT-Celery-Beat "C:\Path\To\venv\Scripts\celery.exe" "-A config beat -l info"
```

---

**Last Updated**: November 5, 2025  
**Implementation Status**: Ready to begin Phase 1

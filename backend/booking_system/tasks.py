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
        reminder_start = reminder_time
        reminder_end = reminder_time + timedelta(hours=1)
        
        bookings_needing_reminder = Booking.objects.filter(
            date=reminder_time.date(),
            start_time__gte=reminder_start.time(),
            start_time__lt=reminder_end.time(),
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
                    logger.info(f"✓ Reminder sent for booking {booking.id}")
                else:
                    failed_count += 1
                    logger.warning(f"✗ Failed to send reminder for booking {booking.id}")
                    
            except Exception as e:
                logger.error(f"Error sending reminder for booking {booking.id}: {e}")
                failed_count += 1
        
        result = {
            'sent': sent_count,
            'failed': failed_count,
            'timestamp': now.isoformat()
        }
        logger.info(f"Reminder task complete: {sent_count} sent, {failed_count} failed")
        return result
    
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
    from booking_system.models import Booking
    from utils.email_utils import send_auto_cancel_email
    
    logger.info("Starting auto_cancel_unconfirmed_bookings task")
    
    try:
        now = timezone.now()
        cancel_threshold = now + timedelta(hours=2)
        cancel_end = cancel_threshold + timedelta(minutes=30)
        
        # Find bookings to auto-cancel
        # - Happening in ~2 hours (within next 30 mins)
        # - Status is 'confirmed' (not already cancelled)
        # - Not confirmed by user
        # - Reminder was sent (grace period given)
        bookings_to_cancel = Booking.objects.filter(
            date=cancel_threshold.date(),
            start_time__gte=cancel_threshold.time(),
            start_time__lt=cancel_end.time(),
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
                    booking.cancellation_reason = booking.auto_cancel_reason
                    booking.cancelled_at = now
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
                    logger.info(f"✓ Auto-cancelled booking {booking.id}")
                    
            except Exception as e:
                logger.error(f"Error auto-cancelling booking {booking.id}: {e}")
        
        result = {
            'cancelled': cancelled_count,
            'timestamp': now.isoformat()
        }
        logger.info(f"Auto-cancel task complete: {cancelled_count} bookings cancelled")
        return result
    
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
                    logger.info(f"✓ Expired waitlist entry {entry.id}, notifying next person")
                    
            except Exception as e:
                logger.error(f"Error expiring waitlist entry {entry.id}: {e}")
        
        result = {
            'expired': expired_count,
            'timestamp': now.isoformat()
        }
        logger.info(f"Expiration task complete: {expired_count} entries expired")
        return result
    
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
    from booking_system.models import Waitlist
    from venue_management.models import Venue
    from utils.email_utils import send_waitlist_notification_email
    
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
                
                logger.info(f"✓ Notified user {waitlist_entry.user.email} for waitlist entry {waitlist_entry.id}")
                
                # Create in-app notification
                from booking_system.models import Notification
                Notification.objects.create(
                    user=waitlist_entry.user,
                    notification_type='waitlist',
                    title='🎉 Venue Slot Available!',
                    message=f'{waitlist_entry.venue.name} is now available on {waitlist_entry.date.strftime("%B %d, %Y")} at {waitlist_entry.start_time.strftime("%I:%M %p")}. You have 15 minutes to claim it!',
                    link=f'/waitlist/{waitlist_entry.id}/claim',
                    related_venue_id=waitlist_entry.venue.id
                )
                
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

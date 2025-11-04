"""
Notification utilities for creating in-app notifications
"""
from booking_system.models import Notification
import logging

logger = logging.getLogger(__name__)


def create_notification(user, notification_type, title, message, link=None, 
                       related_booking_id=None, related_venue_id=None):
    """
    Create a notification for a user.
    
    Args:
        user: User object
        notification_type (str): Type of notification
        title (str): Notification title
        message (str): Notification message
        link (str, optional): Link to related page
        related_booking_id (int, optional): Related booking ID
        related_venue_id (int, optional): Related venue ID
        
    Returns:
        Notification: Created notification object
    """
    try:
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            link=link,
            related_booking_id=related_booking_id,
            related_venue_id=related_venue_id
        )
        logger.info(f"Notification created for {user.email}: {title}")
        return notification
    except Exception as e:
        logger.error(f"Failed to create notification for {user.email}: {str(e)}")
        return None


def notify_booking_confirmed(booking):
    """
    Notify user that their booking is confirmed.
    
    Args:
        booking: Booking object
    """
    return create_notification(
        user=booking.user,
        notification_type='booking_confirmed',
        title=f'Booking Confirmed - {booking.venue.name}',
        message=f'Your booking for "{booking.event_name}" on {booking.date.strftime("%B %d, %Y")} has been confirmed.',
        link='/my-bookings',
        related_booking_id=booking.id,
        related_venue_id=booking.venue.id
    )


def notify_booking_cancelled(booking, cancelled_by=None):
    """
    Notify user that their booking was cancelled.
    
    Args:
        booking: Booking object
        cancelled_by (User, optional): User who cancelled the booking
    """
    if cancelled_by and cancelled_by != booking.user:
        message = f'Your booking for "{booking.event_name}" was cancelled by {cancelled_by.get_role_display()}.'
    else:
        message = f'Your booking for "{booking.event_name}" has been cancelled.'
    
    if booking.cancellation_reason:
        message += f' Reason: {booking.cancellation_reason}'
    
    return create_notification(
        user=booking.user,
        notification_type='booking_cancelled',
        title=f'Booking Cancelled - {booking.venue.name}',
        message=message,
        link='/my-bookings',
        related_booking_id=booking.id,
        related_venue_id=booking.venue.id
    )


def notify_hall_admin_new_booking(booking, hall_admin):
    """
    Notify Hall Admin about new booking for their venue.
    
    Args:
        booking: Booking object
        hall_admin: Hall Admin User object
    """
    return create_notification(
        user=hall_admin,
        notification_type='new_booking',
        title=f'New Booking - {booking.venue.name}',
        message=f'{booking.user.get_full_name()} booked {booking.venue.name} for "{booking.event_name}" on {booking.date.strftime("%B %d, %Y")}.',
        link='/hall-admin/bookings',
        related_booking_id=booking.id,
        related_venue_id=booking.venue.id
    )


def notify_venue_assigned(venue_admin):
    """
    Notify Hall Admin that they were assigned to a venue.
    
    Args:
        venue_admin: VenueAdmin object
    """
    return create_notification(
        user=venue_admin.user,
        notification_type='venue_assigned',
        title=f'Venue Assigned - {venue_admin.venue.name}',
        message=f'You have been assigned as Hall Admin for {venue_admin.venue.name}.',
        link='/hall-admin/venues',
        related_venue_id=venue_admin.venue.id
    )


def notify_user_created(user, created_by):
    """
    Notify user that their account was created.
    
    Args:
        user: User object
        created_by: User who created the account
    """
    return create_notification(
        user=user,
        notification_type='user_created',
        title='Welcome to BookIT!',
        message=f'Your account has been created by {created_by.get_role_display()}. Check your email for login credentials.',
        link='/profile'
    )


def get_unread_count(user):
    """
    Get count of unread notifications for a user.
    
    Args:
        user: User object
        
    Returns:
        int: Count of unread notifications
    """
    try:
        return Notification.objects.filter(user=user, is_read=False).count()
    except Exception as e:
        logger.error(f"Failed to get unread count for {user.email}: {str(e)}")
        return 0


def mark_all_as_read(user):
    """
    Mark all notifications as read for a user.
    
    Args:
        user: User object
        
    Returns:
        int: Number of notifications marked as read
    """
    try:
        from django.utils import timezone
        updated = Notification.objects.filter(
            user=user, 
            is_read=False
        ).update(
            is_read=True, 
            read_at=timezone.now()
        )
        logger.info(f"Marked {updated} notifications as read for {user.email}")
        return updated
    except Exception as e:
        logger.error(f"Failed to mark notifications as read for {user.email}: {str(e)}")
        return 0

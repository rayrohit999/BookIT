"""
Email utilities for BookIT
Handles sending HTML emails for various notifications
"""
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


def is_celery_available():
    """Check if Celery/Redis is available and working"""
    try:
        from celery import current_app
        # Try to ping the broker
        current_app.connection().ensure_connection(max_retries=1)
        return True
    except Exception as e:
        logger.warning(f"Celery not available: {str(e)}")
        return False


def send_html_email(subject, template_name, context, recipient_list, fail_silently=False):
    """
    Send an HTML email using Django templates.
    
    Args:
        subject (str): Email subject line
        template_name (str): Name of HTML template (without .html extension)
        context (dict): Context dictionary for template rendering
        recipient_list (list): List of recipient email addresses
        fail_silently (bool): Whether to suppress exceptions
        
    Returns:
        int: Number of successfully sent emails
    """
    try:
        # Render HTML content
        html_content = render_to_string(f'emails/{template_name}.html', context)
        
        # Create email message
        email = EmailMultiAlternatives(
            subject=subject,
            body=html_content,  # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list
        )
        
        # Attach HTML content
        email.attach_alternative(html_content, "text/html")
        
        # Send email
        result = email.send(fail_silently=fail_silently)
        
        logger.info(f"Email sent successfully: {subject} to {recipient_list}")
        return result
        
    except Exception as e:
        logger.error(f"Failed to send email '{subject}' to {recipient_list}: {str(e)}")
        if not fail_silently:
            raise
        return 0


def send_welcome_email(user, password):
    """
    Send welcome email to newly created user.
    
    Args:
        user: User object
        password (str): Generated password
        
    Returns:
        int: Number of successfully sent emails
    """
    subject = "Welcome to BookIT - Your Account Details"
    context = {
        'user': user,
        'password': password,
        'login_url': f"{settings.FRONTEND_URL}/login" if hasattr(settings, 'FRONTEND_URL') else "http://localhost:3000/login",
    }
    
    return send_html_email(
        subject=subject,
        template_name='welcome',
        context=context,
        recipient_list=[user.email]
    )


def send_booking_confirmation_email(booking):
    """
    Send booking confirmation email to user.
    
    Args:
        booking: Booking object
        
    Returns:
        int: Number of successfully sent emails
    """
    subject = f"Booking Confirmed - {booking.venue.name}"
    context = {
        'booking': booking,
        'user': booking.user,
    }
    
    return send_html_email(
        subject=subject,
        template_name='booking_confirmed',
        context=context,
        recipient_list=[booking.user.email]
    )


def send_booking_cancellation_email(booking, cancelled_by=None):
    """
    Send booking cancellation email to user.
    
    Args:
        booking: Booking object
        cancelled_by (User): User who cancelled the booking
        
    Returns:
        int: Number of successfully sent emails
    """
    subject = f"Booking Cancelled - {booking.venue.name}"
    context = {
        'booking': booking,
        'user': booking.user,
        'cancelled_by': cancelled_by,
    }
    
    return send_html_email(
        subject=subject,
        template_name='booking_cancelled',
        context=context,
        recipient_list=[booking.user.email]
    )


def send_hall_admin_booking_notification(booking, hall_admin):
    """
    Send new booking notification to Hall Admin.
    
    Args:
        booking: Booking object
        hall_admin: Hall Admin User object
        
    Returns:
        int: Number of successfully sent emails
    """
    subject = f"New Booking - {booking.venue.name}"
    context = {
        'booking': booking,
        'hall_admin': hall_admin,
    }
    
    return send_html_email(
        subject=subject,
        template_name='hall_admin_new_booking',
        context=context,
        recipient_list=[hall_admin.email]
    )


def send_venue_assignment_email(venue_admin):
    """
    Send venue assignment notification to Hall Admin.
    
    Args:
        venue_admin: VenueAdmin object
        
    Returns:
        int: Number of successfully sent emails
    """
    subject = f"Venue Assignment - {venue_admin.venue.name}"
    context = {
        'venue_admin': venue_admin,
        'hall_admin': venue_admin.user,
        'venue': venue_admin.venue,
    }
    
    return send_html_email(
        subject=subject,
        template_name='venue_assignment',
        context=context,
        recipient_list=[venue_admin.user.email]
    )


# ==================== ASYNC CELERY TASKS ====================
# These tasks run in the background and don't block the request


@shared_task(name='send_welcome_email_async', bind=True, max_retries=3)
def send_welcome_email_async(self, user_id, user_email, user_full_name, password):
    """
    Async task to send welcome email to newly created user.
    
    Args:
        user_id: User ID
        user_email: User email address
        user_full_name: User's full name
        password: Generated password
    """
    try:
        # Create a mock user object with required fields
        class MockUser:
            def __init__(self, id, email, full_name):
                self.id = id
                self.email = email
                self.full_name = full_name
        
        user = MockUser(user_id, user_email, user_full_name)
        
        subject = "Welcome to BookIT - Your Account Details"
        context = {
            'user': user,
            'password': password,
            'login_url': f"{settings.FRONTEND_URL}/login" if hasattr(settings, 'FRONTEND_URL') else "http://localhost:3000/login",
        }
        
        result = send_html_email(
            subject=subject,
            template_name='welcome',
            context=context,
            recipient_list=[user.email]
        )
        
        logger.info(f"Welcome email sent asynchronously to {user_email}")
        return result
        
    except Exception as e:
        logger.error(f"Failed to send welcome email async: {str(e)}")
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(name='send_booking_confirmation_async', bind=True, max_retries=3)
def send_booking_confirmation_async(self, booking_id):
    """
    Async task to send booking confirmation email.
    
    Args:
        booking_id: Booking ID
    """
    try:
        from booking_system.models import Booking
        booking = Booking.objects.select_related('user', 'venue').get(id=booking_id)
        
        subject = f"Booking Confirmed - {booking.venue.name}"
        context = {
            'booking': booking,
            'user': booking.user,
        }
        
        result = send_html_email(
            subject=subject,
            template_name='booking_confirmed',
            context=context,
            recipient_list=[booking.user.email]
        )
        
        logger.info(f"Booking confirmation email sent asynchronously for booking {booking_id}")
        return result
        
    except Exception as e:
        logger.error(f"Failed to send booking confirmation async: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(name='send_booking_cancellation_async', bind=True, max_retries=3)
def send_booking_cancellation_async(self, booking_id, cancelled_by_id=None):
    """
    Async task to send booking cancellation email.
    
    Args:
        booking_id: Booking ID
        cancelled_by_id: ID of user who cancelled (optional)
    """
    try:
        from booking_system.models import Booking
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        booking = Booking.objects.select_related('user', 'venue').get(id=booking_id)
        cancelled_by = User.objects.get(id=cancelled_by_id) if cancelled_by_id else None
        
        subject = f"Booking Cancelled - {booking.venue.name}"
        context = {
            'booking': booking,
            'user': booking.user,
            'cancelled_by': cancelled_by,
        }
        
        result = send_html_email(
            subject=subject,
            template_name='booking_cancelled',
            context=context,
            recipient_list=[booking.user.email]
        )
        
        logger.info(f"Booking cancellation email sent asynchronously for booking {booking_id}")
        return result
        
    except Exception as e:
        logger.error(f"Failed to send booking cancellation async: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(name='send_hall_admin_notification_async', bind=True, max_retries=3)
def send_hall_admin_notification_async(self, booking_id, hall_admin_id):
    """
    Async task to send new booking notification to Hall Admin.
    
    Args:
        booking_id: Booking ID
        hall_admin_id: Hall Admin user ID
    """
    try:
        from booking_system.models import Booking
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        booking = Booking.objects.select_related('user', 'venue').get(id=booking_id)
        hall_admin = User.objects.get(id=hall_admin_id)
        
        subject = f"New Booking - {booking.venue.name}"
        context = {
            'booking': booking,
            'hall_admin': hall_admin,
        }
        
        result = send_html_email(
            subject=subject,
            template_name='hall_admin_new_booking',
            context=context,
            recipient_list=[hall_admin.email]
        )
        
        logger.info(f"Hall admin notification sent asynchronously for booking {booking_id}")
        return result
        
    except Exception as e:
        logger.error(f"Failed to send hall admin notification async: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


# ==================== SMART WRAPPER FUNCTIONS ====================
# These functions try async first, fall back to sync if Celery is unavailable


def send_welcome_email_smart(user, password):
    """
    Smart wrapper: Try async, fall back to sync if Celery unavailable.
    
    Args:
        user: User object
        password: Generated password
    """
    try:
        if is_celery_available():
            # Try async
            send_welcome_email_async.delay(
                user_id=user.id,
                user_email=user.email,
                user_full_name=user.get_full_name(),
                password=password
            )
            logger.info(f"Welcome email queued asynchronously for {user.email}")
        else:
            # Fall back to sync
            logger.info(f"Celery unavailable, sending welcome email synchronously to {user.email}")
            send_welcome_email(user, password)
    except Exception as e:
        logger.error(f"Failed to queue/send welcome email: {str(e)}")
        # Last resort: try sync
        try:
            send_welcome_email(user, password)
        except Exception as sync_e:
            logger.error(f"Fallback sync email also failed: {str(sync_e)}")


def send_booking_confirmation_smart(booking):
    """
    Smart wrapper: Try async, fall back to sync if Celery unavailable.
    
    Args:
        booking: Booking object
    """
    try:
        if is_celery_available():
            # Try async
            send_booking_confirmation_async.delay(booking_id=booking.id)
            logger.info(f"Booking confirmation queued asynchronously for booking {booking.id}")
        else:
            # Fall back to sync
            logger.info(f"Celery unavailable, sending booking confirmation synchronously")
            send_booking_confirmation_email(booking)
    except Exception as e:
        logger.error(f"Failed to queue/send booking confirmation: {str(e)}")
        # Last resort: try sync
        try:
            send_booking_confirmation_email(booking)
        except Exception as sync_e:
            logger.error(f"Fallback sync email also failed: {str(sync_e)}")


def send_booking_cancellation_smart(booking, cancelled_by=None):
    """
    Smart wrapper: Try async, fall back to sync if Celery unavailable.
    
    Args:
        booking: Booking object
        cancelled_by: User who cancelled (optional)
    """
    try:
        if is_celery_available():
            # Try async
            send_booking_cancellation_async.delay(
                booking_id=booking.id,
                cancelled_by_id=cancelled_by.id if cancelled_by else None
            )
            logger.info(f"Booking cancellation queued asynchronously for booking {booking.id}")
        else:
            # Fall back to sync
            logger.info(f"Celery unavailable, sending booking cancellation synchronously")
            send_booking_cancellation_email(booking, cancelled_by)
    except Exception as e:
        logger.error(f"Failed to queue/send booking cancellation: {str(e)}")
        # Last resort: try sync
        try:
            send_booking_cancellation_email(booking, cancelled_by)
        except Exception as sync_e:
            logger.error(f"Fallback sync email also failed: {str(sync_e)}")


def send_hall_admin_notification_smart(booking, hall_admin):
    """
    Smart wrapper: Try async, fall back to sync if Celery unavailable.
    
    Args:
        booking: Booking object
        hall_admin: Hall Admin user object
    """
    try:
        if is_celery_available():
            # Try async
            send_hall_admin_notification_async.delay(
                booking_id=booking.id,
                hall_admin_id=hall_admin.id
            )
            logger.info(f"Hall admin notification queued asynchronously for booking {booking.id}")
        else:
            # Fall back to sync
            logger.info(f"Celery unavailable, sending hall admin notification synchronously")
            send_hall_admin_booking_notification(booking, hall_admin)
    except Exception as e:
        logger.error(f"Failed to queue/send hall admin notification: {str(e)}")
        # Last resort: try sync
        try:
            send_hall_admin_booking_notification(booking, hall_admin)
        except Exception as sync_e:
            logger.error(f"Fallback sync email also failed: {str(sync_e)}")

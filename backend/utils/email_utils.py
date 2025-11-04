"""
Email utilities for BookIT
Handles sending HTML emails for various notifications
"""
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


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

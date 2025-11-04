from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from datetime import datetime
from .models import Booking, VenueAdmin, Notification
from .serializers import (
    BookingSerializer,
    BookingCreateSerializer,
    BookingUpdateSerializer,
    BookingCancelSerializer,
    BookingListSerializer,
    CheckAvailabilitySerializer,
    VenueAdminSerializer,
    NotificationSerializer,
    NotificationCreateSerializer
)
from accounts.permissions import CanBookVenue, IsSuperAdmin
from venue_management.models import Venue
from utils.email_utils import (
    send_booking_confirmation_email,
    send_booking_cancellation_email,
    send_hall_admin_booking_notification
)
from utils.notification_utils import (
    notify_booking_confirmed,
    notify_booking_cancelled,
    notify_hall_admin_new_booking,
    get_unread_count,
    mark_all_as_read
)
import logging

logger = logging.getLogger(__name__)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Booking CRUD operations
    """
    queryset = Booking.objects.all()
    pagination_class = None  # Disable pagination
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BookingListSerializer
        elif self.action == 'create':
            return BookingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookingUpdateSerializer
        elif self.action == 'cancel':
            return BookingCancelSerializer
        elif self.action == 'check_availability':
            return CheckAvailabilitySerializer
        return BookingSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [CanBookVenue()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsSuperAdmin()]
        elif self.action in ['check_availability', 'public_calendar']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        Filter bookings based on user role
        - Super Admin: All bookings
        - Hall Admin: Bookings for their assigned venues
        - HOD/Dean: Their own bookings
        """
        user = self.request.user
        
        if user.is_admin():
            return Booking.objects.all()
        elif user.is_venue_admin():
            # Get venues assigned to this hall admin
            assigned_venues = VenueAdmin.objects.filter(user=user).values_list('venue_id', flat=True)
            return Booking.objects.filter(venue_id__in=assigned_venues)
        else:
            # HOD/Dean see only their bookings
            return Booking.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Set the user to the current authenticated user and send notification emails"""
        booking = serializer.save(user=self.request.user)
        
        # Send confirmation email to user
        try:
            send_booking_confirmation_email(booking)
            logger.info(f"Booking confirmation email sent to {booking.user.email}")
        except Exception as e:
            logger.error(f"Failed to send booking confirmation email: {str(e)}")
        
        # Create in-app notification for user
        try:
            notify_booking_confirmed(booking)
        except Exception as e:
            logger.error(f"Failed to create booking confirmation notification: {str(e)}")
        
        # Send notification to Hall Admin if venue has assigned admin
        try:
            venue_admins = VenueAdmin.objects.filter(venue=booking.venue)
            for venue_admin in venue_admins:
                send_hall_admin_booking_notification(booking, venue_admin.user)
                notify_hall_admin_new_booking(booking, venue_admin.user)
                logger.info(f"Hall admin notification sent to {venue_admin.user.email}")
        except Exception as e:
            logger.error(f"Failed to send hall admin notification: {str(e)}")
    
    @action(detail=False, methods=['get'])
    def my_bookings(self, request):
        """
        Get bookings based on user role:
        - Hall Admin: Bookings for assigned venues
        - HOD/Dean/Others: Their own bookings
        """
        bookings = self.get_queryset().order_by('-created_at')
        logger.info(f"User: {request.user.email}, Role: {request.user.role}, Bookings count: {bookings.count()}")
        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def check_availability(self, request):
        """Check if a venue is available for given date and time slot"""
        serializer = CheckAvailabilitySerializer(data=request.data)
        if serializer.is_valid():
            venue = serializer.validated_data['venue']
            booking_date = serializer.validated_data['date']
            start_time = serializer.validated_data['start_time']
            end_time = serializer.validated_data['end_time']
            
            # Check for conflicts
            conflicts = Booking.objects.filter(
                venue=venue,
                date=booking_date,
                status='confirmed'
            ).filter(
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            
            if conflicts.exists():
                conflicting_bookings = BookingListSerializer(conflicts, many=True).data
                return Response({
                    'available': False,
                    'message': 'Venue is not available for the selected time slot',
                    'conflicts': conflicting_bookings
                })
            
            return Response({
                'available': True,
                'message': 'Venue is available for the selected time slot'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        try:
            booking = self.get_object()
            user = request.user
            
            print(f"Cancel booking attempt - User: {user.email}, Booking ID: {booking.id}")
            print(f"Booking venue: {booking.venue.name}, Booking user: {booking.user.email}")
            
            # Check if user can cancel this booking
            # Allowed: Booking owner, Super Admin, or Hall Admin for assigned venue
            is_owner = user == booking.user
            is_admin = user.is_admin()
            is_venue_admin = user.is_venue_admin() and VenueAdmin.objects.filter(user=user, venue=booking.venue).exists()
            
            print(f"is_owner: {is_owner}, is_admin: {is_admin}, is_venue_admin: {is_venue_admin}")
            
            can_cancel = is_owner or is_admin or is_venue_admin
            
            if not can_cancel:
                print(f"Permission denied for user {user.email}")
                return Response(
                    {'error': 'You do not have permission to cancel this booking'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = BookingCancelSerializer(booking, data=request.data)
            if serializer.is_valid():
                serializer.save()
                print(f"Booking {booking.id} cancelled successfully")
                
                # Send cancellation email to booking owner
                try:
                    cancelled_by = user if user != booking.user else None
                    send_booking_cancellation_email(booking, cancelled_by)
                    logger.info(f"Cancellation email sent to {booking.user.email}")
                except Exception as e:
                    logger.error(f"Failed to send cancellation email: {str(e)}")
                
                # Create in-app notification for booking owner
                try:
                    cancelled_by = user if user != booking.user else None
                    notify_booking_cancelled(booking, cancelled_by)
                except Exception as e:
                    logger.error(f"Failed to create cancellation notification: {str(e)}")
                
                return Response({
                    'message': 'Booking cancelled successfully',
                    'booking': BookingSerializer(booking).data
                })
            
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error in cancel: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to cancel booking: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming bookings"""
        today = timezone.now().date()
        bookings = self.get_queryset().filter(
            date__gte=today,
            status='confirmed'
        ).order_by('date', 'start_time')
        
        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Get past bookings"""
        today = timezone.now().date()
        bookings = self.get_queryset().filter(
            date__lt=today
        ).order_by('-date', '-start_time')
        
        serializer = BookingListSerializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public_calendar(self, request):
        """
        Public endpoint for calendar view - no authentication required
        Returns approved bookings with limited information (time, event name, department)
        Filters out sensitive data like contact numbers and special requirements
        """
        from datetime import timedelta
        
        # Get date range from query params or default to current week
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Default: current week (Monday to Sunday)
            today = timezone.now().date()
            start_date = today - timedelta(days=today.weekday())
            end_date = start_date + timedelta(days=6)
        
        # Get only confirmed bookings within date range for active venues
        bookings = Booking.objects.filter(
            date__gte=start_date,
            date__lte=end_date,
            status='confirmed',
            venue__is_active=True
        ).select_related('venue', 'user').order_by('date', 'start_time')
        
        # Format data for calendar view with limited information
        calendar_data = []
        for booking in bookings:
            calendar_data.append({
                'id': booking.id,
                'venue': {
                    'id': booking.venue.id,
                    'name': booking.venue.name
                },
                'date': str(booking.date),  # Convert to string for JSON serialization
                'start_time': str(booking.start_time),
                'end_time': str(booking.end_time),
                'event_name': booking.event_name or 'Event',
                'department': booking.user.department or 'N/A',
                # Exclude sensitive data: contact_number, special_requirements, user details
            })
        
        return Response({
            'start_date': start_date,
            'end_date': end_date,
            'bookings': calendar_data
        })


class VenueAdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for VenueAdmin (Hall Admin assignment) operations
    Only Super Admin can manage venue admin assignments
    """
    queryset = VenueAdmin.objects.all()
    serializer_class = VenueAdminSerializer
    permission_classes = [IsSuperAdmin]
    
    @action(detail=False, methods=['get'])
    def by_venue(self, request):
        """Get all hall admins assigned to a specific venue"""
        venue_id = request.query_params.get('venue_id')
        if not venue_id:
            return Response(
                {'error': 'venue_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignments = VenueAdmin.objects.filter(venue_id=venue_id)
        serializer = VenueAdminSerializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_admin(self, request):
        """Get all venues assigned to a specific hall admin"""
        admin_id = request.query_params.get('admin_id')
        if not admin_id:
            return Response(
                {'error': 'admin_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assignments = VenueAdmin.objects.filter(admin_id=admin_id)
        serializer = VenueAdminSerializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_venues(self, request):
        """Get venues assigned to current hall admin"""
        user = request.user
        
        if not user.is_venue_admin():
            return Response(
                {'error': 'Only Hall Admins can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from venue_management.serializers import VenueSerializer
        # Get venue IDs assigned to this admin
        venue_ids = VenueAdmin.objects.filter(user=user).values_list('venue_id', flat=True)
        venues = Venue.objects.filter(id__in=venue_ids)
        
        serializer = VenueSerializer(venues, many=True)
        return Response(serializer.data)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Notification CRUD operations
    Users can only see their own notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Disable pagination for notifications
    
    def get_queryset(self):
        """Return only the current user's notifications, ordered by newest first"""
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = get_unread_count(request.user)
        return Response({'unread_count': count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        return Response({
            'message': 'Notification marked as read',
            'notification': NotificationSerializer(notification).data
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        updated = mark_all_as_read(request.user)
        return Response({
            'message': f'{updated} notification(s) marked as read',
            'updated_count': updated
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications (last 10)"""
        notifications = self.get_queryset()[:10]
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Delete all read notifications"""
        deleted_count = self.get_queryset().filter(is_read=True).delete()[0]
        return Response({
            'message': f'{deleted_count} notification(s) deleted',
            'deleted_count': deleted_count
        })

from rest_framework import serializers
from django.utils import timezone
from datetime import datetime, time
from .models import Booking, VenueAdmin, Notification
from venue_management.serializers import VenueListSerializer
from accounts.serializers import UserSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    
    venue_details = VenueListSerializer(source='venue', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    duration = serializers.FloatField(source='duration_hours', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'venue', 'venue_details', 'user', 'user_details',
            'event_name', 'event_description', 'date', 'start_time', 'end_time',
            'expected_attendees', 'contact_number', 'special_requirements',
            'status', 'cancellation_reason', 'cancelled_at',
            'duration', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'status', 'cancellation_reason', 
            'cancelled_at', 'created_at', 'updated_at',
            'venue_details', 'user_details', 'duration'
        ]


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    
    class Meta:
        model = Booking
        fields = [
            'venue', 'event_name', 'event_description',
            'date', 'start_time', 'end_time',
            'expected_attendees', 'contact_number', 'special_requirements'
        ]
    
    def validate_venue(self, value):
        """Validate that venue exists and is active"""
        if not value.is_active:
            raise serializers.ValidationError('This venue is not active for booking')
        return value
    
    def validate(self, attrs):
        """Validate booking data"""
        errors = {}
        
        # Check if end time is after start time
        if attrs.get('start_time') and attrs.get('end_time'):
            if attrs['end_time'] <= attrs['start_time']:
                errors['end_time'] = 'End time must be after start time'
        
        # Check if date is not in the past
        if attrs.get('date'):
            if attrs['date'] < timezone.now().date():
                errors['date'] = 'Cannot book dates in the past'
            
            # Check if booking is not too far in advance (90 days)
            days_ahead = (attrs['date'] - timezone.now().date()).days
            if days_ahead > 90:
                errors['date'] = 'Cannot book more than 90 days in advance'
        
        # Check if attendees don't exceed venue capacity
        venue = attrs.get('venue')
        attendees = attrs.get('expected_attendees')
        if venue and attendees:
            if attendees > venue.capacity:
                errors['expected_attendees'] = f'Expected attendees ({attendees}) exceed venue capacity ({venue.capacity})'
        
        # Check for conflicting bookings
        if attrs.get('venue') and attrs.get('date') and attrs.get('start_time') and attrs.get('end_time'):
            conflicting = Booking.objects.filter(
                venue=attrs['venue'],
                date=attrs['date'],
                status='confirmed'
            ).filter(
                start_time__lt=attrs['end_time'],
                end_time__gt=attrs['start_time']
            )
            
            if conflicting.exists():
                conflict = conflicting.first()
                errors['time_slot'] = f'Time slot conflicts with existing booking: {conflict.event_name} ({conflict.start_time}-{conflict.end_time})'
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return attrs
    
    def create(self, validated_data):
        """Create booking with current user"""
        user = self.context['request'].user
        validated_data['user'] = user
        validated_data['status'] = 'confirmed'
        return super().create(validated_data)


class BookingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating booking details (limited fields)"""
    
    class Meta:
        model = Booking
        fields = [
            'event_name', 'event_description',
            'expected_attendees', 'special_requirements'
        ]
    
    def validate_expected_attendees(self, value):
        """Check if attendees don't exceed venue capacity"""
        booking = self.instance
        if booking and value > booking.venue.capacity:
            raise serializers.ValidationError(
                f'Expected attendees ({value}) exceed venue capacity ({booking.venue.capacity})'
            )
        return value


class BookingCancelSerializer(serializers.Serializer):
    """Serializer for cancelling bookings"""
    
    cancellation_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        """Check if booking can be cancelled"""
        booking = self.instance
        
        if not booking.can_cancel():
            if booking.status == 'cancelled':
                raise serializers.ValidationError('Booking is already cancelled')
            elif booking.is_past:
                raise serializers.ValidationError('Cannot cancel past bookings')
            else:
                raise serializers.ValidationError('Cannot cancel booking within 2 hours of start time')
        
        return attrs
    
    def update(self, instance, validated_data):
        """Cancel the booking"""
        from django.utils import timezone
        
        instance.status = 'cancelled'
        instance.cancellation_reason = validated_data.get('cancellation_reason', '')
        instance.cancelled_at = timezone.now()
        instance.save()
        
        return instance


class BookingListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for booking list"""
    
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    requester_name = serializers.CharField(source='user.get_full_name', read_only=True)
    department = serializers.CharField(source='user.department', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'venue', 'venue_name', 'user_name', 'requester_name', 'department',
            'event_name', 'event_description', 'date', 'start_time', 'end_time',
            'expected_attendees', 'contact_number', 'special_requirements',
            'status', 'cancellation_reason', 'cancelled_at', 'created_at'
        ]
        read_only_fields = ['id']


class CheckAvailabilitySerializer(serializers.Serializer):
    """Serializer for checking venue availability"""
    
    venue = serializers.IntegerField(required=True)
    date = serializers.DateField(required=True)
    start_time = serializers.TimeField(required=True)
    end_time = serializers.TimeField(required=True)
    
    def validate_venue(self, value):
        """Validate that venue exists and is active"""
        from venue_management.models import Venue
        try:
            venue = Venue.objects.get(id=value)
            if not venue.is_active:
                raise serializers.ValidationError('This venue is not active for booking')
            return venue
        except Venue.DoesNotExist:
            raise serializers.ValidationError('Venue not found')
    
    def validate(self, attrs):
        """Validate availability check data"""
        if attrs['end_time'] <= attrs['start_time']:
            raise serializers.ValidationError({
                'end_time': 'End time must be after start time'
            })
        
        if attrs['date'] < timezone.now().date():
            raise serializers.ValidationError({
                'date': 'Cannot check availability for past dates'
            })
        
        return attrs


class VenueAdminSerializer(serializers.ModelSerializer):
    """Serializer for VenueAdmin model"""
    
    user_details = UserSerializer(source='user', read_only=True)
    venue_details = VenueListSerializer(source='venue', read_only=True)
    
    class Meta:
        model = VenueAdmin
        fields = [
            'id', 'user', 'user_details', 'venue', 
            'venue_details', 'assigned_date'
        ]
        read_only_fields = ['id', 'assigned_date', 'user_details', 'venue_details']
    
    def validate(self, attrs):
        """Validate venue admin assignment"""
        user = attrs.get('user')
        
        if user and user.role != 'hall_admin':
            raise serializers.ValidationError({
                'user': 'Only users with hall_admin role can be assigned as venue administrators'
            })
        
        # Check for duplicate assignment
        venue = attrs.get('venue')
        if user and venue:
            if VenueAdmin.objects.filter(user=user, venue=venue).exists():
                raise serializers.ValidationError(
                    'This user is already assigned to this venue'
                )
        
        return attrs


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'user_name', 'notification_type', 'title', 'message',
            'link', 'is_read', 'created_at', 'read_at', 'time_ago',
            'related_booking_id', 'related_venue_id'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'read_at', 'user_name', 'time_ago']
    
    def get_time_ago(self, obj):
        """Calculate time ago string"""
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        
        seconds = diff.total_seconds()
        if seconds < 60:
            return 'Just now'
        elif seconds < 3600:
            minutes = int(seconds / 60)
            return f'{minutes} minute{"s" if minutes != 1 else ""} ago'
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f'{hours} hour{"s" if hours != 1 else ""} ago'
        elif seconds < 604800:
            days = int(seconds / 86400)
            return f'{days} day{"s" if days != 1 else ""} ago'
        else:
            return obj.created_at.strftime('%B %d, %Y')


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications"""
    
    class Meta:
        model = Notification
        fields = [
            'user', 'notification_type', 'title', 'message', 'link',
            'related_booking_id', 'related_venue_id'
        ]


class WaitlistSerializer(serializers.ModelSerializer):
    """Serializer for Waitlist model"""
    
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        from .models import Waitlist
        model = Waitlist
        fields = [
            'id', 'venue', 'venue_name', 'user', 'user_email', 'user_name',
            'date', 'start_time', 'end_time', 'created_at',
            'notified', 'notified_at', 'claimed', 'claimed_at',
            'expired', 'priority', 'time_remaining', 'is_expired'
        ]
        read_only_fields = [
            'id', 'user', 'created_at', 'notified', 'notified_at',
            'claimed', 'claimed_at', 'expired', 'venue_name', 
            'user_email', 'user_name', 'time_remaining', 'is_expired'
        ]
    
    def get_user_name(self, obj):
        """Get user's full name"""
        return obj.user.get_full_name()
    
    def get_time_remaining(self, obj):
        """Get seconds remaining to claim slot"""
        return obj.time_remaining()
    
    def get_is_expired(self, obj):
        """Check if notification has expired"""
        return obj.is_expired()
    
    def validate(self, data):
        """Validate waitlist entry"""
        user = self.context['request'].user
        venue = data.get('venue')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        # Check if user already has a booking for this slot
        from .models import Booking
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
        from .models import Waitlist
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
        from .models import Waitlist
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
        
        # Validate date is in the future
        if date < timezone.now().date():
            raise serializers.ValidationError(
                "Cannot join waitlist for past dates"
            )
        
        # Validate times
        if end_time <= start_time:
            raise serializers.ValidationError(
                "End time must be after start time"
            )
        
        return data

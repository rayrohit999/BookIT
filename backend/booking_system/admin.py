from django.contrib import admin
from .models import Booking, VenueAdmin as VenueAdminModel, Notification, Waitlist


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """Admin interface for Booking model"""
    
    list_display = ('event_name', 'venue', 'user', 'date', 'start_time', 'end_time', 'status', 'created_at')
    list_filter = ('status', 'date', 'venue', 'created_at')
    search_fields = ('event_name', 'event_description', 'user__email', 'venue__name')
    ordering = ('-date', '-start_time')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Booking Details', {
            'fields': ('venue', 'user', 'event_name', 'event_description')
        }),
        ('Date & Time', {
            'fields': ('date', 'start_time', 'end_time')
        }),
        ('Attendees & Contact', {
            'fields': ('expected_attendees', 'contact_number', 'special_requirements')
        }),
        ('Status', {
            'fields': ('status', 'cancellation_reason', 'cancelled_at')
        }),
        ('Reminder & Confirmation', {
            'fields': ('reminder_sent', 'reminder_sent_at', 'confirmed', 'confirmed_at'),
            'classes': ('collapse',)
        }),
        ('Auto-Cancellation', {
            'fields': ('auto_cancelled', 'auto_cancelled_at', 'auto_cancel_reason'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'cancelled_at', 'reminder_sent_at', 'confirmed_at', 'auto_cancelled_at')
    
    def get_readonly_fields(self, request, obj=None):
        """Make certain fields readonly after creation"""
        if obj:
            return self.readonly_fields + ('created_at', 'updated_at')
        return self.readonly_fields


@admin.register(VenueAdminModel)
class VenueAdminAdmin(admin.ModelAdmin):
    """Admin interface for VenueAdmin model"""
    
    list_display = ('user', 'venue', 'assigned_date')
    list_filter = ('venue', 'assigned_date')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'venue__name')
    ordering = ('venue__name', 'user__first_name')
    
    fieldsets = (
        ('Assignment', {
            'fields': ('user', 'venue')
        }),
    )
    
    readonly_fields = ('assigned_date',)
    
    def get_readonly_fields(self, request, obj=None):
        """Make assigned_date readonly"""
        if obj:
            return self.readonly_fields + ('assigned_date',)
        return self.readonly_fields


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification model"""
    
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__email', 'title', 'message')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('user', 'notification_type', 'title', 'message', 'link')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Related Objects', {
            'fields': ('related_booking_id', 'related_venue_id'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'read_at')
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        """Mark selected notifications as read"""
        from django.utils import timezone
        updated = queryset.update(is_read=True, read_at=timezone.now())
        self.message_user(request, f'{updated} notification(s) marked as read.')
    mark_as_read.short_description = 'Mark selected as read'
    
    def mark_as_unread(self, request, queryset):
        """Mark selected notifications as unread"""
        updated = queryset.update(is_read=False, read_at=None)
        self.message_user(request, f'{updated} notification(s) marked as unread.')
    mark_as_unread.short_description = 'Mark selected as unread'


@admin.register(Waitlist)
class WaitlistAdmin(admin.ModelAdmin):
    """Admin interface for Waitlist model"""
    
    list_display = ('user', 'venue', 'date', 'start_time', 'end_time', 'notified', 'claimed', 'expired', 'created_at')
    list_filter = ('notified', 'claimed', 'expired', 'venue', 'date', 'created_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'venue__name')
    ordering = ('priority', 'created_at')
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Waitlist Details', {
            'fields': ('venue', 'user', 'date', 'start_time', 'end_time', 'priority')
        }),
        ('Notification Status', {
            'fields': ('notified', 'notified_at')
        }),
        ('Claim Status', {
            'fields': ('claimed', 'claimed_at', 'expired')
        }),
    )
    
    readonly_fields = ('created_at', 'notified_at', 'claimed_at')
    
    actions = ['reset_notification', 'mark_as_expired']
    
    def reset_notification(self, request, queryset):
        """Reset notification status for selected entries"""
        updated = queryset.update(notified=False, notified_at=None, expired=False)
        self.message_user(request, f'{updated} waitlist entr(y/ies) notification status reset.')
    reset_notification.short_description = 'Reset notification status'
    
    def mark_as_expired(self, request, queryset):
        """Mark selected entries as expired"""
        updated = queryset.update(expired=True)
        self.message_user(request, f'{updated} waitlist entr(y/ies) marked as expired.')
    mark_as_expired.short_description = 'Mark as expired'

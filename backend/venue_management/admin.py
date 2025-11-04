from django.contrib import admin
from .models import Venue


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    """Admin interface for Venue model"""
    
    list_display = ('name', 'building', 'floor', 'capacity', 'is_active', 'created_at')
    list_filter = ('is_active', 'building', 'created_at')
    search_fields = ('name', 'location', 'building', 'description')
    ordering = ('name',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'location', 'building', 'floor')
        }),
        ('Capacity & Facilities', {
            'fields': ('capacity', 'facilities', 'description')
        }),
        ('Media', {
            'fields': ('photo_url',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_readonly_fields(self, request, obj=None):
        """Make created_at and updated_at readonly"""
        if obj:
            return self.readonly_fields + ('created_at', 'updated_at')
        return self.readonly_fields

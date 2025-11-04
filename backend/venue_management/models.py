from django.db import models
from django.core.validators import MinValueValidator


class Venue(models.Model):
    """Model representing a bookable venue/hall"""
    
    # Basic Information
    name = models.CharField(max_length=100, unique=True, 
                          help_text="Venue name (e.g., LRDC Hall)")
    location = models.CharField(max_length=255, 
                              help_text="Full location description")
    building = models.CharField(max_length=100, 
                              help_text="Building name")
    floor = models.CharField(max_length=20, 
                            help_text="Floor number/name")
    
    # Capacity and Facilities
    capacity = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Maximum person capacity"
    )
    facilities = models.JSONField(
        null=True, 
        blank=True,
        default=list,
        help_text="Available facilities (e.g., ['Projector', 'AC', 'Audio System'])"
    )
    description = models.TextField(
        null=True, 
        blank=True,
        help_text="Additional venue details"
    )
    
    # Media
    photo_url = models.URLField(
        max_length=500, 
        null=True, 
        blank=True,
        help_text="URL/path to venue photo"
    )
    
    # Status
    is_active = models.BooleanField(
        default=True,
        help_text="Whether venue is available for booking"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'venues'
        verbose_name = 'Venue'
        verbose_name_plural = 'Venues'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.location})"
    
    def get_full_location(self):
        """Return complete location string"""
        return f"{self.floor}, {self.building}"
    
    @property
    def facility_list(self):
        """Return facilities as list"""
        if isinstance(self.facilities, list):
            return self.facilities
        return []
    
    def has_facility(self, facility_name):
        """Check if venue has specific facility"""
        return facility_name in self.facility_list

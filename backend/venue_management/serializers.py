from rest_framework import serializers
from .models import Venue


class VenueSerializer(serializers.ModelSerializer):
    """Serializer for Venue model"""
    
    full_location = serializers.CharField(source='get_full_location', read_only=True)
    facility_list = serializers.ListField(read_only=True)
    
    class Meta:
        model = Venue
        fields = [
            'id', 'name', 'location', 'building', 'floor', 
            'capacity', 'facilities', 'facility_list', 'description',
            'photo_url', 'is_active', 'full_location',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_location', 'facility_list']


class VenueListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for venue list"""
    
    class Meta:
        model = Venue
        fields = [
            'id', 'name', 'location', 'building', 'floor', 
            'capacity', 'is_active'
        ]
        read_only_fields = ['id']


class VenueCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating venues"""
    
    class Meta:
        model = Venue
        fields = [
            'name', 'location', 'building', 'floor',
            'capacity', 'facilities', 'description', 'photo_url', 'is_active'
        ]
    
    def validate_capacity(self, value):
        """Ensure capacity is positive"""
        if value < 1:
            raise serializers.ValidationError("Capacity must be at least 1")
        return value
    
    def validate_facilities(self, value):
        """Ensure facilities is a list"""
        if value is not None and not isinstance(value, list):
            raise serializers.ValidationError("Facilities must be a list")
        return value


class VenueUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating venues"""
    
    class Meta:
        model = Venue
        fields = [
            'name', 'location', 'building', 'floor',
            'capacity', 'facilities', 'description', 'photo_url', 'is_active'
        ]
    
    def validate_capacity(self, value):
        """Ensure capacity is positive"""
        if value < 1:
            raise serializers.ValidationError("Capacity must be at least 1")
        return value

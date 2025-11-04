from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Venue
from .serializers import (
    VenueSerializer,
    VenueListSerializer,
    VenueCreateSerializer,
    VenueUpdateSerializer
)
from accounts.permissions import IsSuperAdmin


class VenueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Venue CRUD operations
    Public can view venues (read-only)
    Only Super Admin can create/update/delete venues
    """
    queryset = Venue.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'location', 'description']
    ordering_fields = ['name', 'capacity', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        """
        Filter queryset based on user role
        - Super Admin: See all venues (including inactive)
        - Hall Admin: See all their assigned venues (including inactive)
        - Others: See only active venues
        """
        queryset = Venue.objects.all()
        user = self.request.user
        
        # Super Admin sees all venues
        if user and user.is_authenticated and user.is_admin():
            return queryset
        
        # Hall Admin sees all their assigned venues (including inactive)
        if user and user.is_authenticated and user.is_venue_admin():
            from booking_system.models import VenueAdmin
            managed_venue_ids = VenueAdmin.objects.filter(user=user).values_list('venue_id', flat=True)
            return queryset.filter(id__in=managed_venue_ids)
        
        # Others see only active venues
        return queryset.filter(is_active=True)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return VenueListSerializer
        elif self.action == 'create':
            return VenueCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return VenueUpdateSerializer
        return VenueSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsSuperAdmin()]
        elif self.action in ['update', 'partial_update']:
            from rest_framework.permissions import IsAuthenticated
            return [IsAuthenticated()]
        elif self.action == 'destroy':
            return [IsSuperAdmin()]
        elif self.action == 'toggle_availability':
            from rest_framework.permissions import IsAuthenticated
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def update(self, request, *args, **kwargs):
        """Update venue - Super Admin or assigned Hall Admin only"""
        try:
            venue = self.get_object()
            user = request.user
            
            # Check if user has permission
            if not (user.is_admin() or self._is_venue_admin_for_venue(user, venue)):
                return Response(
                    {'error': 'You do not have permission to edit this venue'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in update: {str(e)}")
            return Response(
                {'error': f'Failed to update venue: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def partial_update(self, request, *args, **kwargs):
        """Partial update venue - Super Admin or assigned Hall Admin only"""
        try:
            venue = self.get_object()
            user = request.user
            
            # Check if user has permission
            if not (user.is_admin() or self._is_venue_admin_for_venue(user, venue)):
                return Response(
                    {'error': 'You do not have permission to edit this venue'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            return super().partial_update(request, *args, **kwargs)
        except Exception as e:
            print(f"Error in partial_update: {str(e)}")
            return Response(
                {'error': f'Failed to update venue: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'], url_path='toggle-availability')
    def toggle_availability(self, request, pk=None):
        """
        Toggle venue availability status
        Only Super Admin or assigned Hall Admin can toggle
        """
        try:
            from booking_system.models import VenueAdmin
            
            venue = self.get_object()
            user = request.user
            
            print(f"Toggle attempt - User: {user.email}, Venue: {venue.name}")
            print(f"User is_admin: {user.is_admin()}, is_venue_admin: {user.is_venue_admin()}")
            
            # Check permissions
            if not (user.is_admin() or self._is_venue_admin_for_venue(user, venue)):
                print(f"Permission denied for user {user.email}")
                return Response(
                    {'error': 'You do not have permission to manage this venue'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Toggle the status
            venue.is_active = not venue.is_active
            venue.save()
            print(f"Venue {venue.name} toggled to is_active={venue.is_active}")
            
            serializer = VenueSerializer(venue)
            return Response({
                'message': f'Venue {"activated" if venue.is_active else "deactivated"} successfully',
                'venue': serializer.data
            })
        except Exception as e:
            print(f"Error in toggle_availability: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to toggle venue availability: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _is_venue_admin_for_venue(self, user, venue):
        """Check if user is hall admin for this venue"""
        if not user.is_venue_admin():
            return False
        from booking_system.models import VenueAdmin
        return VenueAdmin.objects.filter(user=user, venue=venue).exists()

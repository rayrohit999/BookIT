from rest_framework import permissions


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Allow read-only access to everyone, but write access only to authenticated users
    """
    
    def has_permission(self, request, view):
        # Allow GET, HEAD, OPTIONS for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Require authentication for write operations
        return request.user and request.user.is_authenticated


class IsSuperAdmin(permissions.BasePermission):
    """
    Only super admin users can access
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin()


class CanBookVenue(permissions.BasePermission):
    """
    Only HOD, Dean, and Super Admin can create bookings
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.can_book_venue()


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners to edit their objects
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for anyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Super admin can do anything
        if request.user.is_admin():
            return True
        
        # Write permissions only to the owner
        return obj.user == request.user


class IsVenueAdminOrReadOnly(permissions.BasePermission):
    """
    Hall admins can view their assigned venues
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_venue_admin()

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, VenueAdminViewSet, NotificationViewSet, WaitlistViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'venue-admins', VenueAdminViewSet, basename='venue-admin')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'waitlist', WaitlistViewSet, basename='waitlist')

urlpatterns = [
    path('', include(router.urls)),
]

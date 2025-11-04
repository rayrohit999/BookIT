#!/usr/bin/env python
"""
Test Hall Admin APIs
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from rest_framework.test import APIClient
from accounts.models import User
from venue_management.models import Venue
from booking_system.models import VenueAdmin, Booking

# Initialize client
client = APIClient()

# Get hall admin user
hall_admin = User.objects.get(email='halladmin@pccoe.edu')
client.force_authenticate(user=hall_admin)

# Get LRDC Hall (venue assigned to hall admin)
venue = Venue.objects.get(name='LRDC Hall')
print(f"\n=== Testing with venue: {venue.name} (ID: {venue.id}) ===")

# Check if VenueAdmin exists
venue_admin = VenueAdmin.objects.filter(user=hall_admin, venue=venue).first()
print(f"VenueAdmin exists: {venue_admin is not None}")
if venue_admin:
    print(f"VenueAdmin ID: {venue_admin.id}")

# Test 1: Toggle availability
print("\n--- Test 1: Toggle Availability ---")
response = client.post(f'/api/venues/{venue.id}/toggle-availability/')
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json() if response.status_code != 500 else response.content}")

# Test 2: Update venue
print("\n--- Test 2: Update Venue (PATCH) ---")
response = client.patch(f'/api/venues/{venue.id}/', {
    'capacity': 120,
    'location': 'Ground Floor, Near Main Gate'
})
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json() if response.status_code != 500 else response.content}")

# Test 3: Cancel booking
print("\n--- Test 3: Cancel Booking ---")
# Get a confirmed booking for this venue
booking = Booking.objects.filter(
    venue=venue,
    status='confirmed'
).first()

if booking:
    print(f"Testing with booking ID: {booking.id}")
    response = client.post(f'/api/bookings/{booking.id}/cancel/', {
        'cancellation_reason': 'Test cancellation by hall admin'
    })
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json() if response.status_code != 500 else response.content}")
else:
    print("No confirmed bookings found for testing")

print("\n=== Tests Complete ===")

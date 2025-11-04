"""
Script to create Hall Admin user and assign venues for testing
Run this script: python setup_hall_admin.py
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from venue_management.models import Venue
from booking_system.models import VenueAdmin

def setup_hall_admin():
    print("Setting up Hall Admin user and venue assignments...")
    
    # Create or get Hall Admin user
    hall_admin_email = "halladmin@pccoe.edu"
    hall_admin, created = User.objects.get_or_create(
        email=hall_admin_email,
        defaults={
            'first_name': 'Hall',
            'last_name': 'Admin',
            'role': 'hall_admin',
            'department': 'Administration',
            'phone': '9876543210',
            'can_book': True,
        }
    )
    
    if created:
        hall_admin.set_password('password123')
        hall_admin.save()
        print(f"✓ Created Hall Admin user: {hall_admin_email}")
    else:
        print(f"✓ Hall Admin user already exists: {hall_admin_email}")
    
    # Get all active venues
    venues = Venue.objects.filter(is_active=True)
    
    if not venues.exists():
        print("✗ No active venues found. Please activate some venues first.")
        return
    
    # Assign all venues to Hall Admin
    assigned_count = 0
    for venue in venues:
        venue_admin, created = VenueAdmin.objects.get_or_create(
            venue=venue,
            admin=hall_admin
        )
        if created:
            assigned_count += 1
            print(f"  ✓ Assigned venue: {venue.name}")
        else:
            print(f"  ✓ Already assigned: {venue.name}")
    
    print(f"\n✓ Setup complete!")
    print(f"  Total venues assigned: {venues.count()}")
    print(f"  New assignments: {assigned_count}")
    print(f"\nLogin credentials:")
    print(f"  Email: {hall_admin_email}")
    print(f"  Password: password123")

if __name__ == '__main__':
    setup_hall_admin()

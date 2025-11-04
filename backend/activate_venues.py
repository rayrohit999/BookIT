"""
Quick script to activate all venues in the database
Run this with: python activate_venues.py
"""

import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from venue_management.models import Venue

def activate_all_venues():
    """Set all venues to active status"""
    venues = Venue.objects.all()
    count = venues.count()
    
    print(f"Found {count} venues in database")
    
    # Update all venues to active
    updated = venues.update(is_active=True)
    
    print(f"✅ Successfully activated {updated} venues")
    
    # Display venue status
    print("\nVenue Status:")
    print("-" * 60)
    for venue in Venue.objects.all():
        status = "✅ Active" if venue.is_active else "❌ Inactive"
        print(f"{venue.name:30} | {status}")
    print("-" * 60)

if __name__ == "__main__":
    activate_all_venues()

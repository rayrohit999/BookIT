#!/usr/bin/env python
"""
Test HTML email templates
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from accounts.models import User
from utils.email_utils import send_welcome_email
from utils.password_utils import generate_random_password

print("=" * 60)
print("Testing Welcome Email Template")
print("=" * 60)

# Get a test user (or create dummy data)
try:
    test_user = User.objects.filter(role='student').first()
    if not test_user:
        test_user = User.objects.first()
    
    if test_user:
        print(f"\nTest User: {test_user.get_full_name()}")
        print(f"Email: {test_user.email}")
        print(f"Role: {test_user.get_role_display()}")
        
        # Generate password
        test_password = generate_random_password()
        print(f"\nGenerated Password: {test_password}")
        
        # Send welcome email
        print("\nSending welcome email...")
        result = send_welcome_email(test_user, test_password)
        
        if result > 0:
            print(f"✅ Welcome email sent successfully to {test_user.email}!")
            print("\n📧 Please check your inbox (and spam folder)")
        else:
            print("❌ Failed to send welcome email")
    else:
        print("❌ No users found in database for testing")
        
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("Test Complete!")
print("=" * 60)

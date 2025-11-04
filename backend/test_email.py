#!/usr/bin/env python
"""
Test email functionality
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from utils.password_utils import generate_random_password

print("=" * 60)
print("Email Configuration Test")
print("=" * 60)

print(f"\nEmail Backend: {settings.EMAIL_BACKEND}")
print(f"Email Host: {settings.EMAIL_HOST}")
print(f"Email Port: {settings.EMAIL_PORT}")
print(f"Email User: {settings.EMAIL_HOST_USER}")
print(f"From Email: {settings.DEFAULT_FROM_EMAIL}")

print("\n" + "=" * 60)
print("Testing Simple Email")
print("=" * 60)

try:
    send_mail(
        subject='BookIT - Email Test',
        message='This is a test email from BookIT notification system.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.EMAIL_HOST_USER],
        fail_silently=False,
    )
    print("✅ Simple email sent successfully!")
except Exception as e:
    print(f"❌ Failed to send simple email: {str(e)}")

print("\n" + "=" * 60)
print("Testing Password Generation")
print("=" * 60)

for i in range(5):
    password = generate_random_password()
    print(f"Generated Password {i+1}: {password}")

print("\n" + "=" * 60)
print("Test Complete!")
print("=" * 60)

# Email & Notification System Implementation Plan

**Project**: BookIT - Venue Booking System  
**Feature**: Email & In-App Notification System  
**Date Started**: November 4, 2025  
**Email Sender**: carrerhub.com@gmail.com  
**SMTP App Password**: naso cwzk vvrf kvob

---

## 🎯 Project Overview

Implement a comprehensive notification system that:
1. Sends styled HTML emails for key events
2. Generates random secure passwords for new users
3. Provides in-app notifications for real-time updates
4. Notifies users and admins about booking lifecycle events

---

## 📋 Implementation Phases

### **Phase 1: Core Email System Setup** ⏱️ ~30 mins

#### Tasks:
- [ ] **Task 1.1**: Configure Django email settings (SMTP)
  - Update `settings.py` with email configuration
  - Set sender email: carrerhub.com@gmail.com
  - Configure SMTP for Gmail with app password
  - Test email sending functionality

- [ ] **Task 1.2**: Create email utilities module
  - Create `backend/utils/email_utils.py`
  - Base email sending function
  - HTML email wrapper
  - Error handling and logging

- [ ] **Task 1.3**: Design HTML email templates
  - Create `backend/templates/emails/` directory
  - Base email template (header, footer, styling)
  - Professional, responsive design
  - BookIT branding (simple, no college logo)

- [ ] **Task 1.4**: Implement random password generation
  - Create password generation utility
  - 12-character secure passwords
  - Mix of uppercase, lowercase, digits, special chars
  - Use Python `secrets` module for security

**Status**: ⏳ Not Started  
**Estimated Time**: 30 minutes  
**Dependencies**: None

---

### **Phase 2: User Management Emails** ⏱️ ~25 mins

#### Tasks:
- [ ] **Task 2.1**: Welcome email for new users
  - HTML template for welcome email
  - Include generated password
  - Login instructions
  - Password change reminder
  - Contact information

- [ ] **Task 2.2**: Integrate with user creation
  - Modify Super Admin user creation view
  - Generate random password instead of "Password123"
  - Send welcome email automatically
  - Log email status

- [ ] **Task 2.3**: Test user creation flow
  - Create test user via Super Admin
  - Verify email received
  - Verify password works
  - Check email formatting

**Status**: ⏳ Not Started  
**Estimated Time**: 25 minutes  
**Dependencies**: Phase 1 complete

---

### **Phase 3: Booking Notification Emails** ⏱️ ~40 mins

#### Tasks:
- [ ] **Task 3.1**: Booking confirmation email
  - HTML template for booking confirmation
  - Include: venue, date, time, event details
  - Include: booking ID, contact info
  - Send to: booking creator
  - Trigger: on booking creation

- [ ] **Task 3.2**: Booking cancellation email
  - HTML template for cancellation notification
  - Include: cancellation reason
  - Include: original booking details
  - Send to: booking creator
  - Trigger: on booking cancellation

- [ ] **Task 3.3**: Hall Admin new booking notification
  - HTML template for admin notification
  - Include: requester details, event info
  - Include: venue details, date/time
  - Send to: assigned Hall Admin
  - Trigger: on new booking for their venue

- [ ] **Task 3.4**: Integrate with booking views
  - Modify booking creation endpoint
  - Modify booking cancellation endpoint
  - Send appropriate emails
  - Handle email failures gracefully

**Status**: ⏳ Not Started  
**Estimated Time**: 40 minutes  
**Dependencies**: Phase 1 complete

---

### **Phase 4: In-App Notifications (Basic)** ⏱️ ~45 mins

#### Tasks:
- [ ] **Task 4.1**: Create Notification model
  - Create `Notification` model in appropriate app
  - Fields: user, message, type, is_read, created_at, link
  - Add to admin panel
  - Create migration

- [ ] **Task 4.2**: Create notification API endpoints
  - List notifications endpoint (GET)
  - Mark as read endpoint (POST)
  - Mark all as read endpoint (POST)
  - Delete notification endpoint (DELETE)
  - Unread count endpoint (GET)

- [ ] **Task 4.3**: Create notification utility functions
  - Function to create notification
  - Function to notify user
  - Function to notify hall admins
  - Integration with booking events

- [ ] **Task 4.4**: Frontend - Notification bell
  - Add notification bell icon to navbar
  - Show unread count badge
  - Dropdown menu for recent notifications
  - Auto-refresh unread count
  - Mark as read on click

- [ ] **Task 4.5**: Frontend - Notifications page
  - Full notifications list page
  - Filter by read/unread
  - Mark all as read button
  - Delete notifications option
  - Pagination for large lists

**Status**: ⏳ Not Started  
**Estimated Time**: 45 minutes  
**Dependencies**: Phase 1 complete

---

### **Phase 5: Testing & Documentation** ⏱️ ~30 mins

#### Tasks:
- [ ] **Task 5.1**: Comprehensive testing
  - Test user creation with random password
  - Test all email templates render correctly
  - Test booking confirmation emails
  - Test cancellation emails
  - Test Hall Admin notifications
  - Test in-app notifications
  - Test email failure scenarios

- [ ] **Task 5.2**: Update documentation
  - Document email configuration
  - Document notification system architecture
  - Document API endpoints
  - Document email templates
  - Create troubleshooting guide

- [ ] **Task 5.3**: Security review
  - Ensure passwords not logged
  - Verify email credentials secured
  - Check for email injection vulnerabilities
  - Verify notification access control

**Status**: ⏳ Not Started  
**Estimated Time**: 30 minutes  
**Dependencies**: All phases complete

---

## 📊 Project Timeline

| Phase | Tasks | Time | Status |
|-------|-------|------|--------|
| Phase 1: Core Email Setup | 4 tasks | 30 mins | ⏳ Not Started |
| Phase 2: User Management Emails | 3 tasks | 25 mins | ⏳ Not Started |
| Phase 3: Booking Emails | 4 tasks | 40 mins | ⏳ Not Started |
| Phase 4: In-App Notifications | 5 tasks | 45 mins | ⏳ Not Started |
| Phase 5: Testing & Documentation | 3 tasks | 30 mins | ⏳ Not Started |
| **TOTAL** | **19 tasks** | **~2.5 hours** | **0% Complete** |

---

## 🔔 Notification Types & Triggers

### Email Notifications
1. **User Welcome** - When Super Admin creates new user
2. **Booking Confirmed** - When booking is created
3. **Booking Cancelled** - When booking is cancelled (by user or admin)
4. **New Booking for Venue** - When Hall Admin's venue gets new booking

### In-App Notifications
1. **Booking Confirmed** - Your booking was confirmed
2. **Booking Cancelled** - Your booking was cancelled
3. **New Booking** - (Hall Admin) New booking for your venue
4. **Venue Assignment** - (Hall Admin) You were assigned to a venue

---

## 📧 Email Templates Design

### Template Structure
```
┌─────────────────────────────────────┐
│  BookIT Header (styled banner)      │
├─────────────────────────────────────┤
│  Email Content                       │
│  - Greeting                          │
│  - Main message                      │
│  - Details table/list                │
│  - Call-to-action button             │
├─────────────────────────────────────┤
│  Footer                              │
│  - Contact info                      │
│  - System message                    │
│  - PCCOE name                        │
└─────────────────────────────────────┘
```

### Color Scheme (Professional)
- Primary: #1976d2 (Blue)
- Secondary: #424242 (Dark Gray)
- Success: #4caf50 (Green)
- Warning: #ff9800 (Orange)
- Danger: #f44336 (Red)
- Background: #f5f5f5 (Light Gray)

---

## 🔧 Technical Stack

### Backend
- **Email Backend**: Django SMTP
- **Email Provider**: Gmail SMTP
- **Template Engine**: Django Templates
- **Password Generation**: Python `secrets` module
- **Notification Storage**: PostgreSQL/SQLite

### Frontend
- **UI Framework**: Material-UI
- **Icons**: Material Icons
- **Notifications Badge**: MUI Badge component
- **Notifications Dropdown**: MUI Menu/Popover

---

## 🔐 Security Considerations

1. **Password Security**
   - ✅ Random generation using `secrets` module
   - ✅ Never log generated passwords
   - ✅ Secure transmission via email
   - ✅ Force password change on first login (optional)

2. **Email Security**
   - ✅ App password instead of main password
   - ✅ Password stored in environment variables
   - ✅ TLS encryption for SMTP
   - ✅ Prevent email injection attacks

3. **Notification Security**
   - ✅ User can only see their own notifications
   - ✅ Proper authentication required
   - ✅ No sensitive data in notification messages

---

## 📝 Future Enhancements (Not in Current Scope)

1. ⏳ **Booking Reminders** (24 hours before)
   - Requires: Celery + Redis for scheduled tasks
   - Time: ~1 hour additional

2. ⏳ **Real-time Notifications** (WebSocket)
   - Requires: Django Channels + Redis
   - Time: ~3 hours additional

3. ⏳ **Email Templates Admin Panel**
   - Allow Super Admin to edit email templates
   - Time: ~2 hours additional

4. ⏳ **SMS Notifications**
   - Requires: Third-party SMS service (Twilio, etc.)
   - Time: ~1 hour additional

5. ⏳ **Push Notifications** (Browser)
   - Requires: Service Workers + Push API
   - Time: ~2 hours additional

6. ⏳ **Notification Preferences**
   - Allow users to customize notification settings
   - Time: ~1 hour additional

---

## 📂 Files to be Created/Modified

### New Files
```
backend/
  utils/
    email_utils.py          # Email sending utilities
    password_utils.py       # Password generation
  templates/
    emails/
      base.html            # Base email template
      welcome.html         # Welcome email
      booking_confirmed.html
      booking_cancelled.html
      hall_admin_new_booking.html
  notifications/           # New app (optional)
    models.py             # Notification model
    serializers.py        # Notification serializers
    views.py              # Notification API views
    urls.py               # Notification URLs

frontend/
  src/
    components/
      NotificationBell.js  # Notification bell component
    pages/
      NotificationsPage.js # Full notifications page
    services/
      notificationService.js
```

### Modified Files
```
backend/
  config/settings.py       # Email configuration
  accounts/views.py        # User creation with email
  booking_system/views.py  # Booking emails

frontend/
  src/
    components/Layout.js   # Add notification bell
    services/index.js      # Add notification service
```

---

## ✅ Completion Criteria

- [x] Phase 1: Email system configured and tested
- [x] Phase 2: User creation sends welcome email with random password
- [x] Phase 3: Booking emails sent for all lifecycle events
- [x] Phase 4: In-app notifications working with frontend UI
- [x] Phase 5: All features tested and documented
- [x] Email templates are professional and responsive
- [x] No errors in production
- [x] Documentation updated

---

## 📞 Support & Troubleshooting

### Common Issues
1. **Emails not sending**
   - Check SMTP credentials
   - Verify Gmail app password
   - Check firewall/antivirus blocking port 587

2. **Emails in spam folder**
   - Verify sender email
   - Add SPF/DKIM records (production)
   - Ask users to whitelist sender

3. **Slow email sending**
   - Use background tasks (Celery) for production
   - Queue emails for batch sending

---

## 📊 Progress Tracking

**Last Updated**: November 4, 2025  
**Current Phase**: Not Started  
**Overall Progress**: 0%

### Phase Completion Status
- Phase 1: ⏳ 0% (0/4 tasks)
- Phase 2: ⏳ 0% (0/3 tasks)
- Phase 3: ⏳ 0% (0/4 tasks)
- Phase 4: ⏳ 0% (0/5 tasks)
- Phase 5: ⏳ 0% (0/3 tasks)

---

*This document will be updated as implementation progresses.*

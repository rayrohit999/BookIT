# BookIT - Venue Management System

## Project Information
**Institution:** Pimpri Chinchwad College of Engineering (PCCOE)  
**Project Name:** BookIT  
**Purpose:** Efficient venue booking and management system with time-slot based reservations  
**Development Start:** October 2025

---

## Problem Statement

### Current System Issues
1. **Full-Day Booking Problem**: When a venue is booked for a specific event, the entire day is blocked even if the event only uses a few hours
2. **Manual Availability Checking**: Users must contact hall admins to check availability before booking
3. **Poor Resource Utilization**: Venues remain idle for significant portions of the day due to full-day blocking
4. **No Centralized System**: No digital system to view real-time availability
5. **Time Slot Conflicts**: Cannot book same venue for different time slots on the same day

### Current Workflow
1. User needs to book a hall
2. Contacts respective hall admin to check availability
3. If available, fills physical form from HOD/Dean
4. Manual approval process
5. Hall blocked for entire day regardless of actual usage time

---

## Proposed Solution

### Core Features
- **Time-Slot Based Booking**: Divide each day into specific time slots (e.g., 9-11 AM, 11-1 PM, etc.)
- **Real-Time Availability**: Public calendar showing available/booked slots
- **Instant Booking**: No approval required if slot is vacant
- **Role-Based Access**: Different permissions for different user types
- **Centralized Dashboard**: Hall admins can see all bookings for their venues

### Benefits
1. **Better Utilization**: Multiple events can use the same venue on different time slots
2. **Time Saving**: No need for manual availability checks
3. **Transparency**: Everyone can see real-time availability
4. **Efficiency**: Automated booking process
5. **Accountability**: Digital records of all bookings
6. **Better Planning**: Hall admins can prepare arrangements based on dashboard

---

## Venues (Initial Setup)

### 1. LRDC Hall
- **Location**: 4th Floor, Mechanical Building
- **Capacity**: 150 persons
- **Facilities**: TBD

### 2. Seminar Hall
- **Location**: 5th Floor, Mechanical Building
- **Capacity**: 250 persons
- **Facilities**: TBD

*Note: System is designed to easily add more venues in the future*

---

## User Roles & Permissions

### 1. Public/Guest (No Login Required)
- View venue calendar
- See all bookings
- Check availability
- View venue details

### 2. HOD/Dean (Login Required)
- All public permissions
- Create new bookings
- View their department's bookings
- Cancel their own bookings

### 3. Hall Admin (Login Required)
- All public permissions
- View all bookings for their assigned venue(s)
- Dashboard with upcoming events
- Cannot create bookings (view-only access)
- See booking details (contact info, requirements)

### 4. Super Admin (Login Required)
- Full system access
- Manage users (create HOD/Dean/Hall Admin accounts)
- Manage venues (add/edit/delete venues)
- Manage all bookings (view/edit/delete)
- View analytics and reports
- System configuration

---

## Key Requirements

### Functional Requirements
1. Public can view calendar without login
2. HOD/Dean can login and create bookings
3. Hall Admin can login and view their venue bookings
4. Super Admin can manage entire system
5. No approval workflow - instant booking if slot is free
6. Prevent double booking of same venue + time slot
7. Email/Password based authentication

### Non-Functional Requirements
1. Support at least 100 concurrent users
2. Fast response time (< 2 seconds for booking operations)
3. Mobile-responsive design
4. Secure authentication
5. Data backup and recovery
6. Easy to maintain and scale

### Technical Requirements
1. SQLite for development, PostgreSQL for production
2. RESTful API architecture
3. JWT-based authentication
4. Responsive UI for mobile/tablet/desktop

---

## Success Criteria

1. ✅ Multiple bookings possible for same venue on different time slots
2. ✅ Real-time availability visible to all
3. ✅ Booking process takes < 2 minutes
4. ✅ No double bookings (system prevents conflicts)
5. ✅ Hall admins can see their venue schedule
6. ✅ 100+ concurrent users supported
7. ✅ Zero downtime during business hours

---

## Future Enhancements (Post-MVP)

1. Mobile application
2. Email notifications for bookings
3. SMS reminders before events
4. Equipment booking (projectors, mics, etc.)
5. Recurring bookings
6. Analytics dashboard
7. Department-wise usage reports
8. Integration with college website
9. QR code for booking confirmation
10. Feedback system

---

## Project Timeline

- **Phase 1 (MVP)**: 3-4 weeks
- **Phase 2 (Enhanced)**: 2-3 weeks
- **Phase 3 (Advanced)**: 2-3 weeks

*Total Estimated Time: 7-10 weeks*

---

## Target Audience

- **Primary Users**: HODs, Deans (20-30 users)
- **Secondary Users**: Hall Admins (5-10 users)
- **Tertiary Users**: Students, Faculty, Staff (4500+ users - view-only)

---

## Project Team Roles

- **Developer**: Full-stack development
- **Super Admin**: System administration and user management
- **Hall Admins**: Venue coordination
- **End Users**: HODs, Deans, Students

---

*Last Updated: October 30, 2025*

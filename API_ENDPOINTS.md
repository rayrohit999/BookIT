# BookIT - API Endpoints Documentation

## API Overview

**Base URL**: `http://localhost:8000/api/v1/`  
**Authentication**: JWT (JSON Web Token)  
**Content-Type**: `application/json`

---

## Authentication Flow

### How JWT Works
1. User logs in with credentials
2. Server returns access token + refresh token
3. Client includes access token in header: `Authorization: Bearer <token>`
4. Access token expires in 24 hours
5. Use refresh token to get new access token

---

## API Endpoints

### 📌 Authentication Endpoints

#### 1. User Login
**POST** `/auth/login/`

Login with email and password to receive JWT tokens.

**Request Body:**
```json
{
  "email": "hod.computer@pccoe.edu",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "hod.computer@pccoe.edu",
    "first_name": "John",
    "last_name": "Doe",
    "role": "hod",
    "department": "Computer Engineering"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Account deactivated

---

#### 2. Refresh Token
**POST** `/auth/refresh/`

Get new access token using refresh token.

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

#### 3. Logout
**POST** `/auth/logout/`

Logout and blacklist refresh token.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

---

#### 4. Get Current User
**GET** `/auth/me/`

Get currently logged-in user details.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "hod.computer@pccoe.edu",
  "first_name": "John",
  "last_name": "Doe",
  "role": "hod",
  "department": "Computer Engineering",
  "phone": "+91-9876543210",
  "is_active": true
}
```

---

### 📌 Venue Endpoints

#### 5. List All Venues
**GET** `/venues/`

Get list of all active venues (Public access - no authentication required).

**Query Parameters:**
- `is_active` (optional): Filter by active status (true/false)

**Response (200 OK):**
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "name": "LRDC Hall",
      "location": "4th Floor, Mechanical Building",
      "building": "Mechanical Building",
      "floor": "4th Floor",
      "capacity": 150,
      "facilities": ["Projector", "Audio System", "AC"],
      "description": "Large conference hall suitable for seminars and workshops",
      "photo_url": "/media/venues/lrdc_hall.jpg",
      "is_active": true
    },
    {
      "id": 2,
      "name": "Seminar Hall",
      "location": "5th Floor, Mechanical Building",
      "building": "Mechanical Building",
      "floor": "5th Floor",
      "capacity": 250,
      "facilities": ["Projector", "Stage", "Audio System", "AC"],
      "description": "Large auditorium for major events",
      "photo_url": "/media/venues/seminar_hall.jpg",
      "is_active": true
    }
  ]
}
```

---

#### 6. Get Venue Details
**GET** `/venues/{id}/`

Get details of a specific venue (Public access).

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "LRDC Hall",
  "location": "4th Floor, Mechanical Building",
  "building": "Mechanical Building",
  "floor": "4th Floor",
  "capacity": 150,
  "facilities": ["Projector", "Audio System", "AC"],
  "description": "Large conference hall suitable for seminars and workshops",
  "photo_url": "/media/venues/lrdc_hall.jpg",
  "is_active": true,
  "created_at": "2025-10-01T10:00:00Z",
  "updated_at": "2025-10-15T14:30:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Venue does not exist

---

#### 7. Create Venue
**POST** `/venues/`

Create a new venue (Super Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Conference Room A",
  "location": "2nd Floor, Admin Building",
  "building": "Admin Building",
  "floor": "2nd Floor",
  "capacity": 50,
  "facilities": ["Projector", "Whiteboard"],
  "description": "Small meeting room",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "id": 3,
  "name": "Conference Room A",
  "location": "2nd Floor, Admin Building",
  "building": "Admin Building",
  "floor": "2nd Floor",
  "capacity": 50,
  "facilities": ["Projector", "Whiteboard"],
  "description": "Small meeting room",
  "photo_url": null,
  "is_active": true,
  "created_at": "2025-10-30T10:00:00Z",
  "updated_at": "2025-10-30T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Not super admin

---

#### 8. Update Venue
**PUT** `/venues/{id}/`  
**PATCH** `/venues/{id}/`

Update venue details (Super Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body (PATCH - partial update):**
```json
{
  "capacity": 160,
  "facilities": ["Projector", "Audio System", "AC", "WiFi"]
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "LRDC Hall",
  "capacity": 160,
  "facilities": ["Projector", "Audio System", "AC", "WiFi"],
  "updated_at": "2025-10-30T11:00:00Z"
}
```

---

#### 9. Delete Venue
**DELETE** `/venues/{id}/`

Delete a venue (Super Admin only). Only possible if no bookings exist.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

**Error Responses:**
- `400 Bad Request`: Venue has existing bookings
- `403 Forbidden`: Not super admin
- `404 Not Found`: Venue does not exist

---

### 📌 Booking Endpoints

#### 10. List All Bookings
**GET** `/bookings/`

Get list of bookings (Public access with limited info, Full info for authenticated users).

**Query Parameters:**
- `venue_id` (optional): Filter by venue
- `date` (optional): Filter by date (YYYY-MM-DD)
- `date_from` (optional): Filter from date
- `date_to` (optional): Filter to date
- `status` (optional): Filter by status (confirmed/cancelled/completed)
- `user_id` (optional): Filter by user (requires authentication)

**Response (200 OK) - Public View:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "venue": {
        "id": 1,
        "name": "LRDC Hall"
      },
      "event_name": "Workshop on AI",
      "date": "2025-11-05",
      "start_time": "09:00:00",
      "end_time": "13:00:00",
      "expected_attendees": 120,
      "department": "Computer Engineering",
      "contact_person": "Dr. John Doe",
      "status": "confirmed"
    }
  ]
}
```

**Response (200 OK) - Authenticated View (includes more details):**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "venue": {
        "id": 1,
        "name": "LRDC Hall",
        "capacity": 150
      },
      "user": {
        "id": 5,
        "name": "Dr. John Doe",
        "department": "Computer Engineering",
        "email": "hod.computer@pccoe.edu"
      },
      "event_name": "Workshop on AI",
      "event_description": "Hands-on workshop on Machine Learning",
      "date": "2025-11-05",
      "start_time": "09:00:00",
      "end_time": "13:00:00",
      "expected_attendees": 120,
      "contact_number": "+91-9876543210",
      "special_requirements": "Need extra chairs and microphones",
      "status": "confirmed",
      "created_at": "2025-10-25T14:30:00Z"
    }
  ]
}
```

---

#### 11. Get Booking Details
**GET** `/bookings/{id}/`

Get details of a specific booking.

**Response (200 OK):**
```json
{
  "id": 1,
  "venue": {
    "id": 1,
    "name": "LRDC Hall",
    "location": "4th Floor, Mechanical Building",
    "capacity": 150
  },
  "user": {
    "id": 5,
    "name": "Dr. John Doe",
    "department": "Computer Engineering",
    "email": "hod.computer@pccoe.edu",
    "phone": "+91-9876543210"
  },
  "event_name": "Workshop on AI",
  "event_description": "Hands-on workshop on Machine Learning",
  "date": "2025-11-05",
  "start_time": "09:00:00",
  "end_time": "13:00:00",
  "expected_attendees": 120,
  "contact_number": "+91-9876543210",
  "special_requirements": "Need extra chairs and microphones",
  "status": "confirmed",
  "created_at": "2025-10-25T14:30:00Z",
  "updated_at": "2025-10-25T14:30:00Z"
}
```

---

#### 12. Create Booking
**POST** `/bookings/`

Create a new booking (HOD/Dean only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "venue_id": 1,
  "event_name": "Annual Tech Fest",
  "event_description": "Annual technical festival with competitions",
  "date": "2025-11-15",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "expected_attendees": 150,
  "contact_number": "+91-9876543210",
  "special_requirements": "Need stage setup and sound system"
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "venue": {
    "id": 1,
    "name": "LRDC Hall"
  },
  "user": {
    "id": 5,
    "name": "Dr. John Doe"
  },
  "event_name": "Annual Tech Fest",
  "date": "2025-11-15",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "status": "confirmed",
  "message": "Booking confirmed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: 
  - Validation errors
  - Venue not available (time slot conflict)
  - Expected attendees exceed venue capacity
  - Date in past
  - End time before start time
  - Booking too far in advance (>90 days)
- `401 Unauthorized`: Not logged in
- `403 Forbidden`: Not HOD/Dean

**Example Error Response:**
```json
{
  "error": "BOOKING_CONFLICT",
  "message": "This time slot is already booked",
  "conflicting_booking": {
    "id": 5,
    "event_name": "Department Meeting",
    "date": "2025-11-15",
    "start_time": "14:00:00",
    "end_time": "16:00:00"
  }
}
```

---

#### 13. Update Booking
**PATCH** `/bookings/{id}/`

Update booking details (only event name, description, attendees, requirements).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "event_name": "Annual Tech Fest 2025",
  "expected_attendees": 140,
  "special_requirements": "Need stage setup, sound system, and projector"
}
```

**Response (200 OK):**
```json
{
  "id": 10,
  "event_name": "Annual Tech Fest 2025",
  "expected_attendees": 140,
  "special_requirements": "Need stage setup, sound system, and projector",
  "updated_at": "2025-10-30T15:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Cannot edit venue, date, or time
- `403 Forbidden`: Can only edit own bookings
- `404 Not Found`: Booking does not exist

---

#### 14. Cancel Booking
**POST** `/bookings/{id}/cancel/`

Cancel a booking.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "cancellation_reason": "Event postponed due to unforeseen circumstances"
}
```

**Response (200 OK):**
```json
{
  "id": 10,
  "status": "cancelled",
  "cancellation_reason": "Event postponed due to unforeseen circumstances",
  "cancelled_at": "2025-10-30T16:00:00Z",
  "message": "Booking cancelled successfully"
}
```

**Error Responses:**
- `400 Bad Request`: 
  - Cannot cancel booking within 2 hours of start time
  - Booking already cancelled
  - Past bookings cannot be cancelled
- `403 Forbidden`: Can only cancel own bookings (except super admin)
- `404 Not Found`: Booking does not exist

---

#### 15. Check Availability
**GET** `/bookings/check-availability/`

Check if a venue is available for given date and time (Public access).

**Query Parameters:**
- `venue_id` (required): Venue ID
- `date` (required): Date (YYYY-MM-DD)
- `start_time` (required): Start time (HH:MM:SS)
- `end_time` (required): End time (HH:MM:SS)

**Example:**
```
GET /bookings/check-availability/?venue_id=1&date=2025-11-15&start_time=09:00:00&end_time=13:00:00
```

**Response (200 OK) - Available:**
```json
{
  "available": true,
  "venue": {
    "id": 1,
    "name": "LRDC Hall",
    "capacity": 150
  },
  "date": "2025-11-15",
  "start_time": "09:00:00",
  "end_time": "13:00:00",
  "message": "Venue is available for booking"
}
```

**Response (200 OK) - Not Available:**
```json
{
  "available": false,
  "venue": {
    "id": 1,
    "name": "LRDC Hall"
  },
  "date": "2025-11-15",
  "start_time": "09:00:00",
  "end_time": "13:00:00",
  "message": "Venue is not available",
  "conflicts": [
    {
      "id": 5,
      "event_name": "Workshop on AI",
      "start_time": "09:00:00",
      "end_time": "13:00:00"
    }
  ]
}
```

---

#### 16. Get My Bookings
**GET** `/bookings/my-bookings/`

Get all bookings made by the logged-in user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Filter by status (confirmed/cancelled/completed)
- `upcoming` (optional): Only upcoming bookings (true/false)

**Response (200 OK):**
```json
{
  "count": 3,
  "results": [
    {
      "id": 10,
      "venue": {
        "id": 1,
        "name": "LRDC Hall"
      },
      "event_name": "Annual Tech Fest",
      "date": "2025-11-15",
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "status": "confirmed"
    }
  ]
}
```

---

### 📌 User Management Endpoints (Super Admin Only)

#### 17. List All Users
**GET** `/users/`

Get list of all users (Super Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `role` (optional): Filter by role
- `is_active` (optional): Filter by active status
- `department` (optional): Filter by department

**Response (200 OK):**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "email": "hod.computer@pccoe.edu",
      "first_name": "John",
      "last_name": "Doe",
      "role": "hod",
      "department": "Computer Engineering",
      "phone": "+91-9876543210",
      "is_active": true,
      "created_at": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

#### 18. Create User
**POST** `/users/`

Create a new user (Super Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "email": "hod.mechanical@pccoe.edu",
  "password": "SecurePass123!",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "hod",
  "department": "Mechanical Engineering",
  "phone": "+91-9876543211"
}
```

**Response (201 Created):**
```json
{
  "id": 11,
  "email": "hod.mechanical@pccoe.edu",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "hod",
  "department": "Mechanical Engineering",
  "phone": "+91-9876543211",
  "is_active": true,
  "created_at": "2025-10-30T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors, email already exists
- `403 Forbidden`: Not super admin

---

#### 19. Update User
**PATCH** `/users/{id}/`

Update user details (Super Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "phone": "+91-9876543299",
  "is_active": false
}
```

**Response (200 OK):**
```json
{
  "id": 11,
  "phone": "+91-9876543299",
  "is_active": false,
  "updated_at": "2025-10-30T11:00:00Z"
}
```

---

#### 20. Delete User
**DELETE** `/users/{id}/`

Delete a user (Super Admin only). Cannot delete if user has bookings.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

**Error Responses:**
- `400 Bad Request`: User has existing bookings
- `403 Forbidden`: Not super admin, cannot delete self

---

### 📌 Hall Admin Endpoints

#### 21. Assign Venue to Hall Admin
**POST** `/venue-admins/`

Assign a venue to a hall admin (Super Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "user_id": 8,
  "venue_id": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": {
    "id": 8,
    "name": "Admin User",
    "email": "admin.lrdc@pccoe.edu"
  },
  "venue": {
    "id": 1,
    "name": "LRDC Hall"
  },
  "assigned_date": "2025-10-30T10:00:00Z"
}
```

---

#### 22. Get My Venues (Hall Admin)
**GET** `/venue-admins/my-venues/`

Get all venues assigned to logged-in hall admin.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "count": 1,
  "results": [
    {
      "id": 1,
      "name": "LRDC Hall",
      "location": "4th Floor, Mechanical Building",
      "capacity": 150,
      "upcoming_bookings_count": 5
    }
  ]
}
```

---

#### 23. Get Venue Dashboard (Hall Admin)
**GET** `/venue-admins/dashboard/`

Get dashboard data for hall admin's venues.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "venues": [
    {
      "id": 1,
      "name": "LRDC Hall",
      "today_bookings": [
        {
          "id": 15,
          "event_name": "Workshop",
          "start_time": "09:00:00",
          "end_time": "13:00:00",
          "expected_attendees": 100,
          "contact_person": "Dr. John Doe",
          "contact_number": "+91-9876543210"
        }
      ],
      "upcoming_bookings": [
        {
          "id": 16,
          "event_name": "Seminar",
          "date": "2025-11-01",
          "start_time": "14:00:00",
          "end_time": "16:00:00"
        }
      ],
      "statistics": {
        "this_week": 3,
        "this_month": 12,
        "utilization_rate": 65.5
      }
    }
  ]
}
```

---

### 📌 Analytics Endpoints (Super Admin Only)

#### 24. Get Analytics Dashboard
**GET** `/analytics/dashboard/`

Get overall system analytics (Super Admin only).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "total_bookings": 150,
  "total_venues": 2,
  "total_users": 25,
  "venue_utilization": [
    {
      "venue_id": 1,
      "venue_name": "LRDC Hall",
      "total_bookings": 85,
      "total_hours_booked": 340,
      "utilization_rate": 68.5
    },
    {
      "venue_id": 2,
      "venue_name": "Seminar Hall",
      "total_bookings": 65,
      "total_hours_booked": 260,
      "utilization_rate": 52.4
    }
  ],
  "department_statistics": [
    {
      "department": "Computer Engineering",
      "total_bookings": 45
    },
    {
      "department": "Mechanical Engineering",
      "total_bookings": 35
    }
  ],
  "peak_hours": [
    {"hour": "09:00", "bookings": 45},
    {"hour": "14:00", "bookings": 38}
  ]
}
```

---

## Error Response Format

All API errors follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {
    "field_name": ["Specific validation error"]
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_REQUIRED`: Not logged in
- `PERMISSION_DENIED`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `BOOKING_CONFLICT`: Time slot already booked
- `CAPACITY_EXCEEDED`: Too many attendees for venue
- `INVALID_TIME_RANGE`: End time before start time
- `PAST_DATE`: Cannot book past dates
- `TOO_FAR_AHEAD`: Booking too far in advance

---

## Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 500 requests per minute
- **Admin endpoints**: 1000 requests per minute

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` (default: 1): Page number
- `page_size` (default: 20, max: 100): Items per page

**Response Format:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/v1/bookings/?page=2",
  "previous": null,
  "results": [...]
}
```

---

*Last Updated: October 30, 2025*

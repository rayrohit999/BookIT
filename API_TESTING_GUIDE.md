# BookIT API Endpoints Documentation

## Base URL
```
http://127.0.0.1:8000/api/
```

## Authentication Endpoints

### 1. Login
- **URL**: `/api/auth/login/`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Success Response (200)**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "hod",
    "is_active": true
  }
}
```

### 2. Logout
- **URL**: `/api/auth/logout/`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```
- **Success Response (200)**:
```json
{
  "message": "Logout successful"
}
```

### 3. Refresh Token
- **URL**: `/api/auth/refresh/`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```
- **Success Response (200)**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## User Endpoints

### 4. Get Current User
- **URL**: `/api/users/me/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Headers**:
```
Authorization: Bearer <access_token>
```
- **Success Response (200)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "hod",
  "is_active": true,
  "total_bookings": 5,
  "active_bookings": 2
}
```

### 5. List All Users
- **URL**: `/api/users/`
- **Method**: `GET`
- **Auth Required**: Yes (Super Admin only for full access)
- **Success Response (200)**:
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "hod",
      "is_active": true
    }
  ]
}
```

### 6. Create User
- **URL**: `/api/users/`
- **Method**: `POST`
- **Auth Required**: No (Public registration)
- **Body**:
```json
{
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "role": "hod"
}
```
- **Success Response (201)**:
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "hod",
  "is_active": true
}
```

### 7. Get User Details
- **URL**: `/api/users/{id}/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response (200)**: Same as "Get Current User"

### 8. Update User
- **URL**: `/api/users/{id}/`
- **Method**: `PUT` or `PATCH`
- **Auth Required**: Yes (Super Admin only)
- **Body**:
```json
{
  "first_name": "John Updated",
  "last_name": "Doe",
  "role": "dean"
}
```
- **Success Response (200)**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John Updated",
  "last_name": "Doe",
  "role": "dean"
}
```

### 9. Delete User
- **URL**: `/api/users/{id}/`
- **Method**: `DELETE`
- **Auth Required**: Yes (Super Admin only)
- **Success Response (204)**: No content

### 10. Change Password
- **URL**: `/api/users/{id}/change_password/`
- **Method**: `POST`
- **Auth Required**: Yes (Own password or Super Admin)
- **Body**:
```json
{
  "old_password": "OldPass123!",
  "new_password": "NewPass123!",
  "new_password2": "NewPass123!"
}
```
- **Success Response (200)**:
```json
{
  "message": "Password updated successfully"
}
```

---

## Venue Endpoints

### 11. List All Venues
- **URL**: `/api/venues/`
- **Method**: `GET`
- **Auth Required**: No (Public read access)
- **Query Parameters**:
  - `is_available=true` - Filter by availability
  - `search=hall` - Search in name, location, description
  - `ordering=capacity` - Sort by field (name, capacity, created_at)
- **Success Response (200)**:
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "LRDC Hall",
      "location": "Ground Floor, Main Building",
      "capacity": 150,
      "is_available": true
    }
  ]
}
```

### 12. Get Venue Details
- **URL**: `/api/venues/{id}/`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response (200)**:
```json
{
  "id": 1,
  "name": "LRDC Hall",
  "description": "Large hall with modern facilities",
  "location": "Ground Floor, Main Building",
  "capacity": 150,
  "facilities": ["Projector", "Sound System", "AC", "WiFi"],
  "is_available": true,
  "created_at": "2025-10-30T10:00:00Z",
  "updated_at": "2025-10-30T10:00:00Z"
}
```

### 13. Create Venue
- **URL**: `/api/venues/`
- **Method**: `POST`
- **Auth Required**: Yes (Super Admin only)
- **Body**:
```json
{
  "name": "Conference Room A",
  "description": "Small conference room",
  "location": "First Floor, Admin Block",
  "capacity": 30,
  "facilities": ["Projector", "Whiteboard"],
  "is_available": true
}
```
- **Success Response (201)**:
```json
{
  "id": 3,
  "name": "Conference Room A",
  "description": "Small conference room",
  "location": "First Floor, Admin Block",
  "capacity": 30,
  "facilities": ["Projector", "Whiteboard"],
  "is_available": true
}
```

### 14. Update Venue
- **URL**: `/api/venues/{id}/`
- **Method**: `PUT` or `PATCH`
- **Auth Required**: Yes (Super Admin only)
- **Body**: Same as Create Venue
- **Success Response (200)**: Same as Get Venue Details

### 15. Delete Venue
- **URL**: `/api/venues/{id}/`
- **Method**: `DELETE`
- **Auth Required**: Yes (Super Admin only)
- **Success Response (204)**: No content

---

## Booking Endpoints

### 16. List All Bookings
- **URL**: `/api/bookings/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Note**: Users see only their bookings, Hall Admins see bookings for their venues, Super Admin sees all
- **Success Response (200)**:
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "venue_details": {
        "id": 1,
        "name": "LRDC Hall",
        "capacity": 150
      },
      "user_details": {
        "id": 2,
        "email": "hod@example.com",
        "full_name": "John Doe"
      },
      "date": "2025-11-05",
      "start_time": "09:00:00",
      "end_time": "12:00:00",
      "purpose": "Department Meeting",
      "expected_attendees": 50,
      "status": "confirmed"
    }
  ]
}
```

### 17. Create Booking
- **URL**: `/api/bookings/`
- **Method**: `POST`
- **Auth Required**: Yes (HOD, Dean, or Super Admin only)
- **Body**:
```json
{
  "venue": 1,
  "date": "2025-11-10",
  "start_time": "14:00:00",
  "end_time": "17:00:00",
  "purpose": "Workshop on AI",
  "expected_attendees": 80,
  "special_requirements": "Need extra chairs"
}
```
- **Success Response (201)**:
```json
{
  "id": 6,
  "venue": 1,
  "date": "2025-11-10",
  "start_time": "14:00:00",
  "end_time": "17:00:00",
  "purpose": "Workshop on AI",
  "expected_attendees": 80,
  "special_requirements": "Need extra chairs",
  "status": "confirmed"
}
```

### 18. Get Booking Details
- **URL**: `/api/bookings/{id}/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response (200)**:
```json
{
  "id": 1,
  "venue_details": {
    "id": 1,
    "name": "LRDC Hall",
    "location": "Ground Floor, Main Building",
    "capacity": 150
  },
  "user_details": {
    "id": 2,
    "email": "hod@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "hod"
  },
  "date": "2025-11-05",
  "start_time": "09:00:00",
  "end_time": "12:00:00",
  "purpose": "Department Meeting",
  "expected_attendees": 50,
  "special_requirements": null,
  "status": "confirmed",
  "cancellation_reason": null,
  "created_at": "2025-10-30T10:00:00Z"
}
```

### 19. Update Booking
- **URL**: `/api/bookings/{id}/`
- **Method**: `PUT` or `PATCH`
- **Auth Required**: Yes (Super Admin only)
- **Body**: Same as Create Booking
- **Success Response (200)**: Same as Get Booking Details

### 20. Delete Booking
- **URL**: `/api/bookings/{id}/`
- **Method**: `DELETE`
- **Auth Required**: Yes (Super Admin only)
- **Success Response (204)**: No content

### 21. Get My Bookings
- **URL**: `/api/bookings/my_bookings/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response (200)**: List of current user's bookings

### 22. Check Availability
- **URL**: `/api/bookings/check_availability/`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
```json
{
  "venue": 1,
  "date": "2025-11-10",
  "start_time": "14:00:00",
  "end_time": "17:00:00"
}
```
- **Success Response (200)** - Available:
```json
{
  "available": true,
  "message": "Venue is available for the selected time slot"
}
```
- **Success Response (200)** - Not Available:
```json
{
  "available": false,
  "message": "Venue is not available for the selected time slot",
  "conflicts": [
    {
      "id": 5,
      "date": "2025-11-10",
      "start_time": "13:00:00",
      "end_time": "16:00:00",
      "purpose": "Another Event"
    }
  ]
}
```

### 23. Cancel Booking
- **URL**: `/api/bookings/{id}/cancel/`
- **Method**: `POST`
- **Auth Required**: Yes (Booking owner or Super Admin)
- **Body**:
```json
{
  "cancellation_reason": "Event postponed due to weather"
}
```
- **Success Response (200)**:
```json
{
  "message": "Booking cancelled successfully",
  "booking": {
    "id": 1,
    "status": "cancelled",
    "cancellation_reason": "Event postponed due to weather"
  }
}
```

### 24. Get Upcoming Bookings
- **URL**: `/api/bookings/upcoming/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Note**: Returns future confirmed bookings based on user's access level
- **Success Response (200)**: List of upcoming bookings

### 25. Get Past Bookings
- **URL**: `/api/bookings/past/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Note**: Returns historical bookings based on user's access level
- **Success Response (200)**: List of past bookings

---

## Venue Admin Assignment Endpoints

### 26. List Venue Admin Assignments
- **URL**: `/api/venue-admins/`
- **Method**: `GET`
- **Auth Required**: Yes (Super Admin only)
- **Success Response (200)**:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "venue_details": {
        "id": 1,
        "name": "LRDC Hall"
      },
      "admin_details": {
        "id": 4,
        "email": "halladmin@example.com",
        "full_name": "Alice Johnson"
      },
      "assigned_at": "2025-10-30T10:00:00Z"
    }
  ]
}
```

### 27. Create Venue Admin Assignment
- **URL**: `/api/venue-admins/`
- **Method**: `POST`
- **Auth Required**: Yes (Super Admin only)
- **Body**:
```json
{
  "venue": 1,
  "admin": 4
}
```
- **Success Response (201)**:
```json
{
  "id": 1,
  "venue": 1,
  "admin": 4,
  "assigned_at": "2025-10-30T10:00:00Z"
}
```

### 28. Get Assignment Details
- **URL**: `/api/venue-admins/{id}/`
- **Method**: `GET`
- **Auth Required**: Yes (Super Admin only)
- **Success Response (200)**: Same as list item

### 29. Delete Assignment
- **URL**: `/api/venue-admins/{id}/`
- **Method**: `DELETE`
- **Auth Required**: Yes (Super Admin only)
- **Success Response (204)**: No content

### 30. Get Admins by Venue
- **URL**: `/api/venue-admins/by_venue/?venue_id=1`
- **Method**: `GET`
- **Auth Required**: Yes (Super Admin only)
- **Success Response (200)**: List of hall admins assigned to specified venue

### 31. Get Venues by Admin
- **URL**: `/api/venue-admins/by_admin/?admin_id=4`
- **Method**: `GET`
- **Auth Required**: Yes (Super Admin only)
- **Success Response (200)**: List of venues assigned to specified hall admin

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error message"
}
```

---

## Authentication Header Format

For all authenticated endpoints, include the JWT access token in the header:

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

---

## Notes

1. **Pagination**: List endpoints return paginated results (20 items per page)
2. **Token Expiry**: Access tokens expire in 24 hours, refresh tokens in 7 days
3. **Booking Rules**:
   - Cannot book past dates
   - Cannot book more than 90 days in advance
   - Cannot cancel bookings less than 2 hours before start time
   - Expected attendees cannot exceed venue capacity
4. **Role Permissions**:
   - **Public**: Can view venues and check availability
   - **HOD/Dean**: Can create and manage their own bookings
   - **Hall Admin**: Can view bookings for their assigned venues
   - **Super Admin**: Full access to all operations

---

## Testing with cURL Examples

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}'
```

### Get All Venues (Public)
```bash
curl http://127.0.0.1:8000/api/venues/
```

### Create Booking (Authenticated)
```bash
curl -X POST http://127.0.0.1:8000/api/bookings/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "venue": 1,
    "date": "2025-11-10",
    "start_time": "14:00:00",
    "end_time": "17:00:00",
    "purpose": "Workshop",
    "expected_attendees": 80
  }'
```

### Check Availability (Public)
```bash
curl -X POST http://127.0.0.1:8000/api/bookings/check_availability/ \
  -H "Content-Type: application/json" \
  -d '{
    "venue": 1,
    "date": "2025-11-10",
    "start_time": "14:00:00",
    "end_time": "17:00:00"
  }'
```

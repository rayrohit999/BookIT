# BookIT - Database Schema

## Database Overview

**Development**: SQLite  
**Production**: PostgreSQL  
**ORM**: Django ORM

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │         │    Venue     │         │   Booking   │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │         │ id (PK)      │    ┌────│ id (PK)     │
│ email       │         │ name         │    │    │ venue_id(FK)│
│ password    │         │ location     │    │    │ user_id(FK) │
│ first_name  │         │ building     │    │    │ event_name  │
│ last_name   │         │ floor        │    │    │ date        │
│ role        │         │ capacity     │    │    │ start_time  │
│ department  │         │ facilities   │    │    │ end_time    │
│ phone       │         │ description  │    │    │ status      │
│ is_active   │    ┌────│ photo_url    │    │    │ created_at  │
│ created_at  │    │    │ is_active    │    │    └─────────────┘
└─────────────┘    │    │ created_at   │    │
       │           │    └──────────────┘    │
       │           │             │          │
       │           └─────────────┴──────────┘
       │
       │           ┌──────────────────┐
       └───────────│ VenueAdmin       │
                   ├──────────────────┤
                   │ id (PK)          │
                   │ user_id (FK)     │
                   │ venue_id (FK)    │
                   │ assigned_date    │
                   └──────────────────┘
```

---

## Table Schemas

### 1. User Table (`users`)

Stores all system users (HOD, Dean, Hall Admin, Super Admin)

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email (used for login) |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `first_name` | VARCHAR(100) | NOT NULL | User's first name |
| `last_name` | VARCHAR(100) | NOT NULL | User's last name |
| `role` | VARCHAR(20) | NOT NULL | Role: 'super_admin', 'hod', 'dean', 'hall_admin' |
| `department` | VARCHAR(100) | NULL | Department name (for HOD/Dean) |
| `phone` | VARCHAR(20) | NULL | Contact number |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_email` on `email`
- `idx_role` on `role`
- `idx_is_active` on `is_active`

**Django Model Example:**
```python
class User(AbstractBaseUser):
    ROLE_CHOICES = [
        ('super_admin', 'Super Admin'),
        ('hod', 'HOD'),
        ('dean', 'Dean'),
        ('hall_admin', 'Hall Admin'),
    ]
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

### 2. Venue Table (`venues`)

Stores information about all bookable venues

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique venue identifier |
| `name` | VARCHAR(100) | NOT NULL | Venue name (e.g., "LRDC Hall") |
| `location` | VARCHAR(255) | NOT NULL | Full location description |
| `building` | VARCHAR(100) | NOT NULL | Building name (e.g., "Mechanical Building") |
| `floor` | VARCHAR(20) | NOT NULL | Floor number/name |
| `capacity` | INTEGER | NOT NULL | Maximum person capacity |
| `facilities` | TEXT | NULL | Available facilities (JSON or comma-separated) |
| `description` | TEXT | NULL | Additional venue details |
| `photo_url` | VARCHAR(500) | NULL | URL/path to venue photo |
| `is_active` | BOOLEAN | DEFAULT TRUE | Venue availability status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_is_active` on `is_active`
- `idx_name` on `name`

**Django Model Example:**
```python
class Venue(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    building = models.CharField(max_length=100)
    floor = models.CharField(max_length=20)
    capacity = models.IntegerField()
    facilities = models.JSONField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    photo_url = models.URLField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Initial Data:**
```sql
INSERT INTO venues (name, location, building, floor, capacity, is_active) VALUES
('LRDC Hall', '4th Floor, Mechanical Building', 'Mechanical Building', '4th Floor', 150, TRUE),
('Seminar Hall', '5th Floor, Mechanical Building', 'Mechanical Building', '5th Floor', 250, TRUE);
```

---

### 3. Booking Table (`bookings`)

Stores all venue bookings

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique booking identifier |
| `venue_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to venues.id |
| `user_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to users.id (booker) |
| `event_name` | VARCHAR(200) | NOT NULL | Name/title of the event |
| `event_description` | TEXT | NULL | Purpose/details of event |
| `date` | DATE | NOT NULL | Booking date |
| `start_time` | TIME | NOT NULL | Event start time |
| `end_time` | TIME | NOT NULL | Event end time |
| `expected_attendees` | INTEGER | NOT NULL | Expected number of attendees |
| `contact_number` | VARCHAR(20) | NOT NULL | Contact number for event |
| `special_requirements` | TEXT | NULL | Any special needs/requirements |
| `status` | VARCHAR(20) | NOT NULL | Status: 'confirmed', 'cancelled', 'completed' |
| `cancellation_reason` | TEXT | NULL | Reason for cancellation (if cancelled) |
| `cancelled_at` | TIMESTAMP | NULL | Cancellation timestamp |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Booking creation date |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_venue_date` on `venue_id, date` (for availability checks)
- `idx_user_id` on `user_id`
- `idx_status` on `status`
- `idx_date` on `date`

**Constraints:**
- `UNIQUE (venue_id, date, start_time, end_time)` - Prevent double booking
- `CHECK (end_time > start_time)` - Ensure valid time range
- `CHECK (expected_attendees <= venue.capacity)` - Ensure capacity not exceeded

**Django Model Example:**
```python
class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    venue = models.ForeignKey(Venue, on_delete=models.PROTECT)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    event_name = models.CharField(max_length=200)
    event_description = models.TextField(null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    expected_attendees = models.IntegerField()
    contact_number = models.CharField(max_length=20)
    special_requirements = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    cancellation_reason = models.TextField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['venue', 'date', 'start_time', 'end_time']
        indexes = [
            models.Index(fields=['venue', 'date']),
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['date']),
        ]
```

---

### 4. VenueAdmin Table (`venue_admins`)

Maps Hall Admins to their assigned venues

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique mapping identifier |
| `user_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to users.id (must be hall_admin) |
| `venue_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to venues.id |
| `assigned_date` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Assignment date |

**Indexes:**
- `idx_user_id` on `user_id`
- `idx_venue_id` on `venue_id`

**Constraints:**
- `UNIQUE (user_id, venue_id)` - One admin assigned once per venue

**Django Model Example:**
```python
class VenueAdmin(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'hall_admin'})
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    assigned_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'venue']
        verbose_name = 'Venue Administrator'
        verbose_name_plural = 'Venue Administrators'
```

---

### 5. TimeSlot Table (Optional - for Phase 2)

Predefined time slots for easier booking

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique slot identifier |
| `slot_name` | VARCHAR(50) | NOT NULL | Slot name (e.g., "Morning Session 1") |
| `start_time` | TIME | NOT NULL | Slot start time |
| `end_time` | TIME | NOT NULL | Slot end time |
| `is_active` | BOOLEAN | DEFAULT TRUE | Slot active status |

**Initial Data:**
```sql
INSERT INTO timeslots (slot_name, start_time, end_time, is_active) VALUES
('Morning Session 1', '09:00:00', '11:00:00', TRUE),
('Morning Session 2', '11:00:00', '13:00:00', TRUE),
('Afternoon Session 1', '14:00:00', '16:00:00', TRUE),
('Afternoon Session 2', '16:00:00', '18:00:00', TRUE),
('Evening Session', '18:00:00', '20:00:00', TRUE);
```

---

## Relationships

### One-to-Many Relationships

1. **User → Booking**
   - One user can make multiple bookings
   - `bookings.user_id` → `users.id`
   - Cascade: PROTECT (cannot delete user with bookings)

2. **Venue → Booking**
   - One venue can have multiple bookings
   - `bookings.venue_id` → `venues.id`
   - Cascade: PROTECT (cannot delete venue with bookings)

3. **User → VenueAdmin**
   - One user (Hall Admin) can manage multiple venues
   - `venue_admins.user_id` → `users.id`
   - Cascade: CASCADE (delete mappings if user deleted)

4. **Venue → VenueAdmin**
   - One venue can have multiple admins
   - `venue_admins.venue_id` → `venues.id`
   - Cascade: CASCADE (delete mappings if venue deleted)

---

## Common Queries

### 1. Check Availability
```sql
SELECT * FROM bookings 
WHERE venue_id = ? 
  AND date = ? 
  AND status = 'confirmed'
  AND (
    (start_time < ? AND end_time > ?) OR
    (start_time >= ? AND start_time < ?) OR
    (end_time > ? AND end_time <= ?)
  );
```

### 2. Get User's Bookings
```sql
SELECT b.*, v.name as venue_name, v.location 
FROM bookings b
JOIN venues v ON b.venue_id = v.id
WHERE b.user_id = ?
  AND b.status = 'confirmed'
ORDER BY b.date DESC, b.start_time DESC;
```

### 3. Get Hall Admin's Venue Bookings
```sql
SELECT b.*, v.name as venue_name, u.first_name, u.last_name, u.department
FROM bookings b
JOIN venues v ON b.venue_id = v.id
JOIN users u ON b.user_id = u.id
JOIN venue_admins va ON v.id = va.venue_id
WHERE va.user_id = ?
  AND b.status = 'confirmed'
  AND b.date >= CURRENT_DATE
ORDER BY b.date ASC, b.start_time ASC;
```

### 4. Venue Utilization Report
```sql
SELECT 
  v.name,
  COUNT(b.id) as total_bookings,
  SUM(TIMESTAMPDIFF(HOUR, b.start_time, b.end_time)) as total_hours_booked
FROM venues v
LEFT JOIN bookings b ON v.id = b.venue_id 
  AND b.status = 'confirmed'
  AND b.date BETWEEN ? AND ?
GROUP BY v.id, v.name;
```

---

## Data Validation Rules

### User
- Email must be valid and unique
- Password minimum 8 characters
- Role must be one of: super_admin, hod, dean, hall_admin
- Phone must be valid format (optional)

### Venue
- Name required, max 100 chars
- Capacity must be positive integer
- Floor and building required

### Booking
- Date cannot be in the past
- End time must be after start time
- Expected attendees must not exceed venue capacity
- Cannot book more than 90 days in advance
- Start time and end time must align with business hours (9 AM - 8 PM)
- No overlapping bookings for same venue

---

## Migration Strategy

### Development to Production (SQLite → PostgreSQL)

1. **Export SQLite Data**
   ```bash
   python manage.py dumpdata > backup.json
   ```

2. **Configure PostgreSQL**
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'bookit_db',
           'USER': 'bookit_user',
           'PASSWORD': 'secure_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

3. **Create Schema**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. **Import Data**
   ```bash
   python manage.py loaddata backup.json
   ```

---

## Backup Strategy

### Development
- Daily SQLite file backup
- Version control for schema changes

### Production
- PostgreSQL automated daily backups
- Weekly full backups
- Transaction log backups (every hour)
- Off-site backup storage
- Backup retention: 30 days

---

*Last Updated: October 30, 2025*

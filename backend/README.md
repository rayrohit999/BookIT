# BookIT Backend

Django REST API for BookIT Venue Management System.

## Setup Instructions

### 1. Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Create Django Project and Apps

```bash
# Create Django project
django-admin startproject bookit .

# Create Django apps
python manage.py startapp users
python manage.py startapp venues
python manage.py startapp bookings
```

### 4. Configure Settings

Update `bookit/settings.py` with the configurations from the setup guide.

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

Server will be available at: http://localhost:8000

## API Endpoints

See [API_ENDPOINTS.md](../API_ENDPOINTS.md) for complete API documentation.

## Project Structure

```
backend/
├── bookit/              # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── users/               # User management app
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── venues/              # Venue management app
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── bookings/            # Booking management app
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── manage.py
└── requirements.txt
```

## Database

- **Development**: SQLite (db.sqlite3)
- **Production**: PostgreSQL

## Testing

```bash
python manage.py test
```

## Admin Panel

Access Django admin at: http://localhost:8000/admin

## Notes

- Make sure to activate virtual environment before running any commands
- Keep `.env` file for sensitive configurations
- Never commit `db.sqlite3` or `.env` to version control

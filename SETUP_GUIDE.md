# BookIT - Phase 1 Setup Guide

## 🚀 Quick Start (Complete Setup)

This guide will walk you through setting up the BookIT project from scratch for Phase 1 development.

**Estimated Setup Time**: 30-45 minutes

---

## Prerequisites

Before starting, install these on your system:

### Required Software

1. **Python 3.10 or higher**
   - Download: https://www.python.org/downloads/
   - ✅ Check installation: `python --version`

2. **Node.js 18 or higher**
   - Download: https://nodejs.org/
   - ✅ Check installation: `node --version` and `npm --version`

3. **Git**
   - Download: https://git-scm.com/
   - ✅ Check installation: `git --version`

4. **Code Editor** (Recommended: VS Code)
   - Download: https://code.visualstudio.com/

---

## 📁 Project Structure Overview

```
BookIT/
├── backend/                 # Django REST API
│   ├── bookit/             # Django project settings
│   ├── users/              # User management app
│   ├── venues/             # Venue management app
│   ├── bookings/           # Booking management app
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
├── .gitignore
├── README.md
└── [Documentation files]
```

---

## Part 1: Backend Setup (Django)

### Step 1: Navigate to Backend Folder

```bash
cd d:\PCCOE\Projects\BookIT\backend
```

### Step 2: Create Virtual Environment

**Windows PowerShell:**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows CMD:**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install Django, DRF, JWT, and other dependencies.

### Step 4: Create Django Project

```bash
django-admin startproject bookit .
```

**Note**: The `.` at the end creates the project in the current directory.

### Step 5: Create Django Apps

```bash
python manage.py startapp users
python manage.py startapp venues
python manage.py startapp bookings
```

### Step 6: Configure Django Settings

Open `bookit/settings.py` and make these changes:

#### 6.1: Add Apps to INSTALLED_APPS

Find `INSTALLED_APPS` and add:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'drf_yasg',
    
    # Local apps
    'users',
    'venues',
    'bookings',
]
```

#### 6.2: Add CORS Middleware

Find `MIDDLEWARE` and add `'corsheaders.middleware.CorsMiddleware',` at the top:

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this line
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

#### 6.3: Configure CORS

Add at the end of `settings.py`:

```python
# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True
```

#### 6.4: Configure REST Framework

Add at the end of `settings.py`:

```python
# Django REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

#### 6.5: Configure JWT

Add at the end of `settings.py`:

```python
# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
}
```

#### 6.6: Set Custom User Model

Add at the end of `settings.py`:

```python
# Custom User Model (we'll create this)
AUTH_USER_MODEL = 'users.User'
```

### Step 7: Create Custom User Model

Open `users/models.py` and replace with:

```python
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'super_admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
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
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
```

### Step 8: Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 9: Create Superuser

```bash
python manage.py createsuperuser
```

Enter:
- Email: your-email@example.com
- First name: Your Name
- Last name: Your Last Name
- Role: super_admin
- Password: (create a strong password)

### Step 10: Test Backend Server

```bash
python manage.py runserver
```

Visit http://localhost:8000/admin and login with superuser credentials.

**✅ Backend setup complete!**

---

## Part 2: Frontend Setup (React)

### Step 1: Open New Terminal

Keep backend running. Open a **NEW terminal window**.

### Step 2: Navigate to Frontend Folder

```bash
cd d:\PCCOE\Projects\BookIT\frontend
```

### Step 3: Install Node Dependencies

```bash
npm install
```

This will take 2-5 minutes to install all packages.

### Step 4: Create Required Files

#### 4.1: Create `public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="BookIT - Venue Management System for PCCOE" />
    <title>BookIT - PCCOE Venue Management</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

#### 4.2: Create `src/index.js`

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### 4.3: Create `src/App.js`

```javascript
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div>
          <h1>BookIT - Venue Management System</h1>
          <p>Frontend is running! ✅</p>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

#### 4.4: Create `.env` file

In the `frontend` folder, create `.env`:

```
REACT_APP_API_URL=http://localhost:8000/api/v1
```

### Step 5: Start Development Server

```bash
npm start
```

Browser should automatically open at http://localhost:3000

**✅ Frontend setup complete!**

---

## Part 3: Verify Setup

### Backend Check ✅
- [ ] Backend running at http://localhost:8000
- [ ] Can access admin at http://localhost:8000/admin
- [ ] Can login with superuser account
- [ ] No errors in terminal

### Frontend Check ✅
- [ ] Frontend running at http://localhost:3000
- [ ] Page loads with "BookIT" message
- [ ] No errors in browser console (F12)
- [ ] No errors in terminal

---

## Part 4: Git Setup

### Initialize Git Repository

```bash
# From BookIT root directory
cd d:\PCCOE\Projects\BookIT
git init
git add .
git commit -m "Initial project setup - Phase 1 structure"
```

### Create GitHub Repository (Optional)

1. Go to https://github.com/new
2. Create new repository named "BookIT"
3. Don't initialize with README (we already have one)
4. Copy the commands and run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/BookIT.git
git branch -M main
git push -u origin main
```

---

## Troubleshooting

### Python/Django Issues

**"python is not recognized"**
- Solution: Reinstall Python and check "Add to PATH" during installation

**"pip is not recognized"**
- Solution: `python -m pip install --upgrade pip`

**"No module named django"**
- Solution: Make sure virtual environment is activated, then `pip install -r requirements.txt`

**Migration errors**
- Solution: Delete `db.sqlite3` and all migration files (except `__init__.py`), then run migrations again

### Node/React Issues

**"npm is not recognized"**
- Solution: Reinstall Node.js from https://nodejs.org/

**"Port 3000 already in use"**
- Solution: Kill the process or use different port: `set PORT=3001 && npm start`

**Module not found errors**
- Solution: Delete `node_modules` and `package-lock.json`, then `npm install` again

### CORS Issues

**CORS errors in browser console**
- Solution: Make sure `corsheaders` is installed and configured in Django settings
- Check that frontend URL is in `CORS_ALLOWED_ORIGINS`

---

## Next Steps

Now that setup is complete, proceed to:

1. **Week 1 Development** - See DEVELOPMENT_PHASES.md
   - Create Venue and Booking models
   - Build API endpoints
   - Test with Postman

2. **Join Development** - Follow the weekly sprint plan
   - Backend first (Weeks 1-3)
   - Frontend next (Week 4)

---

## Quick Commands Reference

### Backend
```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows PowerShell

# Run server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test
```

---

## Support

If you encounter issues:
1. Check the error message carefully
2. Google the error
3. Check Django/React documentation
4. Ask for help with specific error messages

---

**Congratulations! 🎉 Your development environment is ready!**

Now you can start building the BookIT application following the DEVELOPMENT_PHASES.md guide.

---

*Last Updated: October 30, 2025*

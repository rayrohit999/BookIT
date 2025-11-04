# BookIT - Quick Start Guide

## 🚀 Run the Complete Application

### Step 1: Start Backend Server

```powershell
# Open Terminal 1
cd D:\PCCOE\Projects\BookIT\backend
D:/PCCOE/Projects/BookIT/backend/venv/Scripts/python.exe manage.py runserver
```

✅ Backend will run on: `http://127.0.0.1:8000`

### Step 2: Start Frontend Server

```powershell
# Open Terminal 2
cd D:\PCCOE\Projects\BookIT\frontend
npm start
```

✅ Frontend will run on: `http://localhost:3000`

---

## 🧪 Test the Application

### 1. Test Backend API

**Login Test:**
```powershell
$body = @{email='admin@gmail.com'; password='admin'} | ConvertTo-Json
Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/auth/login/' -Method POST -Body $body -ContentType 'application/json'
```

**Get Venues (Public):**
```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/venues/' -Method GET
```

### 2. Test Frontend

1. Open browser: `http://localhost:3000`
2. Click "Login"
3. Use credentials:
   - Email: `admin@gmail.com`
   - Password: `admin`
4. Browse venues
5. Create a booking (if logged in as HOD/Dean/Admin)

---

## 📍 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| Backend API | http://127.0.0.1:8000/api/ | REST API endpoints |
| Admin Panel | http://127.0.0.1:8000/admin/ | Django admin interface |

---

## 🔑 Test Accounts

### Super Admin
- **Email:** admin@gmail.com
- **Password:** admin
- **Can:** Manage everything

### HOD User
- **Email:** hod@example.com
- **Password:** test123
- **Can:** Create bookings, view own bookings

### Dean User
- **Email:** dean@example.com  
- **Password:** test123
- **Can:** Create bookings, view own bookings

### Hall Admin
- **Email:** halladmin@example.com
- **Password:** test123
- **Can:** View bookings for assigned venues

---

## 🎯 Quick Feature Tests

### Test 1: Browse Venues (No Login Required)
1. Go to `http://localhost:3000`
2. Click "Browse Venues"
3. View LRDC Hall and Seminar Hall

### Test 2: Login
1. Click "Login"
2. Enter: admin@gmail.com / admin
3. Should redirect to homepage

### Test 3: View Profile
1. Login first
2. Click "Profile" in navigation
3. See user details

### Test 4: Check Venue Details
1. Go to Venues page
2. Click "View Details & Book" on any venue
3. See capacity, location, facilities

### Test 5: API Check
```powershell
# Test login API
$body = '{\"email\":\"admin@gmail.com\",\"password\":\"admin\"}';
$response = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/auth/login/' -Method POST -Body $body -ContentType 'application/json';
$response.Content
```

---

## 🛠️ Troubleshooting

### Backend Not Starting?
```powershell
# Check if port 8000 is already in use
netstat -ano | findstr :8000

# If needed, kill the process
taskkill /PID <process_id> /F
```

### Frontend Not Starting?
```powershell
# Clear node modules and reinstall
cd D:\PCCOE\Projects\BookIT\frontend
Remove-Item -Recurse -Force node_modules
npm install
npm start
```

### Database Issues?
```powershell
cd D:\PCCOE\Projects\BookIT\backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### CORS Errors?
- Check backend `config/settings.py` has:
  ```python
  CORS_ALLOWED_ORIGINS = [
      'http://localhost:3000',
  ]
  ```

---

## 📚 Next Steps

### To Complete Frontend:
1. **Booking Creation Form** - Full date/time picker implementation
2. **My Bookings Page** - List with cancel functionality  
3. **Admin Dashboard** - Statistics and management
4. **Booking Calendar View** - Visual calendar interface

### To Enhance Backend:
1. **Email Notifications** - Send confirmation emails
2. **PDF Export** - Export booking details
3. **Advanced Filtering** - More search options
4. **Booking History** - Detailed logs

---

## 📖 Documentation Files

- `API_TESTING_GUIDE.md` - All 31 API endpoints documented
- `DATABASE_SCHEMA.md` - Database structure
- `DEVELOPMENT_STATUS.md` - Complete project summary
- `FEATURES.md` - Feature specifications
- `PROJECT_OVERVIEW.md` - System architecture

---

## ✨ Key Features Working

✅ User authentication with JWT
✅ Public venue browsing
✅ User registration  
✅ User profile view
✅ Venue listing with search
✅ Venue details page
✅ Role-based navigation
✅ Responsive design
✅ Protected routes
✅ Automatic token refresh

---

**Happy Coding! 🚀**

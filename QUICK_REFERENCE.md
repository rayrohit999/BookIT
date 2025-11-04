# BookIT - Quick Reference Card

## 🚀 Daily Development Workflow

### Starting Work
```bash
# Terminal 1 - Backend
cd d:\PCCOE\Projects\BookIT\backend
.\venv\Scripts\Activate.ps1
python manage.py runserver

# Terminal 2 - Frontend
cd d:\PCCOE\Projects\BookIT\frontend
npm start
```

---

## 📝 Common Commands

### Backend (Django)

#### Running Server
```bash
python manage.py runserver              # Start server
python manage.py runserver 8080         # Start on different port
```

#### Database
```bash
python manage.py makemigrations         # Create migrations
python manage.py migrate                # Apply migrations
python manage.py showmigrations         # Show migration status
python manage.py dbshell                # Open database shell
```

#### User Management
```bash
python manage.py createsuperuser        # Create admin user
python manage.py changepassword <email> # Change user password
```

#### Development
```bash
python manage.py shell                  # Python shell with Django
python manage.py test                   # Run tests
python manage.py check                  # Check for issues
```

#### Data Management
```bash
python manage.py dumpdata > backup.json # Backup database
python manage.py loaddata backup.json   # Restore database
python manage.py flush                  # Clear database (careful!)
```

### Frontend (React)

#### Development
```bash
npm start                               # Start dev server
npm run build                           # Build for production
npm test                                # Run tests
```

#### Package Management
```bash
npm install <package>                   # Install package
npm uninstall <package>                 # Remove package
npm update                              # Update packages
npm list                                # List installed packages
```

---

## 🗂️ File Organization

### Backend Files to Edit
```
backend/
├── bookit/settings.py          # Main configuration
├── bookit/urls.py              # URL routing
├── users/models.py             # User model
├── venues/models.py            # Venue model
├── bookings/models.py          # Booking model
├── users/serializers.py        # User API serializers
├── venues/serializers.py       # Venue API serializers
├── bookings/serializers.py     # Booking API serializers
├── users/views.py              # User API views
├── venues/views.py             # Venue API views
└── bookings/views.py           # Booking API views
```

### Frontend Files to Edit
```
frontend/src/
├── App.js                      # Main app component
├── components/                 # Reusable components
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ProtectedRoute.jsx
├── pages/                      # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── VenueList.jsx
│   └── CreateBooking.jsx
├── services/                   # API calls
│   ├── api.js
│   ├── authService.js
│   ├── venueService.js
│   └── bookingService.js
└── context/                    # State management
    └── AuthContext.jsx
```

---

## 🐛 Debugging Tips

### Backend Debugging
```python
# Add print statements
print(f"Debug: {variable}")

# Use Django debug toolbar (install first)
# See queries, templates, signals, etc.

# Check logs
# Errors appear in terminal running runserver

# Python debugger
import pdb; pdb.set_trace()
```

### Frontend Debugging
```javascript
// Console logging
console.log('Debug:', variable);

// React DevTools (Chrome Extension)
// Inspect component state and props

// Network tab (F12)
// Check API requests and responses

// Debugger
debugger;
```

---

## 📚 API Testing with Postman

### Setup
1. Download Postman: https://www.postman.com/downloads/
2. Create new collection "BookIT"
3. Set base URL: `http://localhost:8000/api/v1`

### Authentication Flow
```
1. POST /auth/login/
   Body: { "email": "...", "password": "..." }
   
2. Copy access token from response

3. Add to other requests:
   Header: Authorization: Bearer <access_token>
```

### Example Requests
```
GET    /venues/              # List all venues
POST   /venues/              # Create venue (admin only)
GET    /bookings/            # List bookings
POST   /bookings/            # Create booking
GET    /bookings/1/          # Get specific booking
PATCH  /bookings/1/          # Update booking
POST   /bookings/1/cancel/   # Cancel booking
```

---

## 🎨 UI Component Examples (Material-UI)

### Button
```jsx
import { Button } from '@mui/material';
<Button variant="contained" color="primary">Click Me</Button>
```

### Text Field
```jsx
import { TextField } from '@mui/material';
<TextField label="Email" variant="outlined" fullWidth />
```

### Card
```jsx
import { Card, CardContent } from '@mui/material';
<Card>
  <CardContent>Content here</CardContent>
</Card>
```

### Date Picker
```jsx
import { DatePicker } from '@mui/x-date-pickers';
<DatePicker label="Select Date" value={date} onChange={setDate} />
```

---

## 🔐 Authentication Pattern (Frontend)

```javascript
// Login
const login = async (email, password) => {
  const response = await axios.post('/auth/login/', { email, password });
  localStorage.setItem('accessToken', response.data.access);
  localStorage.setItem('refreshToken', response.data.refresh);
};

// Add token to requests
axios.defaults.headers.common['Authorization'] = 
  `Bearer ${localStorage.getItem('accessToken')}`;

// Logout
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};
```

---

## 📊 Common Django ORM Queries

```python
# Get all objects
Venue.objects.all()

# Filter objects
Venue.objects.filter(is_active=True)

# Get single object
Venue.objects.get(id=1)

# Create object
venue = Venue.objects.create(name="Hall A", capacity=100)

# Update object
venue.capacity = 150
venue.save()

# Delete object
venue.delete()

# Related objects
booking.venue  # Get related venue
venue.booking_set.all()  # Get all bookings for venue
```

---

## 🔍 Git Commands

```bash
# Check status
git status

# Add files
git add .
git add filename.py

# Commit changes
git commit -m "Add booking feature"

# Push to remote
git push origin main

# Pull from remote
git pull origin main

# Create branch
git checkout -b feature-name

# Switch branch
git checkout main

# View commit history
git log --oneline
```

---

## 📦 Package Installation

### Backend
```bash
# Activate virtual environment first!
pip install django-package-name
pip install -r requirements.txt    # Install all
pip freeze > requirements.txt      # Save current packages
```

### Frontend
```bash
npm install package-name
npm install --save-dev package-name  # Dev dependency
```

---

## 🆘 Emergency Fixes

### Backend Not Starting
```bash
# Check for errors
python manage.py check

# Reset database
python manage.py flush
python manage.py migrate

# Check migrations
python manage.py showmigrations
```

### Frontend Not Starting
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
netstat -ano | findstr :3000  # Windows
kill <PID>  # Kill process
```

### Database Issues
```bash
# Backup first!
python manage.py dumpdata > backup.json

# Delete db and migrations
# Keep __init__.py files
python manage.py makemigrations
python manage.py migrate

# Restore data
python manage.py loaddata backup.json
```

---

## 📈 Performance Tips

### Backend
- Use `select_related()` and `prefetch_related()` for queries
- Add database indexes on frequently queried fields
- Use pagination for large datasets
- Cache frequently accessed data

### Frontend
- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images
- Use production build for deployment

---

## 🎯 Testing Checklist

Before committing code:
- [ ] Backend server runs without errors
- [ ] Frontend builds without errors
- [ ] All API endpoints tested
- [ ] No console errors in browser
- [ ] Database migrations applied
- [ ] Code formatted properly
- [ ] Git commit with clear message

---

## 📞 Resources

- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- React Docs: https://react.dev/
- Material-UI: https://mui.com/
- MDN Web Docs: https://developer.mozilla.org/

---

**Keep this handy during development!** 📌

*Last Updated: October 30, 2025*

# BookIT - Venue Management System

**Pimpri Chinchwad College of Engineering (PCCOE)**

## 📚 Overview

BookIT is a modern venue management system designed to optimize hall utilization at PCCOE through time-slot based bookings. The system enables efficient booking, real-time availability tracking, and role-based access control for HODs, Deans, Hall Admins, and the public.

---

## ✨ Key Features

- 🕒 **Time-Slot Based Booking** - Book venues by specific time slots, not full days
- 📅 **Real-Time Calendar** - Public calendar showing all bookings and availability
- 👥 **Role-Based Access** - Different permissions for HODs, Deans, Hall Admins, and Super Admins
- 🚀 **Instant Booking** - No approval needed if slot is available
- 📊 **Analytics Dashboard** - Venue utilization reports and statistics
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔒 **Secure Authentication** - JWT-based authentication system

---

## 🏢 Venues

Initially supporting two major venues:
1. **LRDC Hall** - 4th Floor, Mechanical Building (150 capacity)
2. **Seminar Hall** - 5th Floor, Mechanical Building (250 capacity)

System designed to easily add more venues.

---

## 👤 User Roles

| Role | Permissions |
|------|------------|
| **Public/Guest** | View venues, calendar, and bookings (no login) |
| **HOD/Dean** | Create, edit, cancel own bookings + public permissions |
| **Hall Admin** | View bookings for assigned venues, dashboard access |
| **Super Admin** | Full system access, user management, venue management, analytics |

---

## 🛠️ Technology Stack

### Frontend
- **React.js 18+** - UI Framework
- **Material-UI (MUI)** - Component Library
- **React Router** - Navigation
- **Axios** - HTTP Client

### Backend
- **Django 4.2+** - Backend Framework
- **Django REST Framework** - API Development
- **SimpleJWT** - JWT Authentication
- **PostgreSQL** - Production Database
- **SQLite** - Development Database

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | **⭐ First time?** Complete setup instructions |
| [STARTUP_GUIDE.md](STARTUP_GUIDE.md) | **🚀 Start here daily!** How to start all servers |
| [NOTIFICATION_SYSTEM.md](NOTIFICATION_SYSTEM.md) | **📧 Email & Notifications** Complete system documentation |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Complete project details and problem statement |
| [FEATURES.md](FEATURES.md) | Detailed feature list by user role |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Database design and relationships |
| [API_ENDPOINTS.md](API_ENDPOINTS.md) | Complete API documentation |
| [DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md) | Phase-wise development roadmap |
| [TECH_STACK.md](TECH_STACK.md) | Technology decisions and justifications |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick reference for daily development |

---

## 🚀 Quick Start

### First Time Setup
**👉 Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete installation**

### Daily Development (Starting Servers)

**🎯 Automatic** (Recommended):
```powershell
# Run the startup script
.\start-servers.ps1
```
Choose option 1 for full stack (with async emails) or option 2 for simple mode.

**📖 Manual** (See [STARTUP_GUIDE.md](STARTUP_GUIDE.md)):
```powershell
# Terminal 1 - Redis (optional, for async emails)
cd C:\Users\Lenovo\Downloads\redis-x64-5.0.14.1
.\redis-server.exe

# Terminal 2 - Django Backend
cd backend
.\venv\Scripts\python.exe manage.py runserver

# Terminal 3 - Celery Worker (optional, for async emails)
cd backend
.\venv\Scripts\celery.exe -A config worker -l info --pool=solo

# Terminal 4 - React Frontend
cd frontend
npm start
```

**Access Your App**:
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:8000/api/
- 👤 Admin Panel: http://localhost:8000/admin/

---

## 📅 Development Timeline

- **Phase 1 (MVP)**: 3-4 weeks - Core booking functionality
- **Phase 2 (Enhanced)**: 2-3 weeks - Hall admin features, analytics
- **Phase 3 (Advanced)**: 2-3 weeks - Advanced features, deployment

**Total**: 7-10 weeks

---

## 🎯 Project Goals

1. ✅ Enable time-slot based venue booking
2. ✅ Improve venue utilization efficiency
3. ✅ Provide real-time availability information
4. ✅ Streamline booking process
5. ✅ Support 100+ concurrent users
6. ✅ Zero double-booking conflicts

---

## 📊 Success Metrics

- Multiple bookings per venue per day
- Booking process < 2 minutes
- Zero double-booking incidents
- 99.5% uptime
- Positive user feedback from HODs/Deans

---

## 🤝 Contributing

This is an internal college project. For suggestions or issues, please contact the development team.

---

## 📄 License

Internal project for Pimpri Chinchwad College of Engineering.

---

## 📞 Support

For technical support or feature requests, contact the IT department.

---

**Built with ❤️ for PCCOE**

*Version: 1.0.0 (In Development)*  
*Last Updated: October 30, 2025*

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
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Complete project details and problem statement |
| [FEATURES.md](FEATURES.md) | Detailed feature list by user role |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Database design and relationships |
| [API_ENDPOINTS.md](API_ENDPOINTS.md) | Complete API documentation |
| [DEVELOPMENT_PHASES.md](DEVELOPMENT_PHASES.md) | Phase-wise development roadmap |
| [TECH_STACK.md](TECH_STACK.md) | Technology decisions and justifications |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | **⭐ Start here!** Complete setup instructions |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick reference for daily development |

---

## 🚀 Quick Start

**👉 For complete setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

### Quick Setup (Summary)

1. **Install Prerequisites**: Python 3.10+, Node.js 18+, Git
2. **Backend Setup**:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1  # Windows PowerShell
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```
3. **Frontend Setup** (in new terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

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

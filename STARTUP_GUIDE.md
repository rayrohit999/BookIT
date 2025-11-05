# 🚀 BookIT - Server Startup Guide

This guide explains how to start all servers for the BookIT application.

---

## 📋 Prerequisites

- Python 3.13 installed
- Node.js installed
- Redis server downloaded (for Windows: https://github.com/tporadowski/redis/releases)
- Virtual environment set up in `backend/venv/`

---

## 🔧 Option 1: Full Stack with Async Emails (Recommended)

Start all 4 servers in this order:

### 1️⃣ Redis Server (Terminal 1)
**Location**: Redis installation folder (e.g., `C:\Users\Lenovo\Downloads\redis-x64-5.0.14.1\`)

```powershell
# Navigate to Redis folder
cd C:\Users\Lenovo\Downloads\redis-x64-5.0.14.1

# Start Redis
.\redis-server.exe
```

**Expected Output**:
```
Redis is starting oO0OoO0OoO0Oo
Redis version=5.0.14.1
Port: 6379
Ready to accept connections
```

---

### 2️⃣ Django Backend Server (Terminal 2)
**Location**: `D:\PCCOE\Projects\BookIT\backend`

```powershell
# Navigate to backend
cd D:\PCCOE\Projects\BookIT\backend

# Start Django with venv Python
.\venv\Scripts\python.exe manage.py runserver
```

**Expected Output**:
```
Django version 4.2.7, using settings 'config.settings'
Starting development server at http://127.0.0.1:8000/
```

---

### 3️⃣ Celery Worker (Terminal 3)
**Location**: `D:\PCCOE\Projects\BookIT\backend`

```powershell
# Navigate to backend
cd D:\PCCOE\Projects\BookIT\backend

# Start Celery worker with --pool=solo (required for Windows)
.\venv\Scripts\celery.exe -A config worker -l info --pool=solo
```

**Expected Output**:
```
celery@DESKTOP-VEFHM27 v5.5.3
Connected to redis://localhost:6379/0
[tasks]
  . send_booking_cancellation_async
  . send_booking_confirmation_async
  . send_hall_admin_notification_async
  . send_welcome_email_async
  . booking_system.tasks.send_booking_reminders
  . booking_system.tasks.auto_cancel_unconfirmed_bookings
  . booking_system.tasks.expire_old_waitlist_notifications
  . booking_system.tasks.notify_waitlist_users
celery@DESKTOP-VEFHM27 ready.
```

---

### 4️⃣ Celery Beat (Terminal 4) 🆕
**Location**: `D:\PCCOE\Projects\BookIT\backend`

**⚡ NEW**: Required for auto-cancellation & waitlist features!

```powershell
# Navigate to backend
cd D:\PCCOE\Projects\BookIT\backend

# Start Celery Beat scheduler
.\venv\Scripts\celery.exe -A config beat -l info
```

**Expected Output**:
```
celery beat v5.5.3 (Opalescent) is starting.
LocalTime -> 2025-11-05 10:00:00
Configuration ->
    . broker -> redis://localhost:6379/0
    . loader -> celery.loaders.app.AppLoader
    . scheduler -> django_celery_beat.schedulers.DatabaseScheduler
    
Scheduler: Sending due task send-booking-reminders (every hour)
Scheduler: Sending due task auto-cancel-unconfirmed (every 30 mins)
Scheduler: Sending due task expire-old-waitlist-notifications (every 5 mins)
```

**What Celery Beat Does**:
- 📧 Sends reminder emails 24 hours before events
- ⏰ Auto-cancels unconfirmed bookings 2 hours before events
- 📋 Processes waitlist notifications (15-min claim window)

---

### 5️⃣ React Frontend (Terminal 5)
**Location**: `D:\PCCOE\Projects\BookIT\frontend`

```powershell
# Navigate to frontend
cd D:\PCCOE\Projects\BookIT\frontend

# Start React development server
npm start
```

**Expected Output**:
```
Compiled successfully!
Local:            http://localhost:3000
```

---

## 🔧 Option 2: Without Celery (Simpler, Slower Emails)

If you don't want to use Redis/Celery, the system will automatically fall back to synchronous emails.

### Start only 2 servers:

#### 1️⃣ Django Backend (Terminal 1)
```powershell
cd D:\PCCOE\Projects\BookIT\backend
.\venv\Scripts\python.exe manage.py runserver
```

#### 2️⃣ React Frontend (Terminal 2)
```powershell
cd D:\PCCOE\Projects\BookIT\frontend
npm start
```

**Note**: Emails will be sent synchronously (slight delay when creating bookings), but the system will work perfectly.

---

## 🎯 Quick Start Commands (Copy & Paste)

### For PowerShell - All 5 Servers (Full Stack with Auto-Cancel):

**Terminal 1 - Redis:**
```powershell
cd C:\Users\Lenovo\Downloads\redis-x64-5.0.14.1 ; .\redis-server.exe
```

**Terminal 2 - Django:**
```powershell
cd D:\PCCOE\Projects\BookIT\backend ; .\venv\Scripts\python.exe manage.py runserver
```

**Terminal 3 - Celery Worker:**
```powershell
cd D:\PCCOE\Projects\BookIT\backend ; .\venv\Scripts\celery.exe -A config worker -l info --pool=solo
```

**Terminal 4 - Celery Beat (NEW):**
```powershell
cd D:\PCCOE\Projects\BookIT\backend ; .\venv\Scripts\celery.exe -A config beat -l info
```

**Terminal 5 - React:**
```powershell
cd D:\PCCOE\Projects\BookIT\frontend ; npm start
```

---

## 🛑 Stopping Servers

Press `Ctrl + C` in each terminal to stop the respective server.

---

## ✅ Verification Checklist

After starting all servers, verify:

- [ ] Redis: Shows "Ready to accept connections"
- [ ] Django: Accessible at http://127.0.0.1:8000/
- [ ] Celery: Shows "celery@... ready" with 4 tasks listed
- [ ] React: Opens browser at http://localhost:3000/

---

## 🐛 Troubleshooting

### Redis not starting?
- Make sure no other Redis instance is running
- Check if port 6379 is available: `netstat -an | findstr 6379`

### Django errors?
- Verify virtual environment: `.\venv\Scripts\python.exe --version`
- Check database: `.\venv\Scripts\python.exe manage.py migrate`

### Celery not connecting?
- Ensure Redis is running first
- Use `--pool=solo` flag (required for Windows)
- Check Redis connection: `redis-cli ping` (should return "PONG")

### Frontend not starting?
- Install dependencies: `npm install`
- Check Node version: `node --version` (should be 14+)

---

## 📊 What Each Server Does

| Server | Purpose | Port | Required? |
|--------|---------|------|-----------|
| **Redis** | Message broker for async tasks | 6379 | Optional* |
| **Django** | Backend API & database | 8000 | ✅ Yes |
| **Celery** | Background email processing | N/A | Optional* |
| **React** | Frontend UI | 3000 | ✅ Yes |

*System works without Redis/Celery but emails will be slower

---

## 💡 Pro Tips

1. **Start Redis first** - Celery needs it to connect
2. **Keep terminals open** - Each server needs its own terminal
3. **Check logs** - Watch Celery terminal to see emails being sent
4. **Use VS Code** - Open integrated terminals for easy management
5. **Bookmark this file** - You'll use it every time you start development!

---

## 🎓 Understanding the Flow

```
User creates booking → Django API receives request
                    ↓
              Booking saved to DB (instant ⚡)
                    ↓
         In-app notification created (instant ⚡)
                    ↓
    Email task queued in Redis → Celery picks up task
                                        ↓
                                Email sent in background 📧
```

---

## 📝 Development Workflow

**Morning startup:**
```powershell
# Terminal 1
cd C:\Users\Lenovo\Downloads\redis-x64-5.0.14.1 ; .\redis-server.exe

# Terminal 2  
cd D:\PCCOE\Projects\BookIT\backend ; .\venv\Scripts\python.exe manage.py runserver

# Terminal 3
cd D:\PCCOE\Projects\BookIT\backend ; .\venv\Scripts\celery.exe -A config worker -l info --pool=solo

# Terminal 4
cd D:\PCCOE\Projects\BookIT\frontend ; npm start
```

**After code changes:**
- Django: Auto-reloads (no restart needed)
- React: Auto-reloads (no restart needed)  
- Celery: Press `Ctrl+C` and restart if you change task functions
- Redis: No restart needed

---

## 🔗 Useful Links

- Django Admin: http://127.0.0.1:8000/admin/
- API Root: http://127.0.0.1:8000/api/
- React App: http://localhost:3000/
- API Documentation: See `API_ENDPOINTS.md`

---

**Last Updated**: November 5, 2025  
**Version**: 1.0 with Async Email System

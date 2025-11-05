# BookIT - Quick Start Script for PowerShell
# This script helps you start all servers quickly

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   BookIT Server Startup Assistant" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$REDIS_PATH = "C:\Users\Lenovo\Downloads\redis-x64-5.0.14.1"
$BACKEND_PATH = "D:\PCCOE\Projects\BookIT\backend"
$FRONTEND_PATH = "D:\PCCOE\Projects\BookIT\frontend"

Write-Host "Choose startup option:" -ForegroundColor Yellow
Write-Host "1. Full Stack (Redis + Django + Celery + React) - Async emails" -ForegroundColor Green
Write-Host "2. Simple Stack (Django + React only) - Sync emails" -ForegroundColor Green
Write-Host "3. Backend Only (Django + Celery)" -ForegroundColor Green
Write-Host "4. Frontend Only (React)" -ForegroundColor Green
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`nStarting Full Stack..." -ForegroundColor Cyan
        Write-Host "`nIMPORTANT: This will open 4 new terminal windows." -ForegroundColor Yellow
        Write-Host "Keep all windows open while developing!`n" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        # Start Redis
        Write-Host "[1/4] Starting Redis Server..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$REDIS_PATH' ; .\redis-server.exe"
        Start-Sleep -Seconds 2
        
        # Start Django
        Write-Host "[2/4] Starting Django Backend..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACKEND_PATH' ; .\venv\Scripts\python.exe manage.py runserver"
        Start-Sleep -Seconds 3
        
        # Start Celery
        Write-Host "[3/4] Starting Celery Worker..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACKEND_PATH' ; .\venv\Scripts\celery.exe -A config worker -l info --pool=solo"
        Start-Sleep -Seconds 3
        
        # Start React
        Write-Host "[4/4] Starting React Frontend..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FRONTEND_PATH' ; npm start"
        
        Write-Host "`n✅ All servers starting!" -ForegroundColor Green
        Write-Host "Wait for all windows to finish loading...`n" -ForegroundColor Yellow
        Write-Host "Access your app at: http://localhost:3000" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host "`nStarting Simple Stack..." -ForegroundColor Cyan
        Write-Host "Note: Emails will be sent synchronously (slight delay)`n" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        # Start Django
        Write-Host "[1/2] Starting Django Backend..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACKEND_PATH' ; .\venv\Scripts\python.exe manage.py runserver"
        Start-Sleep -Seconds 3
        
        # Start React
        Write-Host "[2/2] Starting React Frontend..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FRONTEND_PATH' ; npm start"
        
        Write-Host "`n✅ Servers starting!" -ForegroundColor Green
        Write-Host "Access your app at: http://localhost:3000" -ForegroundColor Cyan
    }
    
    "3" {
        Write-Host "`nStarting Backend Only..." -ForegroundColor Cyan
        Start-Sleep -Seconds 1
        
        # Start Redis
        Write-Host "[1/3] Starting Redis Server..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$REDIS_PATH' ; .\redis-server.exe"
        Start-Sleep -Seconds 2
        
        # Start Django
        Write-Host "[2/3] Starting Django Backend..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACKEND_PATH' ; .\venv\Scripts\python.exe manage.py runserver"
        Start-Sleep -Seconds 3
        
        # Start Celery
        Write-Host "[3/3] Starting Celery Worker..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BACKEND_PATH' ; .\venv\Scripts\celery.exe -A config worker -l info --pool=solo"
        
        Write-Host "`n✅ Backend servers starting!" -ForegroundColor Green
        Write-Host "API available at: http://127.0.0.1:8000/api/" -ForegroundColor Cyan
    }
    
    "4" {
        Write-Host "`nStarting Frontend Only..." -ForegroundColor Cyan
        Write-Host "Make sure backend is already running!`n" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FRONTEND_PATH' ; npm start"
        
        Write-Host "`n✅ Frontend starting!" -ForegroundColor Green
        Write-Host "Access your app at: http://localhost:3000" -ForegroundColor Cyan
    }
    
    default {
        Write-Host "`n❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit
    }
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "Press Ctrl+C in each terminal window to stop servers" -ForegroundColor Yellow
Write-Host "See STARTUP_GUIDE.md for detailed documentation" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "`nPress any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

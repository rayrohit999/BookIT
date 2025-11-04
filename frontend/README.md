# BookIT Frontend

React frontend for BookIT Venue Management System.

## Setup Instructions

### 1. Install Node.js

Download and install Node.js 18+ from: https://nodejs.org/

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm start
```

Application will open at: http://localhost:3000

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── public/              # Static files
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/      # Reusable React components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ...
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── VenueList.jsx
│   │   ├── VenueCalendar.jsx
│   │   ├── CreateBooking.jsx
│   │   ├── MyBookings.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── ...
│   ├── services/        # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── venueService.js
│   │   └── bookingService.js
│   ├── context/         # React Context for state management
│   │   └── AuthContext.jsx
│   ├── utils/           # Utility functions
│   │   ├── constants.js
│   │   ├── dateUtils.js
│   │   └── validators.js
│   ├── App.js           # Main app component
│   ├── index.js         # Entry point
│   └── App.css          # Global styles
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (not recommended)

## Environment Variables

Create `.env` file in frontend folder:

```
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## Key Technologies

- **React 18** - UI Framework
- **React Router 6** - Routing
- **Material-UI (MUI)** - Component Library
- **Axios** - HTTP Client
- **date-fns** - Date Utilities
- **React Big Calendar** - Calendar Component

## API Integration

All API calls go through the service layer in `src/services/`.

Backend API should be running at: http://localhost:8000

## Notes

- Make sure backend is running before starting frontend
- Port 3000 will be used by default
- API calls are proxied to backend (see package.json proxy setting)

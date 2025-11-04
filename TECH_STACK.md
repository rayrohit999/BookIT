# BookIT - Technology Stack

## Stack Overview

**Architecture**: Separated Frontend + Backend (REST API)  
**Development Approach**: API-First Development  
**Database Strategy**: SQLite (Development) → PostgreSQL (Production)

---

## Technology Stack Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React.js 18+ (UI Framework)                     │  │
│  │  - React Router (Navigation)                     │  │
│  │  - Material-UI (Component Library)               │  │
│  │  - Axios (HTTP Client)                           │  │
│  │  - Context API (State Management)                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ ↑ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│                    SERVER SIDE                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Django 4.2+ (Backend Framework)                 │  │
│  │  - Django REST Framework (API)                   │  │
│  │  - SimpleJWT (Authentication)                    │  │
│  │  - Django CORS Headers (Cross-Origin)            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         ↓ ↑ ORM
┌─────────────────────────────────────────────────────────┐
│                    DATABASE                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  SQLite (Development)                            │  │
│  │  PostgreSQL (Production)                         │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Frontend Stack

### 1. React.js 18+
**Role**: UI Framework

**Why React?**
- ✅ Component-based architecture (reusable components)
- ✅ Virtual DOM for fast rendering
- ✅ Large community and ecosystem
- ✅ Excellent developer tools
- ✅ Easy to learn and maintain
- ✅ Perfect for building interactive UIs
- ✅ Great documentation

**Alternatives Considered:**
- Vue.js: Good but smaller ecosystem
- Angular: Too complex for this project size
- Vanilla JS: Too time-consuming

---

### 2. React Router v6
**Role**: Client-side routing

**Why React Router?**
- ✅ Standard routing library for React
- ✅ Declarative routing
- ✅ Nested routes support
- ✅ Protected routes for authentication
- ✅ URL parameters and query strings

**Usage:**
```javascript
<Route path="/venues" element={<VenueList />} />
<Route path="/bookings" element={<ProtectedRoute><CreateBooking /></ProtectedRoute>} />
```

---

### 3. Material-UI (MUI) v5
**Role**: UI Component Library

**Why Material-UI?**
- ✅ Pre-built, production-ready components
- ✅ Responsive by default
- ✅ Consistent design language
- ✅ Customizable theming
- ✅ Excellent documentation
- ✅ Accessibility built-in
- ✅ Saves development time (weeks!)

**Components We'll Use:**
- AppBar, Drawer (Navigation)
- Card, Grid, Box (Layout)
- TextField, Select, DatePicker (Forms)
- Button, IconButton (Actions)
- Table, DataGrid (Lists)
- Dialog, Snackbar (Modals, Notifications)
- Calendar components

**Alternatives Considered:**
- Ant Design: Good but heavier
- Chakra UI: Less mature
- Bootstrap: Less React-friendly
- Custom CSS: Too time-consuming

---

### 4. Axios
**Role**: HTTP Client

**Why Axios?**
- ✅ Promise-based HTTP requests
- ✅ Automatic JSON transformation
- ✅ Request/response interceptors (for JWT)
- ✅ Better error handling than fetch
- ✅ Request cancellation support

**Usage:**
```javascript
axios.get('/api/v1/venues/')
axios.post('/api/v1/bookings/', data, {
  headers: { Authorization: `Bearer ${token}` }
})
```

**Alternatives Considered:**
- Fetch API: Less features, more boilerplate
- jQuery AJAX: Outdated

---

### 5. Context API + useReducer
**Role**: State Management

**Why Context API?**
- ✅ Built into React (no extra dependencies)
- ✅ Perfect for authentication state
- ✅ Sufficient for our app's complexity
- ✅ Easy to understand and implement

**What We'll Store:**
- User authentication state
- User profile data
- JWT tokens
- Global app settings

**Alternatives Considered:**
- Redux: Overkill for this project
- MobX: Unnecessary complexity
- Zustand: Not needed for our size

---

### 6. Date-fns or Day.js
**Role**: Date manipulation

**Why Date-fns?**
- ✅ Lightweight (only import what you need)
- ✅ Immutable date operations
- ✅ Easy to use
- ✅ Tree-shakeable

**Usage:**
- Format dates for display
- Parse dates from API
- Date calculations (is past, is future, etc.)

**Alternatives Considered:**
- Moment.js: Too heavy, no longer maintained
- Native Date: Limited functionality

---

## Backend Stack

### 1. Django 4.2+
**Role**: Backend Framework

**Why Django?**
- ✅ Batteries-included framework
- ✅ Excellent ORM for database operations
- ✅ Built-in admin panel (bonus!)
- ✅ Security features built-in (CSRF, XSS protection)
- ✅ Mature and stable
- ✅ Great documentation
- ✅ Large community support
- ✅ You chose it! 😊

**Features We'll Use:**
- ORM for database
- Admin panel for quick data management
- Authentication system
- Middleware for CORS
- Management commands
- Migration system

**Alternatives Considered:**
- Flask: Too minimal, need more features
- FastAPI: Great but less mature than Django
- Express.js: Different language (Node.js)

---

### 2. Django REST Framework (DRF)
**Role**: Building REST APIs

**Why DRF?**
- ✅ Industry standard for Django APIs
- ✅ Serializers for data validation
- ✅ ViewSets for clean code
- ✅ Built-in pagination, filtering, search
- ✅ Browsable API (great for testing!)
- ✅ Authentication classes
- ✅ Permission classes

**Components:**
```python
# Serializers for data transformation
class VenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venue
        fields = '__all__'

# ViewSets for CRUD operations
class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
```

---

### 3. SimpleJWT (djangorestframework-simplejwt)
**Role**: JWT Authentication

**Why SimpleJWT?**
- ✅ Token-based authentication (stateless)
- ✅ Access + Refresh token pattern
- ✅ Secure and scalable
- ✅ Easy integration with DRF
- ✅ Customizable token lifetime
- ✅ Token blacklisting support

**How It Works:**
1. User logs in → receives access + refresh token
2. Access token used for API requests (24h expiry)
3. Refresh token used to get new access token (7 days expiry)
4. Logout blacklists refresh token

**Alternatives Considered:**
- Session authentication: Not ideal for separate frontend
- OAuth: Too complex for internal system
- Basic Auth: Not secure enough

---

### 4. Django CORS Headers
**Role**: Enable cross-origin requests

**Why CORS Headers?**
- ✅ Frontend and backend on different ports/domains
- ✅ Security: Control which origins can access API
- ✅ Easy configuration

**Configuration:**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "https://bookit.pccoe.edu",  # Production
]
```

---

### 5. Pillow
**Role**: Image processing (for venue photos)

**Why Pillow?**
- ✅ Standard Python imaging library
- ✅ Resize and optimize uploaded images
- ✅ Generate thumbnails
- ✅ Image validation

---

## Database

### Development: SQLite
**Role**: Development database

**Why SQLite?**
- ✅ Zero configuration
- ✅ File-based (easy to backup)
- ✅ Perfect for development
- ✅ Fast for small datasets
- ✅ Built into Python

**Limitations:**
- ❌ Not suitable for production (concurrent writes)
- ❌ Limited scalability

---

### Production: PostgreSQL
**Role**: Production database

**Why PostgreSQL?**
- ✅ Enterprise-grade reliability
- ✅ Excellent performance
- ✅ ACID compliant
- ✅ Advanced features (JSON fields, full-text search)
- ✅ Great Django support
- ✅ Handles concurrent connections
- ✅ Free and open-source

**Features We'll Use:**
- Complex queries with JOINs
- Transaction support
- Indexes for performance
- Foreign key constraints
- Check constraints

**Alternatives Considered:**
- MySQL: Good but PostgreSQL is better for Django
- MongoDB: NoSQL not needed, adds complexity
- Oracle: Expensive, overkill

---

## Development Tools

### 1. Git + GitHub
**Role**: Version control

**Why Git?**
- ✅ Track code changes
- ✅ Collaborate with team (if any)
- ✅ Backup code in cloud
- ✅ Branch for features
- ✅ Industry standard

---

### 2. VS Code
**Role**: Code Editor

**Recommended Extensions:**
- Python
- ES7+ React/Redux/React-Native snippets
- Prettier (code formatting)
- ESLint (JavaScript linting)
- Python Linter
- GitLens

---

### 3. Postman
**Role**: API testing

**Why Postman?**
- ✅ Test API endpoints before frontend
- ✅ Save requests in collections
- ✅ Test authentication flow
- ✅ Share with team

**Alternative:**
- Thunder Client (VS Code extension)

---

### 4. Chrome DevTools
**Role**: Frontend debugging

**Features:**
- React DevTools extension
- Network tab for API calls
- Console for JavaScript errors
- Performance profiling

---

## Additional Libraries

### Backend
```python
# requirements.txt
Django==4.2.7
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.0
Pillow==10.1.0
python-decouple==3.8  # Environment variables
psycopg2-binary==2.9.9  # PostgreSQL adapter
```

### Frontend
```json
// package.json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "@mui/material": "^5.14.18",
    "@mui/icons-material": "^5.14.18",
    "@mui/x-date-pickers": "^6.18.3",
    "axios": "^1.6.2",
    "date-fns": "^2.30.0"
  }
}
```

---

## Deployment Stack (Future)

### Backend Hosting Options
1. **Railway** (Recommended)
   - Easy Django deployment
   - Free tier available
   - PostgreSQL included
   - Auto-deploy from Git

2. **Render**
   - Similar to Railway
   - Good free tier

3. **DigitalOcean App Platform**
   - $5/month
   - More control

4. **Heroku**
   - Classic choice
   - Paid plans only

### Frontend Hosting Options
1. **Vercel** (Recommended)
   - Perfect for React
   - Free tier
   - Auto-deploy from Git
   - CDN included

2. **Netlify**
   - Similar to Vercel
   - Great for static sites

3. **GitHub Pages**
   - Free
   - Limited features

### Database Hosting
- Included with Railway/Render
- Or: **ElephantSQL** (managed PostgreSQL)
- Or: **Supabase** (PostgreSQL with extras)

---

## Why This Stack?

### ✅ Advantages

1. **Separation of Concerns**
   - Frontend and backend independent
   - Can scale separately
   - Can be deployed separately

2. **Modern & Industry Standard**
   - Skills are transferable
   - Large communities for support
   - Plenty of tutorials available

3. **Developer-Friendly**
   - Good documentation
   - Great developer experience
   - Fast iteration

4. **Production-Ready**
   - Proven technologies
   - Used by major companies
   - Scalable

5. **Cost-Effective**
   - All tools are free/open-source
   - Free hosting tiers available

6. **Future-Proof**
   - Easy to add features
   - Easy to add mobile app later (same API)
   - Easy to integrate with other systems

### ⚠️ Considerations

1. **Learning Curve**
   - Need to learn both React and Django
   - Mitigation: Start with backend, then frontend

2. **More Complex Than Monolith**
   - Two separate codebases
   - Mitigation: Good project structure

3. **CORS Setup**
   - Need to configure properly
   - Mitigation: Django CORS Headers makes it easy

---

## Development Environment Setup

### System Requirements
- **OS**: Windows 10/11, macOS, or Linux
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 10GB free space
- **Internet**: For downloading packages

### Software to Install
1. **Python 3.10+**: https://www.python.org/downloads/
2. **Node.js 18+**: https://nodejs.org/
3. **Git**: https://git-scm.com/
4. **VS Code**: https://code.visualstudio.com/
5. **PostgreSQL** (for production later): https://www.postgresql.org/

---

## Architecture Principles

### 1. RESTful API Design
- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Use meaningful URLs (/api/v1/venues/, not /getVenues)
- Return proper status codes
- Consistent response format

### 2. Security
- JWT for authentication
- HTTPS in production
- Password hashing (bcrypt)
- Input validation
- CSRF protection
- SQL injection prevention (ORM handles this)

### 3. Scalability
- Stateless API (JWT, not sessions)
- Database indexing
- Pagination for large datasets
- Caching (future enhancement)

### 4. Maintainability
- Clean code structure
- Comments for complex logic
- Consistent naming conventions
- Separate concerns (models, views, serializers)

---

## Conclusion

This technology stack is:
- ✅ Modern and industry-standard
- ✅ Well-documented and supported
- ✅ Scalable and maintainable
- ✅ Perfect for your requirements
- ✅ Free and open-source

You'll learn valuable skills while building a production-ready application!

---

*Last Updated: October 30, 2025*

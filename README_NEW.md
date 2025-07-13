# 🎓 EduKnit Learn - Complete Learning Management System

A production-ready, full-stack Learning Management System with comprehensive course management, student analytics, quiz system, and administrative capabilities. Built with modern technologies for scalability and performance.

## 📋 **PROJECT OVERVIEW**

**EduKnit Learn** is a sophisticated Learning Management System that provides:
- 🎯 **Complete Course Management** with enrollment and progress tracking
- 📊 **Advanced Analytics** with real-time dashboards and insights
- 🧠 **Interactive Quiz System** with automated grading and performance analytics
- 👨‍💼 **Comprehensive Admin Panel** with full system management
- 🔒 **Enterprise-Grade Security** with JWT authentication and role-based access
- 📱 **Responsive Design** optimized for all devices and platforms

## ✨ **KEY FEATURES**

### 🔐 **Authentication & Security System**
- **JWT Authentication** with access & refresh tokens
- **Role-Based Access Control** (Admin, Student, User, Visitor)
- **HTTP-Only Cookie Security** for token storage
- **Email Verification** system for new registrations
- **Password Reset/Recovery** with secure token validation
- **Account Lockout Protection** after failed login attempts
- **Rate Limiting** and comprehensive security headers
- **Input Validation** with express-validator and Zod schemas

### 👥 **User Management System**
- **User Registration & Login** with email verification
- **Profile Management** with avatar upload capabilities
- **Admin User CRUD Operations** (Create, Read, Update, Delete)
- **Account Status Management** (Active, Inactive, Suspended)
- **Password Change Functionality** with validation
- **User Statistics & Analytics** for administrators

### 📚 **Course Management System**
- **Course Enrollment System** with automated tracking
- **Course Progress Tracking** with real-time updates
- **Module & Lesson Management** with hierarchical structure
- **Course Completion Tracking** with certificates
- **Dynamic Course Mapping** and slug-based routing
- **Admin Course CRUD Operations** with validation
- **Course Analytics** and performance metrics

### 🎯 **Quiz & Assessment System**
- **Interactive Quiz Creation** with multiple question types
- **Real-Time Quiz Taking** with timer functionality
- **Automated Scoring & Grading** with pass/fail logic
- **Quiz Analytics for Admins** with performance insights
- **Student Quiz History** and attempt tracking
- **Question Analytics** with accuracy metrics
- **Retry Logic** and attempt limitations

### 📊 **Analytics & Dashboard System**
- **Student Learning Analytics** with comprehensive metrics
- **Progress Tracking Charts** with visual representations
- **Category Performance Analysis** across different subjects
- **Quiz Performance Analytics** with detailed insights
- **Learning Streaks & Gamification** elements
- **Admin Dashboard Analytics** with system overview
- **Time-Based Progress Reports** and trends

### 👨‍💼 **Admin Management System**
- **Admin Dashboard** with system statistics
- **User Management Interface** with role assignments
- **Course Creation & Management** tools
- **Quiz Management System** with analytics
- **System Monitoring** with health checks
- **Enrollment Management** with status tracking
- **Analytics Dashboard** for platform insights

## 🛠️ **TECHNOLOGY STACK**

### **Backend Technologies**
- **Node.js 18+** with Express.js framework
- **TypeScript** for type safety and better development experience
- **MongoDB** with Mongoose ODM for data persistence
- **JWT** for secure authentication and authorization
- **Winston** for structured logging and monitoring
- **Helmet** for security headers and protection
- **Express Rate Limit** for API protection and throttling
- **Multer** for file uploads and media management
- **Nodemailer** for email services and notifications

### **Frontend Technologies**
- **React 18** with modern hooks and functional components
- **TypeScript** for type safety and enhanced development
- **Vite** for lightning-fast builds and hot module replacement
- **Tailwind CSS** for utility-first styling and responsive design
- **Shadcn/ui** for consistent and accessible UI components
- **React Router DOM** for client-side routing and navigation
- **React Query (TanStack Query)** for server state management
- **React Hook Form** for form handling and validation
- **Recharts** for data visualization and analytics charts

### **Database & Infrastructure**
- **MongoDB** with comprehensive indexing and optimization
- **Mongoose** with schema validation and middleware
- **Winston Logging** for structured application logs
- **Swagger/OpenAPI** for comprehensive API documentation
- **Docker** support for containerized deployments
- **Environment Configuration** for different deployment stages

## 📁 **PROJECT STRUCTURE**

```
eduknit-learn/
├── 📂 backend/                          # Backend API Server
│   ├── 📂 src/
│   │   ├── 📂 config/                   # Configuration files
│   │   │   ├── db.ts                    # Database connection
│   │   │   ├── logger.ts                # Winston logging setup
│   │   │   ├── swagger.ts               # API documentation
│   │   │   └── jwt.ts                   # JWT configuration
│   │   ├── 📂 controllers/              # Request handlers
│   │   │   ├── authController.ts        # Authentication logic
│   │   │   ├── userController.ts        # User management
│   │   │   ├── courseController.ts      # Course operations
│   │   │   ├── quizController.ts        # Quiz system
│   │   │   ├── analyticsController.ts   # Analytics data
│   │   │   └── adminController.ts       # Admin operations
│   │   ├── 📂 middleware/               # Express middleware
│   │   │   ├── auth.ts                  # Authentication middleware
│   │   │   ├── validation.ts            # Input validation
│   │   │   ├── security.ts              # Security headers
│   │   │   └── roles.ts                 # Role-based access
│   │   ├── 📂 models/                   # Database schemas
│   │   │   ├── User.ts                  # User model
│   │   │   ├── Programme.ts             # Course model
│   │   │   ├── Enrollment.ts            # Enrollment tracking
│   │   │   ├── Quiz.ts                  # Quiz model
│   │   │   └── StudentProfile.ts        # Student profiles
│   │   ├── 📂 routes/                   # API route definitions
│   │   │   ├── auth.ts                  # Authentication routes
│   │   │   ├── user.ts                  # User routes
│   │   │   ├── course.ts                # Course routes
│   │   │   ├── quiz.ts                  # Quiz routes
│   │   │   └── admin.ts                 # Admin routes
│   │   ├── 📂 services/                 # Business logic
│   │   │   ├── emailService.ts          # Email functionality
│   │   │   ├── analyticsService.ts      # Analytics processing
│   │   │   └── realtimeSyncService.ts   # Real-time updates
│   │   ├── 📂 utils/                    # Utility functions
│   │   │   ├── jwt.ts                   # JWT utilities
│   │   │   ├── response.ts              # Response formatting
│   │   │   └── errors.ts                # Error handling
│   │   └── index.ts                     # Application entry point
│   ├── 📂 logs/                         # Application logs
│   ├── 📂 uploads/                      # File uploads
│   ├── package.json                     # Backend dependencies
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── .env.example                     # Environment template
│   └── Dockerfile                       # Docker configuration
├── 📂 frontend/                         # React Frontend Application
│   ├── 📂 src/
│   │   ├── 📂 components/               # Reusable components
│   │   │   ├── 📂 auth/                 # Authentication components
│   │   │   ├── 📂 dashboard/            # Dashboard components
│   │   │   ├── 📂 admin/                # Admin components
│   │   │   ├── 📂 layout/               # Layout components
│   │   │   └── 📂 ui/                   # UI library components
│   │   ├── 📂 pages/                    # Page components
│   │   │   ├── 📂 admin/                # Admin pages
│   │   │   ├── 📂 courses/              # Course pages
│   │   │   ├── 📂 dashboard/            # Dashboard pages
│   │   │   ├── StudentDashboardPage.tsx # Student dashboard
│   │   │   ├── StudentAnalyticsPage.tsx # Analytics page
│   │   │   ├── AdminDashboardPage.tsx   # Admin dashboard
│   │   │   └── StudentQuizPage.tsx      # Quiz interface
│   │   ├── 📂 hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts               # Authentication hook
│   │   │   ├── useStudentProfile.ts     # Student data hook
│   │   │   └── useCourseProgress.ts     # Progress tracking
│   │   ├── 📂 services/                 # API service layers
│   │   │   ├── api.ts                   # Base API configuration
│   │   │   ├── authService.ts           # Authentication API
│   │   │   ├── courseService.ts         # Course API
│   │   │   └── analyticsService.ts      # Analytics API
│   │   ├── 📂 contexts/                 # React contexts
│   │   │   └── AuthContext.tsx          # Authentication context
│   │   ├── 📂 types/                    # TypeScript type definitions
│   │   │   └── api.ts                   # API response types
│   │   └── App.tsx                      # Main application component
│   ├── 📂 public/                       # Static assets
│   ├── package.json                     # Frontend dependencies
│   ├── vite.config.ts                   # Vite configuration
│   ├── tailwind.config.ts               # Tailwind CSS configuration
│   └── .env.example                     # Environment template
├── 📂 docs/                            # Documentation files
├── package.json                        # Root package.json
├── docker-compose.yml                  # Docker compose configuration
└── README.md                           # This file
```

## 🚀 **COMPLETE SETUP GUIDE**

### **📋 Prerequisites**

Before setting up the project, ensure you have the following installed:

- **Node.js 18 or higher** ([Download here](https://nodejs.org/))
- **MongoDB 6.0 or higher** ([Download here](https://www.mongodb.com/try/download/community))
- **Git** ([Download here](https://git-scm.com/downloads))
- **A code editor** (VS Code recommended)

### **⬇️ Step 1: Clone the Repository**

```bash
# Clone the repository to your local machine
git clone https://github.com/Iammilansoni/eduknit-learn.git

# Navigate to the project directory
cd eduknit-learn
```

### **🗄️ Step 2: Database Setup**

#### **Option A: Local MongoDB Installation**

1. **Install MongoDB Community Edition**
   - Download from [MongoDB Downloads](https://www.mongodb.com/try/download/community)
   - Follow the installation guide for your operating system
   - Start MongoDB service:
     ```bash
     # Windows (if installed as service)
     net start MongoDB
     
     # macOS (with Homebrew)
     brew services start mongodb/brew/mongodb-community
     
     # Linux
     sudo systemctl start mongod
     ```

2. **Verify MongoDB is running**
   ```bash
   # Connect to MongoDB shell
   mongosh
   
   # You should see a connection message
   # Type 'exit' to quit the shell
   ```

#### **Option B: MongoDB Atlas (Cloud)**

1. **Create a free MongoDB Atlas account** at [MongoDB Atlas](https://cloud.mongodb.com/)
2. **Create a new cluster** (free tier available)
3. **Create a database user** with read/write permissions
4. **Get your connection string** from the "Connect" button
5. **Whitelist your IP address** or use `0.0.0.0/0` for development

### **⚙️ Step 3: Backend Setup**

```bash
# Navigate to the backend directory
cd backend

# Install all backend dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

#### **🔧 Configure Backend Environment Variables**

Edit the `.env` file in the backend directory with your configurations:

```env
# ===========================================
# SERVER CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=5000

# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# For Local MongoDB
MONGODB_URI=mongodb://localhost:27017/eduknit_learn

# For MongoDB Atlas (replace with your connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduknit_learn?retryWrites=true&w=majority

# ===========================================
# JWT AUTHENTICATION CONFIGURATION
# ===========================================
# Generate secure secrets using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=19f93c2522885fa75ec8193d1834684d147e8120c4fa8ea70c1cba704d883c958459e4aade772d5467fea8847f905f3e7ffeedc3fffe972097dc2780ee1d27d0
JWT_REFRESH_SECRET=fa260bc51e732dc2c8fbb002698ad5c28d9b4aaf772ecccb385fc531c2808fdd18221cdda0c2f165bc5e9e0163c6a5d1c8ca481f420677c762c30c2e51a70142
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# ===========================================
# FRONTEND CONFIGURATION
# ===========================================
FRONTEND_URL=http://localhost:5173

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
BCRYPT_ROUNDS=12

# ===========================================
# EMAIL SERVICE CONFIGURATION
# ===========================================
# For Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# For development (optional - uses console logging)
# EMAIL_SERVICE=console

# ===========================================
# LOGGING CONFIGURATION
# ===========================================
LOG_LEVEL=info

# ===========================================
# RATE LIMITING CONFIGURATION
# ===========================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **🚀 Start the Backend Server**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build && npm start
```

**✅ Backend Success Indicators:**
- Server running on port 5000
- MongoDB connection established
- API documentation available at `http://localhost:5000/api-docs`

### **🎨 Step 4: Frontend Setup**

Open a **new terminal window** and navigate to the frontend:

```bash
# Navigate to the frontend directory
cd frontend

# Install all frontend dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

#### **🔧 Configure Frontend Environment Variables**

Edit the `.env` file in the frontend directory:

```env
# ===========================================
# API CONFIGURATION
# ===========================================
VITE_API_URL=http://localhost:5000/api

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
VITE_APP_NAME=EduKnit Learn
VITE_APP_VERSION=1.0.0

# ===========================================
# FEATURE FLAGS
# ===========================================
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=true

# ===========================================
# DEVELOPMENT CONFIGURATION
# ===========================================
VITE_DEV_TOOLS=true
```

#### **🚀 Start the Frontend Application**

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**✅ Frontend Success Indicators:**
- Application running on `http://localhost:5173`
- No console errors in browser developer tools
- Login page loads successfully

### **📊 Step 5: Initialize System Data**

#### **🗃️ Setup Sample Courses and Data**

```bash
# Navigate to backend directory
cd backend

# Run the complete system setup (creates courses, modules, lessons)
node final-lms-setup.js

# Create demo admin and student accounts
node create-demo-credentials-new.js
```

**This will create:**
- ✅ 6 complete courses with modules and lessons
- ✅ Sample analytics data
- ✅ Demo user accounts
- ✅ Course enrollment data

### **👤 Step 6: Demo User Accounts**

After running the setup scripts, you can login with these demo accounts:

#### **🔑 Admin Account**
- **Email:** `admin@eduknit.com`
- **Password:** `admin123`
- **Access:** Full system administration, course management, user management, analytics

#### **🎓 Student Account**
- **Email:** `student@test.com`
- **Password:** `student123`
- **Access:** Student dashboard, course enrollment, progress tracking, quiz taking

### **🧪 Step 7: Verify Installation**

#### **✅ Backend Verification**

Test the following endpoints in your browser or with curl:

```bash
# Health check
curl http://localhost:5000/api/health

# API documentation
http://localhost:5000/api-docs

# Courses endpoint
curl http://localhost:5000/api/courses
```

#### **✅ Frontend Verification**

1. **Open your browser** and navigate to `http://localhost:5173`
2. **Login with admin credentials** to access the admin dashboard
3. **Test course management** by creating or editing a course
4. **Login with student credentials** to access the student dashboard
5. **Test course enrollment** and progress tracking

#### **✅ Complete System Test**

```bash
# Navigate to the root directory
cd ..

# Run the complete system test (optional)
node test-complete-system.js
```

This will test:
- Authentication system
- Course management
- Enrollment process
- Quiz functionality
- Analytics system
- Admin operations

## 🔒 **SECURITY FEATURES**

### **🛡️ Authentication Security**
- **JWT Token Security** with HTTP-only cookies and secure headers
- **Refresh Token Rotation** for enhanced security
- **Password Hashing** using bcrypt with configurable salt rounds
- **Account Lockout** after failed login attempts
- **Email Verification** required for new accounts
- **Password Reset** with secure token validation and expiration

### **🔐 Authorization & Access Control**
- **Role-Based Access Control (RBAC)** with granular permissions
- **Route Protection** with middleware validation
- **API Endpoint Security** with authentication requirements
- **Cross-Origin Resource Sharing (CORS)** protection
- **Rate Limiting** to prevent brute force attacks
- **Input Validation** and sanitization on all endpoints

### **🔍 Security Headers & Protection**
- **Helmet.js** for security headers (XSS, CSRF, etc.)
- **Content Security Policy (CSP)** implementation
- **HTTP Strict Transport Security (HSTS)**
- **X-Frame-Options** for clickjacking protection
- **X-Content-Type-Options** for MIME type sniffing prevention

## 📱 **USER INTERFACES & FEATURES**

### **🎓 Student Dashboard**
- **Personal Learning Dashboard** with progress overview and analytics
- **Course Catalog** with search, filtering, and enrollment capabilities
- **Interactive Learning Interface** with lessons, videos, and materials
- **Quiz & Assessment System** with real-time feedback and scoring
- **Progress Analytics** with detailed charts and performance insights
- **Profile Management** with avatar upload and personal settings
- **Achievement System** with badges, points, and certification tracking
- **Calendar Integration** for deadlines, sessions, and reminders
- **Community Features** with Discord integration and peer interaction

### **👨‍💼 Admin Dashboard**
- **System Overview Dashboard** with platform analytics and key metrics
- **User Management** with CRUD operations, role assignments, and bulk actions
- **Course Management** with content creation, editing, and publication tools
- **Quiz Administration** with question banks, grading, and analytics
- **Analytics & Reporting** with comprehensive insights and data visualization
- **System Monitoring** with health checks, logs, and performance metrics
- **Enrollment Management** with status tracking and bulk operations
- **Settings Configuration** with platform customization and feature toggles

### **📊 Analytics & Reporting**
- **Real-Time Dashboards** for students and administrators
- **Progress Tracking** with visual charts and trend analysis
- **Performance Metrics** for courses, quizzes, and user engagement
- **Learning Analytics** with completion rates and time tracking
- **Quiz Analytics** with question performance and student insights
- **System Health Monitoring** with uptime and performance metrics

## 🚀 **DEPLOYMENT GUIDE**

### **☁️ Production Deployment Options**

#### **Option 1: Vercel + MongoDB Atlas (Recommended)**

**Frontend Deployment (Vercel):**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# VITE_API_URL=https://your-backend-domain.com/api
```

**Backend Deployment (Railway/Render/Heroku):**
```bash
# Build the backend
cd backend
npm run build

# Deploy using your preferred platform
# Set production environment variables (see below)
```

#### **Option 2: Docker Deployment**

```bash
# Build and run with Docker Compose
docker-compose up --build -d

# Or build individually
cd backend
docker build -t eduknit-backend .
docker run -p 5000:5000 --env-file .env eduknit-backend

cd ../frontend
docker build -t eduknit-frontend .
docker run -p 5173:5173 eduknit-frontend
```

### **🌍 Production Environment Variables**

#### **Backend Production Configuration**
```env
# Production Environment
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduknit_learn?retryWrites=true&w=majority

# JWT Secrets (Generate new ones for production!)
JWT_SECRET=your-production-jwt-secret-64-chars-minimum
JWT_REFRESH_SECRET=your-production-refresh-secret-64-chars-minimum

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Email Service (Production SMTP)
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your-production-email@domain.com
SMTP_PASS=your-smtp-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **Frontend Production Configuration**
```env
# Production API URL
VITE_API_URL=https://your-backend-domain.com/api

# App Configuration
VITE_APP_NAME=EduKnit Learn
VITE_APP_VERSION=1.0.0

# Production Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
```

## 🛠️ **DEVELOPMENT GUIDE**

### **📝 Available Scripts**

#### **Backend Scripts**
```bash
npm run dev          # Start development server with auto-reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run lint         # Run ESLint for code quality
npm run lint:fix     # Fix ESLint issues automatically
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report

# Utility Scripts
npm run create-admin    # Create admin user
npm run create-demo     # Create demo users
npm run validate-jwt    # Validate JWT configuration
npm run manage-users    # User management CLI
```

#### **Frontend Scripts**
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality
npm run type-check   # TypeScript type checking
```

### **🧪 Testing**

#### **Backend Testing**
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts

# Run tests in watch mode
npm run test:watch
```

#### **Frontend Testing**
```bash
# Run component tests
npm test

# Run E2E tests (if configured)
npm run test:e2e
```

### **📚 API Documentation**

**Swagger Documentation:** `http://localhost:5000/api-docs`

#### **Key API Endpoints**

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

**User Management:**
- `GET /api/user` - Get all users (Admin)
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user (Admin)
- `GET /api/user/courses` - Get user's enrolled courses

**Course Management:**
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/course/student/enroll` - Enroll in course
- `GET /api/course/student/progress/:id` - Get course progress

**Quiz System:**
- `GET /api/quiz/lesson/:id` - Get quiz for lesson
- `POST /api/quiz/lesson/:id/submit` - Submit quiz answers
- `GET /api/quiz/lesson/:id/analytics` - Get quiz analytics (Admin)

**Analytics:**
- `GET /api/analytics/student` - Get student analytics
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/progress-history` - Get progress history

## 🔧 **TROUBLESHOOTING**

### **🚨 Common Issues & Solutions**

#### **❌ "Cannot connect to MongoDB"**
**Solutions:**
1. **Check MongoDB is running:**
   ```bash
   # Check MongoDB status
   mongosh --eval "db.adminCommand('ping')"
   ```
2. **Verify connection string in .env file**
3. **For MongoDB Atlas:** Check IP whitelist and credentials

#### **❌ "JWT Secret not configured"**
**Solution:**
```bash
# Generate secure secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

#### **❌ "Port 5000 already in use"**
**Solutions:**
1. **Change port in backend .env:**
   ```env
   PORT=5001
   ```
2. **Update frontend proxy in vite.config.ts:**
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:5001',
     }
   }
   ```

#### **❌ "Frontend cannot connect to backend"**
**Solutions:**
1. **Check CORS configuration in backend**
2. **Verify VITE_API_URL in frontend .env**
3. **Ensure both servers are running**

#### **❌ "Email verification not working"**
**Solutions:**
1. **Configure SMTP settings in backend .env**
2. **For Gmail:** Use App Password, not regular password
3. **Check spam folder for verification emails**

### **📞 Support & Help**

#### **💬 Getting Help**
1. **Check the logs:** Backend logs are in `backend/logs/`
2. **Review API documentation:** `http://localhost:5000/api-docs`
3. **Run system tests:** `node test-complete-system.js`
4. **Check environment variables:** Ensure all required variables are set

#### **🐛 Reporting Issues**
When reporting issues, please include:
- Operating system and version
- Node.js version (`node --version`)
- MongoDB version
- Error messages and logs
- Steps to reproduce the issue

## 📊 **SYSTEM REQUIREMENTS**

### **💻 Minimum Requirements**
- **Operating System:** Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js:** Version 18.0 or higher
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **Network:** Internet connection for MongoDB Atlas and package installation

### **🎯 Recommended Specifications**
- **CPU:** Multi-core processor (4+ cores)
- **RAM:** 16GB for optimal development experience
- **Storage:** SSD with 10GB+ free space
- **Network:** Broadband internet connection

## 🎉 **CONCLUSION**

**EduKnit Learn** is now ready for your use! This comprehensive Learning Management System provides:

✅ **Complete Learning Platform** - Course management, progress tracking, and student analytics  
✅ **Advanced Quiz System** - Interactive assessments with automated grading  
✅ **Professional Admin Panel** - Full system management and analytics  
✅ **Modern Tech Stack** - React, Node.js, TypeScript, MongoDB  
✅ **Production Ready** - Security, performance, and scalability built-in  
✅ **Mobile Responsive** - Works perfectly on all devices  

**The system is ready for immediate deployment and can support hundreds of concurrent users with the current architecture.**

---

**🏆 Built with excellence by the EduKnit Development Team**  
**📧 Support:** support@eduknit.com  
**🌐 Website:** www.eduknit.com

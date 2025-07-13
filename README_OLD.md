# 🎓 EduKnit Learn - Complete Learning Management System

A production-ready, full-stack Learning Management System with comprehensive course management, student analytics, quiz system, and administrative capabilities. Built with modern technologies for scalability and performance.

## 📋 **PROJECT OVERVIEW**

**EduKnit Learn** is a sophisticated Learning Management System that provides:
- 🎯 **Complete Course Management** with enrollment and progress tracking
- 📊 **Advanced Analytics** with real-time dashboards and insights
- 🧠 **Interactive Quiz System** with automated grading and performance analytics
- 👨‍💼 **Comprehensive Admin Panel** with full system management
- 🔒 **Enterprise-Grade Security** with JWT authentication and role-based access
- � **Responsive Design** optimized for all devices and platforms

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
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Clone and navigate to backend**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp env.example .env
```

4. **Configure environment variables**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eduknit_learn

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Security
BCRYPT_ROUNDS=12

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

5. **Start development server**
```bash
npm run dev
```

### Frontend Setup

1. **Navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp env.example .env
```

4. **Configure environment variables**
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=EduKnit Learn
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
```

5. **Start development server**
```bash
npm run dev
```

## 🧪 Testing the Application

### Demo Credentials

The application includes demo credentials for testing:

- **Admin**: `admin@eduknit.com` / `Admin123!`
- **User**: `user@eduknit.com` / `User123!`
- **Visitor**: `visitor@eduknit.com` / `Visitor123!`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### User Management (Admin Only)
- `GET /api/user` - Get all users
- `GET /api/user/stats` - Get user statistics
- `GET /api/user/:id` - Get user by ID
- `PUT /api/user/:id` - Update user
- `DELETE /api/user/:id` - Delete user
- `PATCH /api/user/:id/enrollment-status` - Update enrollment status
- `POST /api/user/change-password` - Change password

## 🔒 Security Features

- **JWT Tokens**: Secure authentication with access and refresh tokens
- **HTTP-Only Cookies**: Prevents XSS attacks on token storage
- **Password Hashing**: Bcrypt with configurable rounds
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: Prevents brute force attacks
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Helmet.js for additional security
- **Role-Based Access**: Granular permission system

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)

1. **Build the application**
```bash
npm run build
```

2. **Set environment variables** in your deployment platform
3. **Configure MongoDB** (use MongoDB Atlas for production)
4. **Deploy** using your preferred platform

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
```bash
npm run build
```

2. **Set environment variables** in your deployment platform
3. **Configure the API URL** to point to your deployed backend
4. **Deploy** using your preferred platform

### Environment Variables for Production

#### Backend (.env)
```env
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
FRONTEND_URL=https://your-frontend-domain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_ENABLE_DEBUG_MODE=false
```

## 📝 API Documentation

### Authentication Flow

1. **Registration**: User registers with email, password, and profile info
2. **Login**: User logs in and receives access + refresh tokens
3. **Token Refresh**: Automatic token refresh using refresh token
4. **Logout**: Invalidates refresh token and clears cookies

### Role-Based Access

- **Admin**: Full access to user management and system statistics
- **User**: Access to personal dashboard and profile management
- **Visitor**: Limited access with upgrade prompts

## 🛠️ Development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Quality

- **TypeScript**: Full type safety across the application
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (configured in VS Code)
- **Git Hooks**: Pre-commit hooks for code quality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

- [ ] Email verification system
- [ ] Google OAuth integration
- [ ] Course management system
- [ ] Progress tracking
- [ ] Certificate generation
- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced analytics dashboard

---

**Built with ❤️ by the EduKnit Team** 
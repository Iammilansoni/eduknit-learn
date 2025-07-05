# EduKnit Learn - Student Management Dashboard

A full-stack, production-ready Student Management Dashboard with JWT authentication, role-based access control (RBAC), and a modern React + Node.js architecture.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT Authentication** with access and refresh tokens
- **Role-Based Access Control** (Admin, User, Visitor)
- **HTTP-Only Cookies** for secure token storage
- **Password Hashing** with bcrypt
- **Input Validation** with express-validator and Zod
- **Rate Limiting** and security headers with Helmet
- **CORS Configuration** for cross-origin requests

### 👥 User Management
- **User Registration** with email verification
- **Profile Management** with avatar support
- **Password Reset** functionality
- **Account Status Management** (Active, Inactive, Suspended)
- **Admin User Management** with CRUD operations

### 📊 Dashboard Features
- **Admin Dashboard**: User management, statistics, and system overview
- **User Dashboard**: Personal profile, course progress, and learning analytics
- **Visitor Dashboard**: Limited access with upgrade prompts
- **Real-time Statistics** and user analytics

### 🛠️ Technical Stack

#### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Winston** for logging
- **Morgan** for HTTP request logging
- **Helmet** for security headers
- **Express Rate Limit** for API protection

#### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router DOM** for routing
- **React Hook Form** with Zod validation
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Axios** for API communication
- **React Query** for data fetching

## 📁 Project Structure

```
EduKnit_Learn/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── logger.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── userController.ts
│   │   ├── middleware/
│   │   │   ├── security.ts
│   │   │   └── validation.ts
│   │   ├── models/
│   │   │   └── User.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── user.ts
│   │   ├── utils/
│   │   │   └── jwt.ts
│   │   └── index.ts
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   └── ui/
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── UserDashboardPage.tsx
│   │   │   ├── VisitorPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── RegisterPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── App.tsx
│   ├── package.json
│   └── env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites
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
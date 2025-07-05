# EduKnit Learn Backend API

A production-ready, scalable backend system for the EduKnit Learn Student Dashboard built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with refresh tokens
  - Role-based access control (Admin, User, Visitor)
  - Account lockout after failed login attempts
  - Email verification system
  - Password reset functionality

- **Security**
  - Helmet.js for security headers
  - CORS configuration
  - Rate limiting (different limits for different endpoints)
  - Input validation and sanitization
  - Password hashing with bcrypt
  - HTTP-only cookies for token storage

- **API Design**
  - RESTful API design
  - Standardized response format
  - Comprehensive error handling
  - API documentation with Swagger/OpenAPI
  - Health check endpoints

- **Database**
  - MongoDB with Mongoose ODM
  - Optimized database indexing
  - Data validation and sanitization

- **Email Service**
  - Transactional email support
  - Password reset emails
  - Email verification
  - Welcome emails

- **Testing**
  - Comprehensive test suite with Jest
  - Integration tests with Supertest
  - Mocked external services
  - Test coverage reporting

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EduKnit_Learn/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/eduknit_learn

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_EXPIRES_IN=1h
   JWT_REFRESH_EXPIRES_IN=7d

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB (if not already running)
   mongod
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/api/health`

## 🔐 Authentication Endpoints

### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

### Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "NewSecurePassword123!"
}
```

## 👥 User Management Endpoints

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access-token>
```

### Update User Profile
```http
PUT /api/user/:id
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith"
}
```

### Change Password
```http
POST /api/user/change-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

## 🏥 Health Check Endpoints

### Basic Health Check
```http
GET /api/health
```

### Detailed Health Check
```http
GET /api/health/detailed
```

### Kubernetes Readiness Probe
```http
GET /api/health/ready
```

### Kubernetes Liveness Probe
```http
GET /api/health/live
```

## 🔒 Security Features

### Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **Password Reset**: 3 attempts per hour per email

### Account Lockout
- Accounts are locked after 5 failed login attempts
- Lock duration: 2 hours
- Automatic unlock after lock period expires

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 🧪 Testing

The project includes comprehensive tests:

### Unit Tests
- Authentication logic
- User model methods
- Utility functions
- Error handling

### Integration Tests
- API endpoints
- Database operations
- Email service integration
- Authentication flow

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 📦 Project Structure

```
src/
├── config/           # Configuration files
│   ├── db.ts        # Database configuration
│   ├── jwt.ts       # JWT configuration
│   ├── logger.ts    # Winston logger setup
│   └── swagger.ts   # Swagger documentation
├── controllers/     # Route controllers
│   ├── authController.ts
│   └── userController.ts
├── middleware/      # Express middleware
│   ├── auth.ts      # Authentication middleware
│   ├── roles.ts     # Role-based authorization
│   ├── security.ts  # Security middleware
│   └── validation.ts # Input validation
├── models/          # Database models
│   └── User.ts      # User model
├── routes/          # API routes
│   ├── auth.ts      # Authentication routes
│   ├── health.ts    # Health check routes
│   └── user.ts      # User management routes
├── services/        # Business logic services
│   └── emailService.ts # Email service
├── utils/           # Utility functions
│   ├── errors.ts    # Custom error classes
│   ├── jwt.ts       # JWT utilities
│   └── response.ts  # Response utilities
├── tests/           # Test files
│   ├── setup.ts     # Test setup
│   ├── auth.test.ts # Authentication tests
│   └── __mocks__/   # Mock files
└── index.ts         # Application entry point
```

## 🚀 Deployment

### Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t eduknit-backend .
   ```

2. **Run the container**
   ```bash
   docker run -p 5000:5000 --env-file .env eduknit-backend
   ```

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db:27017/eduknit_learn
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FRONTEND_URL=https://your-frontend-domain.com
```

### Environment-Specific Configurations

#### Development
- Detailed error messages
- Unsecure cookies
- Verbose logging

#### Production
- Minimal error details
- Secure cookies
- Optimized logging
- Rate limiting enabled

## 📊 Monitoring & Logging

### Logging
- Winston logger for structured logging
- Different log levels (error, warn, info, debug)
- File and console output
- Request logging with Morgan

### Health Monitoring
- Database connectivity checks
- Email service health checks
- System resource monitoring
- Kubernetes-ready health endpoints

## 🔧 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Database
npm run create-admin # Create admin user
npm run create-demo  # Create demo user

# JWT
npm run validate-jwt # Validate JWT configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@eduknit.com or create an issue in the repository.

## 🔄 API Versioning

The API follows semantic versioning. Current version: v1.0.0

### Breaking Changes
- Major version updates may include breaking changes
- Deprecated endpoints will be announced in advance
- Migration guides will be provided for major updates

## 🔐 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are stored in HTTP-only cookies
- Rate limiting prevents brute force attacks
- Input validation prevents injection attacks
- CORS is configured for security
- Helmet.js provides security headers

## 📈 Performance

- Database queries are optimized with indexes
- Connection pooling for database connections
- Rate limiting prevents abuse
- Efficient error handling
- Minimal response payloads

---

**Built with ❤️ by the EduKnit Team** 
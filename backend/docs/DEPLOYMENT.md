# EduKnit Learn - Deployment Guide

## Architecture Overview
- **Frontend**: React/Vite → Vercel
- **Backend**: Node.js/Express → Vercel
- **Database**: MongoDB → MongoDB Atlas
- **Email**: EmailJS/SendGrid → Cloud service

## Deployment Steps

### 1. Database (MongoDB Atlas)
- [ ] Create MongoDB Atlas account
- [ ] Create cluster and database
- [ ] Set up database user and network access
- [ ] Get connection string

### 2. Backend (Vercel)
- [ ] Push code to GitHub
- [ ] Connect Vercel to repository
- [ ] Configure environment variables
- [ ] Deploy and test

### 3. Frontend (Vercel)
- [ ] Configure API URL for production
- [ ] Deploy to Vercel
- [ ] Configure custom domain (optional)

## Environment Variables Needed

### Backend (.env)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
BCRYPT_ROUNDS=12
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.vercel.app/api
```

## Post-Deployment Testing
- [ ] User registration
- [ ] Email verification
- [ ] Login/logout
- [ ] Role-based access control
- [ ] Dashboard functionality

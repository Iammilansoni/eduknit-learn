# EduKnit Learn - Deployment Guide

## Architecture Overview
- **Frontend**: React/Vite → Vercel
- **Backend**: Node.js/Express → Vercel
- **Database**: MongoDB → MongoDB Atlas
- **Email**: SMTP Gmail → Production Email Service

## Deployment Steps

### 1. Database (MongoDB Atlas)
- [ ] Create MongoDB Atlas account at https://cloud.mongodb.com
- [ ] Create a new cluster (M0 Free tier is sufficient for development)
- [ ] Create database user with read/write permissions
- [ ] Configure network access (allow from anywhere: 0.0.0.0/0 for Vercel)
- [ ] Get connection string

### 2. Backend (Vercel)
- [ ] Push code to GitHub
- [ ] Connect Vercel to repository
- [ ] Set Root Directory to `backend`
- [ ] Configure environment variables (see below)
- [ ] Deploy and test

### 3. Frontend (Vercel)
- [ ] Deploy frontend to Vercel (separate project)
- [ ] Set Root Directory to `frontend`
- [ ] Configure API URL environment variable
- [ ] Test complete application

## Environment Variables for Vercel

### Backend Environment Variables
Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://eduknit-admin:<Milansoni1>@cluster0.62smya8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=19f93c2522885fa75ec8193d1834684d147e8120c4fa8ea70c1cba704d883c958459e4aade772d5467fea8847f905f3e7ffeedc3fffe972097dc2780ee1d27d0
JWT_REFRESH_SECRET=fa260bc51e732dc2c8fbb002698ad5c28d9b4aaf772ecccb385fc531c2808fdd18221cdda0c2f165bc5e9e0163c6a5d1c8ca481f420677c762c30c2e51a70142
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=HS256
JWT_ISSUER=eduknit-learn
JWT_AUDIENCE=eduknit-learn-users
FRONTEND_URL=https://your-frontend-domain.vercel.app
BCRYPT_ROUNDS=12
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sonimilan77393@gmail.com
SMTP_PASS=sdla xhcg szbz tzky
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
```

### Frontend Environment Variables
Add these in Vercel Dashboard → Frontend Project → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-domain.vercel.app/api
```

## Important Notes

### MongoDB Atlas Setup
1. **Cluster Creation**: Choose AWS/Google Cloud (closest to your users)
2. **Database User**: Create user with `readWrite` permissions
3. **Network Access**: Add `0.0.0.0/0` (allow from anywhere) for Vercel
4. **Connection String**: Replace `<username>`, `<password>`, and `<cluster>` in:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/eduknit_learn?retryWrites=true&w=majority
   ```

### Vercel Deployment Settings
- **Framework Preset**: Other
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

### Security Considerations
- **JWT Secrets**: Already strong (64-character hex strings)
- **Email Password**: Use App-specific password for Gmail
- **CORS**: Frontend URL will be automatically configured
- **HTTPS**: Vercel provides SSL certificates automatically

## Post-Deployment Testing Checklist

### Backend API Testing
- [ ] Health check: `GET /api/health`
- [ ] User registration: `POST /api/auth/register`
- [ ] Email verification: `POST /api/auth/verify-email`
- [ ] Login: `POST /api/auth/login`
- [ ] Protected routes: `GET /api/user` (with auth)

### Frontend Testing
- [ ] Home page loads
- [ ] User registration flow
- [ ] Email verification flow
- [ ] Login/logout functionality
- [ ] Role-based dashboard access
- [ ] Admin user management (if admin)

### Full Integration Testing
- [ ] Complete user journey: Register → Verify → Login → Dashboard
- [ ] Admin functions: Create, edit, delete, suspend users
- [ ] Email notifications working
- [ ] Cross-origin requests working (CORS)
- [ ] Session persistence

## Troubleshooting

### Common Issues
1. **TypeScript Compilation Errors**: Fixed with proper type casting in JWT config
2. **CORS Errors**: Ensure `FRONTEND_URL` matches your frontend domain exactly
3. **Database Connection**: Verify MongoDB Atlas network access and credentials
4. **Email Issues**: Check Gmail app password and SMTP settings
5. **JWT Errors**: Ensure all JWT environment variables are set

### Deployment URLs
- **Backend**: `https://your-backend.vercel.app`
- **Frontend**: `https://your-frontend.vercel.app`
- **Database**: MongoDB Atlas cluster

## Production User Setup

After successful deployment, create your admin user:

1. Use the production setup script (if available)
2. Or manually create via MongoDB Atlas interface
3. Or use the `/api/auth/register` endpoint with role: 'admin'

## Maintenance

- Monitor Vercel function logs for errors
- Monitor MongoDB Atlas performance
- Update dependencies regularly
- Backup MongoDB data periodically
- Monitor email delivery rates

---

**Ready for Production!** 🚀

Your EduKnit Learn application is now fully deployed with:
- ✅ Secure authentication & authorization
- ✅ Complete user management
- ✅ Email verification system
- ✅ Role-based access control
- ✅ Admin dashboard functionality

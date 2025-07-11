# 🚀 EduKnit LMS - Startup Troubleshooting Guide

## Why the startup script might not work:

### 🔍 **Run Diagnostics First**
1. Double-click `diagnose-system.bat`
2. This will check all prerequisites and identify issues

### 🔧 **Common Issues & Solutions**

#### 1. **Node.js Not Installed**
- **Error**: "Node.js is not installed or not in PATH"
- **Solution**: Install Node.js from https://nodejs.org/

#### 2. **MongoDB Not Running**
- **Error**: "Database setup failed" or "MongoDB connection failed"
- **Solutions**:
  - Start MongoDB service: `net start MongoDB`
  - Or install MongoDB Community Server
  - Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env

#### 3. **Dependencies Not Installed**
- **Error**: "Cannot find module" errors
- **Solution**: Install dependencies manually:
  ```bash
  # Backend
  cd c:\Users\milan\OneDrive\Desktop\eduknit-learn\backend
  npm install
  
  # Frontend  
  cd c:\Users\milan\OneDrive\Desktop\eduknit-learn\frontend
  npm install
  ```

#### 4. **Ports Already in Use**
- **Error**: "Port 5000/5173 already in use"
- **Solutions**:
  - Kill existing processes: `taskkill /f /im node.exe`
  - Or use different ports in package.json

#### 5. **Environment Variables Missing**
- **Error**: Database connection issues
- **Solution**: Create `.env` file in backend folder:
  ```
  MONGODB_URI=mongodb://localhost:27017/eduknit-learn
  PORT=5000
  JWT_SECRET=your-secret-key
  NODE_ENV=development
  ```

### 🏃‍♂️ **Manual Startup (If Script Fails)**

**Terminal 1 - Backend:**
```bash
cd c:\Users\milan\OneDrive\Desktop\eduknit-learn\backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\milan\OneDrive\Desktop\eduknit-learn\frontend  
npm run dev
```

**Terminal 3 - Database Setup (one-time):**
```bash
cd c:\Users\milan\OneDrive\Desktop\eduknit-learn\backend
node final-lms-setup.js
```

### 🎯 **Quick Test**
Once running, test these URLs:
- Backend API: http://localhost:5000/api/health
- Frontend: http://localhost:5173
- Programs: http://localhost:5173/programs

### 📞 **Still Having Issues?**
1. Run `diagnose-system.bat` first
2. Check the terminal windows for specific error messages
3. Ensure all prerequisites are met
4. Try manual startup method above

The improved `start-full-system.bat` now includes:
- ✅ Prerequisite checking
- ✅ Dependency installation
- ✅ Better error messages
- ✅ Separate terminal windows for servers
- ✅ Automatic browser opening

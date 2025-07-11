@echo off
echo ======================================
echo    EduKnit LMS Full System Startup
echo ======================================
echo.

echo Checking prerequisites...
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is installed

echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)
echo ✓ npm is available

echo.
echo Step 1: Installing dependencies...
echo Installing backend dependencies...
cd /d "c:\Users\milan\OneDrive\Desktop\eduknit-learn\backend"
if not exist "node_modules" (
    echo Installing backend packages...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Backend dependencies already installed
)

echo Installing frontend dependencies...
cd /d "c:\Users\milan\OneDrive\Desktop\eduknit-learn\frontend"
if not exist "node_modules" (
    echo Installing frontend packages...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo ✓ Frontend dependencies already installed
)

echo.
echo Step 2: Setting up database...
cd /d "c:\Users\milan\OneDrive\Desktop\eduknit-learn\backend"
echo Running database setup script...
node final-lms-setup.js
if %errorlevel% neq 0 (
    echo ERROR: Database setup failed!
    echo This might be because:
    echo 1. MongoDB is not running
    echo 2. Connection string is incorrect
    echo 3. Missing environment variables
    echo.
    echo Please check:
    echo - MongoDB is running on localhost:27017
    echo - .env file exists with correct MONGODB_URI
    echo.
    pause
    exit /b 1
)
echo ✓ Database setup completed

echo.
echo Step 3: Starting backend server...
echo Starting backend in new window...
start "EduKnit Backend Server" cmd /k "cd /d c:\Users\milan\OneDrive\Desktop\eduknit-learn\backend && echo Starting backend server... && npm run dev"

echo.
echo Step 4: Waiting for backend to initialize...
echo Waiting 15 seconds for backend to start...
timeout /t 15 /nobreak

echo.
echo Step 5: Starting frontend application...
echo Starting frontend in new window...
start "EduKnit Frontend App" cmd /k "cd /d c:\Users\milan\OneDrive\Desktop\eduknit-learn\frontend && echo Starting frontend application... && npm run dev"

echo.
echo Step 6: Waiting for frontend to initialize...
echo Waiting 10 seconds for frontend to start...
timeout /t 10 /nobreak

echo.
echo ======================================
echo    🎉 SYSTEM STARTUP COMPLETE!
echo ======================================
echo.
echo Both servers should now be running in separate windows:
echo.
echo 🖥️  Backend Server: http://localhost:5000
echo 🌐 Frontend App:   http://localhost:5173
echo.
echo 📍 Ready to test these routes:
echo   ✓ Programs:           http://localhost:5173/programs
echo   ✓ Student Dashboard:  http://localhost:5173/student-dashboard
echo   ✓ Admin Dashboard:    http://localhost:5173/admin/dashboard
echo   ✓ My Courses:         http://localhost:5173/student-dashboard/courses
echo   ✓ Analytics:          http://localhost:5173/student/analytics
echo   ✓ Profile:            http://localhost:5173/student/profile
echo.
echo 🚀 You can now:
echo   1. Visit http://localhost:5173/programs to browse courses
echo   2. Create an account or login
echo   3. Enroll in any course
echo   4. Access your student dashboard
echo.
echo ⚠️  If servers don't start properly:
echo   - Check the opened terminal windows for error messages
echo   - Ensure MongoDB is running
echo   - Check if ports 5000 and 5173 are available
echo.
echo Press any key to open the frontend in your browser...
pause
start http://localhost:5173/programs

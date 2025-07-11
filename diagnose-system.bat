@echo off
echo ======================================
echo    EduKnit LMS Diagnostic Tool
echo ======================================
echo.

echo 🔍 Checking system requirements...
echo.

REM Check Node.js
echo [1/6] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is NOT installed
    echo    Please install from: https://nodejs.org/
) else (
    for /f %%i in ('node --version') do echo ✅ Node.js: %%i
)

REM Check npm
echo [2/6] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is NOT available
) else (
    for /f %%i in ('npm --version') do echo ✅ npm: %%i
)

REM Check MongoDB connection
echo [3/6] Checking MongoDB...
cd /d "c:\Users\milan\OneDrive\Desktop\eduknit-learn\backend"
node -e "const mongoose=require('mongoose');mongoose.connect('mongodb://localhost:27017/eduknit-learn').then(()=>{console.log('✅ MongoDB: Connected');process.exit(0)}).catch(()=>{console.log('❌ MongoDB: Connection failed');process.exit(1)})" 2>nul
if %errorlevel% neq 0 (
    echo ❌ MongoDB is NOT running or not accessible
    echo    Please start MongoDB service
) else (
    echo ✅ MongoDB: Connected successfully
)

REM Check backend dependencies
echo [4/6] Checking backend dependencies...
cd /d "c:\Users\milan\OneDrive\Desktop\eduknit-learn\backend"
if exist "node_modules" (
    echo ✅ Backend dependencies: Installed
) else (
    echo ❌ Backend dependencies: NOT installed
    echo    Run: npm install in backend folder
)

REM Check frontend dependencies
echo [5/6] Checking frontend dependencies...
cd /d "c:\Users\milan\OneDrive\Desktop\eduknit-learn\frontend"
if exist "node_modules" (
    echo ✅ Frontend dependencies: Installed
) else (
    echo ❌ Frontend dependencies: NOT installed
    echo    Run: npm install in frontend folder
)

REM Check ports
echo [6/6] Checking ports...
netstat -an | find ":5000" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 5000: Already in use (backend might be running)
) else (
    echo ✅ Port 5000: Available
)

netstat -an | find ":5173" >nul
if %errorlevel% equ 0 (
    echo ⚠️  Port 5173: Already in use (frontend might be running)
) else (
    echo ✅ Port 5173: Available
)

echo.
echo ======================================
echo    Diagnostic Complete
echo ======================================
echo.
echo 💡 If all checks pass, run start-full-system.bat
echo 💡 If any checks fail, fix the issues first
echo.
pause

@echo off
echo Stopping any existing Node processes...
taskkill /F /IM node.exe 2>nul

echo Starting backend server...
cd /d "c:\Users\milan\OneDrive\Desktop\eduknit-learn\backend"
npm run dev

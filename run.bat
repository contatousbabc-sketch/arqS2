@echo off
echo Starting backend server...
start "Backend Server" waitress-serve --port=5000 backend.routes:app

echo Opening application in browser...
start http://localhost:5000

pause
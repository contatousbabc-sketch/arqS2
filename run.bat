@echo off
echo Starting backend server...
start "Backend Server" gunicorn --chdir backend routes:app

echo Opening application in browser...
start http://localhost:8000

pause
@echo off
echo Installing backend dependencies...
pip install -r requirements.txt

echo Installing frontend dependencies...
npm install

echo Building frontend...
npm run build

echo Installation complete.
pause
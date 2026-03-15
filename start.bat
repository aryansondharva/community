@echo off
echo Starting HACKX 2025 Application...
echo.

echo Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo Installing server dependencies...
cd ..\server
call npm install
if %errorlevel% neq 0 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)

echo.
echo Starting servers...
echo Server will run on http://localhost:5000
echo Client will run on http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers

start "HackX Server" cmd /c "npm start"

cd ..\client
start "HackX Client" cmd /c "npm start"

echo Both servers are starting...
pause

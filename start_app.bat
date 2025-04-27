@echo off
echo Starting PII Authentication System...

REM Start the Flask backend server
start cmd /k "cd PII-Authenticator\backend && python app.py"

REM Wait for the backend to start
timeout /t 3 /nobreak

REM Open the frontend in the default browser
start "" "PII-Authenticator\frontend\PII\PII\index.html"

echo Application started successfully!
echo Backend server is running at http://localhost:5000
echo Frontend is now open in your browser
echo.
echo Press any key to stop the servers...
pause > nul

REM Kill the Flask server when done
taskkill /f /im python.exe /fi "WINDOWTITLE eq *backend*"

echo Application stopped.
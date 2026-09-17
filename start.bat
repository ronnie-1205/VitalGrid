@echo off
setlocal

set PROJECT_ROOT=%~dp0

echo ===================================================
echo   VitalGrid Command Center - Windows Startup
echo ===================================================
echo.

cd /d "%PROJECT_ROOT%"

if not exist "venv\" (
    echo [!] No virtual environment found. Creating one...
    python -m venv venv
    
    echo [!] Activating venv and installing Python dependencies...
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    echo.
) else (
    call venv\Scripts\activate.bat
)

echo [1/4] Generating synthetic data and seeding database...
cd /d "%PROJECT_ROOT%backend"
python generate_data.py
python seed_db.py

echo.
echo [2/4] Starting Python FastAPI Backend on Port 8001...
start "VitalGrid Backend" python -m uvicorn main:app --reload --port 8001

echo.
echo [3/4] Waiting for backend to boot...
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting React Frontend on Port 5173...
cd /d "%PROJECT_ROOT%frontend"

if not exist node_modules\ (
    echo [!] Installing frontend dependencies (this might take a minute)...
    call npm install
)

start "VitalGrid Frontend" npm run dev

echo.
echo ===================================================
echo [SUCCESS] VitalGrid is successfully running!
echo.
echo NOTE: Two new console windows have been opened for 
echo the Backend and Frontend servers.
echo To shut down VitalGrid, simply close those two windows.
echo ===================================================
pause

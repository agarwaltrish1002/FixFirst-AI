@echo off
chcp 65001 >nul 2>&1
title FixFirst AI - Starting...
color 0A

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║          FixFirst AI - Campus Safety             ║
echo  ║     Intelligent Risk ^& Maintenance Agent        ║
echo  ╚══════════════════════════════════════════════════╝
echo.

:: ─── Navigate to project directory ───
cd /d "%~dp0"
echo [INFO] Project folder: %cd%

:: ─── Check Python ───
echo.
echo [STEP 1/6] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo         Please install Python from https://www.python.org/downloads/
    echo         Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version 2^>^&1') do echo          Found: %%i

:: ─── Check Node.js ───
echo.
echo [STEP 2/6] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo         Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version 2^>^&1') do echo          Found: Node.js %%i

:: ─── Check / Create Virtual Environment ───
echo.
echo [STEP 3/6] Setting up Python virtual environment...
if not exist "venv\Scripts\activate.bat" (
    echo          Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo          Virtual environment created.
)
call venv\Scripts\activate.bat
echo          Virtual environment activated.

:: ─── Install Python packages ───
echo.
echo [STEP 4/6] Installing Python dependencies...
pip install -r requirements.txt --quiet 2>nul
if errorlevel 1 (
    echo [WARNING] Some packages may have failed. Trying again...
    pip install -r requirements.txt
)
echo          Python dependencies ready.

:: ─── Install frontend packages ───
echo.
echo [STEP 5/6] Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    echo          Installing npm packages (first time setup)...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed!
        echo         Make sure Node.js and npm are properly installed.
        cd ..
        pause
        exit /b 1
    )
) else (
    echo          Frontend packages already installed.
)
cd ..

:: ─── Check port availability ───
echo.
echo [STEP 6/6] Checking ports...

set BACKEND_PORT=8001
set FRONTEND_PORT=5174

netstat -ano | findstr ":%BACKEND_PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port %BACKEND_PORT% is in use! Trying 8002...
    set BACKEND_PORT=8002
    netstat -ano | findstr ":8002 " | findstr "LISTENING" >nul 2>&1
    if not errorlevel 1 (
        echo [WARNING] Port 8002 also in use! Trying 8003...
        set BACKEND_PORT=8003
    )
)

netstat -ano | findstr ":%FRONTEND_PORT% " | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port %FRONTEND_PORT% is in use! Trying 5175...
    set FRONTEND_PORT=5175
    netstat -ano | findstr ":5175 " | findstr "LISTENING" >nul 2>&1
    if not errorlevel 1 (
        echo [WARNING] Port 5175 also in use! Trying 5176...
        set FRONTEND_PORT=5176
    )
)

echo          Backend  port: %BACKEND_PORT%
echo          Frontend port: %FRONTEND_PORT%

:: ─── Check Ollama ───
echo.
echo [INFO] Checking Ollama AI...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo [INFO] Ollama is NOT running. AI features will use fallback mode.
    echo        To enable AI: Install Ollama from https://ollama.com
    echo        Then run: ollama pull qwen3:1.7b
) else (
    echo [OK]   Ollama is running! AI features enabled.
)

:: ─── Start Backend ───
echo.
echo ══════════════════════════════════════════════════
echo  Starting FixFirst AI...
echo ══════════════════════════════════════════════════
echo.

title FixFirst AI - Backend (port %BACKEND_PORT%)
echo [START] Backend server on port %BACKEND_PORT%...
start "FixFirst AI - Backend" cmd /k "cd /d "%~dp0" && call venv\Scripts\activate.bat && python -c "import uvicorn; uvicorn.run('backend.main:app', host='127.0.0.1', port=%BACKEND_PORT%, log_level='info')"

:: Wait for backend to start
echo          Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

:: ─── Start Frontend ───
echo [START] Frontend server on port %FRONTEND_PORT%...
start "FixFirst AI - Frontend" cmd /k "cd /d "%~dp0%frontend" && npx vite --port %FRONTEND_PORT% --strictPort"

:: Wait for frontend to start
timeout /t 3 /nobreak >nul

:: ─── Open Browser ───
echo.
echo [START] Opening browser...
start http://127.0.0.1:%FRONTEND_PORT%

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║                                                  ║
echo  ║  FixFirst AI is running!                         ║
echo  ║                                                  ║
echo  ║  Frontend: http://127.0.0.1:%FRONTEND_PORT%             ║
echo  ║  Backend:  http://127.0.0.1:%BACKEND_PORT%              ║
echo  ║                                                  ║
echo  ║  To stop: Run stop_fixfirst.bat                  ║
echo  ║  Or close the Backend and Frontend windows       ║
echo  ║                                                  ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo Press any key to close this launcher (servers keep running)...
pause >nul

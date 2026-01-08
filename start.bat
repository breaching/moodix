@echo off
echo ==========================================
echo Journal App - Starting...
echo ==========================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install/Update dependencies
echo Checking dependencies...
pip install -r requirements.txt --quiet
echo.

REM Create necessary directories
if not exist "logs" mkdir logs
if not exist "instance" mkdir instance
if not exist "backups" mkdir backups
if not exist "flask_session" mkdir flask_session

REM Check if .env exists
if not exist ".env" (
    echo.
    echo WARNING: .env file not found!
    echo Please create .env file from .env.example
    echo Run: copy .env.example .env
    echo Then generate password hash: python hash_password.py YourPassword
    echo.
    pause
    exit /b 1
)

REM Run the app
echo Starting server...
echo.
python serv.py

pause

@echo off
REM AI Interview Practice Partner - Windows Setup Script
echo ========================================
echo AI Interview Practice Partner Backend
echo FastAPI + Google Gemini AI
echo ========================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python found

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Create necessary directories
echo 📁 Creating directories...
if not exist "data" mkdir data
if not exist "data\sessions" mkdir data\sessions
if not exist "data\reports" mkdir data\reports
if not exist "logs" mkdir logs

REM Copy environment file if it doesn't exist
if not exist ".env" (
    if exist ".env.example" (
        echo 📋 Creating .env file from template...
        copy .env.example .env
        echo.
        echo ⚠️  IMPORTANT: Edit .env file and add your GOOGLE_AI_API_KEY
        echo    Get your API key from: https://makersuite.google.com/app/apikey
        echo.
    )
)

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file and add your GOOGLE_AI_API_KEY
echo 2. Run: start_server.bat
echo.
echo API Documentation will be available at:
echo http://localhost:8000/docs
echo.
pause
@echo off
REM Start AI Interview Backend Server
echo ========================================
echo Starting AI Interview Backend Server
echo FastAPI + Google Gemini AI
echo ========================================

REM Check if virtual environment exists
if not exist "venv" (
    echo ERROR: Virtual environment not found
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found
    echo Please copy .env.example to .env and configure it
    pause
)

echo 🚀 Starting FastAPI server...
echo.
echo Server will be available at:
echo - Main API: http://localhost:8000
echo - Documentation: http://localhost:8000/docs  
echo - Alternative docs: http://localhost:8000/redoc
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
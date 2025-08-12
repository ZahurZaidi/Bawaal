@echo off
cd /d %~dp0

echo Starting AI Chat Platform...
echo.

echo Step 1: Checking if Ollama is running...
ollama list >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Ollama is not running or not installed!
    echo Please install Ollama from https://ollama.ai
    echo Then run: ollama pull llama2
    echo And start it with: ollama serve
    pause
    exit /b 1
)

echo ✅ Ollama is running
echo.

echo Step 2: Starting Backend Server...
start "Backend Server" cmd /k "python run_backend.py"
echo ✅ Backend server started on http://localhost:8000
echo.

echo Step 3: Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
echo ✅ Frontend server starting on http://localhost:5173
echo.
cd ..
echo 🎉 Application is starting up!
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to close this window...
pause >nul 
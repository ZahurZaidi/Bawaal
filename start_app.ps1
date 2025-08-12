Write-Host "🚀 Starting AI Chat Platform..." -ForegroundColor Green
Write-Host ""

# Step 1: Check if Ollama is running
Write-Host "Step 1: Checking if Ollama is running..." -ForegroundColor Yellow
try {
    $ollamaOutput = ollama list 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Ollama is running" -ForegroundColor Green
        Write-Host "Available models: $ollamaOutput" -ForegroundColor Cyan
    } else {
        throw "Ollama not responding"
    }
} catch {
    Write-Host "❌ ERROR: Ollama is not running or not installed!" -ForegroundColor Red
    Write-Host "Please install Ollama from https://ollama.ai" -ForegroundColor Yellow
    Write-Host "Then run: ollama pull llama2" -ForegroundColor Yellow
    Write-Host "And start it with: ollama serve" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Step 2: Start Backend
Write-Host "Step 2: Starting Backend Server..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python run_backend.py" -WindowStyle Normal
Write-Host "✅ Backend server starting on http://localhost:8000" -ForegroundColor Green

Write-Host ""

# Step 3: Start Frontend
Write-Host "Step 3: Starting Frontend Server..." -ForegroundColor Yellow
Set-Location ../frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Write-Host "✅ Frontend server starting on http://localhost:5173" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Application is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: It may take a few moments for the servers to fully start." -ForegroundColor Yellow
Write-Host "Check the opened terminal windows for any error messages." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to close this window" 
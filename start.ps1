# HavenBridge — Start both backend and frontend
# Usage: .\start.ps1

Write-Host ""
Write-Host "  HavenBridge — Starting..." -ForegroundColor Cyan
Write-Host ""

# Install frontend dependencies if needed
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[1/3] Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
} else {
    Write-Host "[1/3] Frontend dependencies already installed." -ForegroundColor Green
}

# Start backend in background
Write-Host "[2/3] Starting backend API (http://localhost:5149)..." -ForegroundColor Yellow
$backend = Start-Process -PassThru -NoNewWindow -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory "HavenBridge.Api"

# Give the backend a moment to start before launching frontend
Start-Sleep -Seconds 3

# Start frontend in background
Write-Host "[3/3] Starting frontend (http://localhost:5173)..." -ForegroundColor Yellow
$frontend = Start-Process -PassThru -NoNewWindow -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "frontend"

Write-Host ""
Write-Host "  Both servers running!" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5149" -ForegroundColor White
Write-Host ""
Write-Host "  Press Ctrl+C to stop both servers." -ForegroundColor DarkGray
Write-Host ""

try {
    $backend.WaitForExit()
} finally {
    if (-not $frontend.HasExited) { Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue }
    if (-not $backend.HasExited) { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue }
    # Also clean up any child node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.StartTime -ge (Get-Date).AddMinutes(-60) } | Stop-Process -Force -ErrorAction SilentlyContinue
}

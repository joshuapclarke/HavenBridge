# HavenBridge — First-time setup
# Installs all dependencies and verifies prerequisites.
# Usage: .\setup.ps1

Write-Host ""
Write-Host "  HavenBridge — First-Time Setup" -ForegroundColor Cyan
Write-Host ""

# Check .NET SDK
$dotnetVersion = dotnet --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [X] .NET SDK not found. Install from https://dotnet.microsoft.com/download" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  [OK] .NET SDK $dotnetVersion" -ForegroundColor Green
}

# Check Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [X] Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  [OK] Node.js $nodeVersion" -ForegroundColor Green
}

# Restore .NET packages
Write-Host ""
Write-Host "  Restoring .NET packages..." -ForegroundColor Yellow
dotnet restore HavenBridge.Api
Write-Host "  [OK] .NET packages restored" -ForegroundColor Green

# Install frontend dependencies
Write-Host ""
Write-Host "  Installing frontend dependencies..." -ForegroundColor Yellow
Push-Location frontend
npm install
Pop-Location
Write-Host "  [OK] Frontend dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "  Setup complete! Run .\start.ps1 to launch the app." -ForegroundColor Green
Write-Host ""

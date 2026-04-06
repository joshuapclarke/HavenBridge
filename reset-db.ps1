# HavenBridge — Reset the local SQLite database
# This deletes the DB so it gets re-seeded from the CSV files on next startup.
# Usage: .\reset-db.ps1

Write-Host ""
Write-Host "  HavenBridge — Database Reset" -ForegroundColor Cyan
Write-Host ""

# Stop the backend if running
$running = Get-Process -Name "HavenBridge.Api" -ErrorAction SilentlyContinue
if ($running) {
    Write-Host "  Stopping running backend..." -ForegroundColor Yellow
    $running | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# Find and delete the database file(s)
$deleted = $false
$searchPaths = @(
    "HavenBridge.Api\havenbridge.db",
    "HavenBridge.Api\bin\Debug\net10.0\havenbridge.db",
    "havenbridge.db"
)

foreach ($path in $searchPaths) {
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "  Deleted: $path" -ForegroundColor Green
        $deleted = $true
    }
}

if (-not $deleted) {
    Write-Host "  No database file found (it may already be clean)." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  Done! The database will be re-created from CSV seed data" -ForegroundColor Green
Write-Host "  the next time you start the backend." -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Stopping demo..."

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Demo stopped."
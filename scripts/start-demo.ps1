$ErrorActionPreference = "Stop"

$frontendDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendDir = Resolve-Path (Join-Path $frontendDir "..\AppleStoreMini_Api")
$frontendUrl = "http://127.0.0.1:3000"
$backendHealthUrl = "http://localhost:5000/api/health"

function Test-UrlReady {
    param([string] $Url)

    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
        return $response.StatusCode -lt 500
    } catch {
        return $false
    }
}

function Wait-UrlReady {
    param(
        [string] $Url,
        [string] $Name,
        [int] $TimeoutSeconds = 60
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-UrlReady -Url $Url) {
            Write-Host "$Name ready: $Url"
            return
        }
        Start-Sleep -Seconds 1
    }

    throw "$Name was not ready at $Url"
}

if (Test-UrlReady -Url $backendHealthUrl) {
    Write-Host "Backend already running: $backendHealthUrl"
} else {
    Write-Host "Starting backend with system CA..."
    $env:NODE_OPTIONS = (($env:NODE_OPTIONS, "--use-system-ca") | Where-Object { $_ } | Select-Object -Unique) -join " "
    Start-Process `
        -FilePath "npm.cmd" `
        -ArgumentList @("start") `
        -WorkingDirectory $backendDir `
        -RedirectStandardOutput (Join-Path $frontendDir "api-out.log") `
        -RedirectStandardError (Join-Path $frontendDir "api-err.log") `
        -WindowStyle Hidden
    Wait-UrlReady -Url $backendHealthUrl -Name "Backend"
}

if (Test-UrlReady -Url $frontendUrl) {
    Write-Host "Frontend already running: $frontendUrl"
} else {
    Write-Host "Starting frontend..."
    Start-Process `
        -FilePath "npm.cmd" `
        -ArgumentList @("run", "dev", "--", "--host", "127.0.0.1", "--port", "3000") `
        -WorkingDirectory $frontendDir `
        -RedirectStandardOutput (Join-Path $frontendDir "dev-out.log") `
        -RedirectStandardError (Join-Path $frontendDir "dev-err.log") `
        -WindowStyle Hidden
    Wait-UrlReady -Url $frontendUrl -Name "Frontend"
}

Write-Host ""
Write-Host "Demo URLs:"
Write-Host "  Frontend: $frontendUrl"
Write-Host "  Backend:  $backendHealthUrl"

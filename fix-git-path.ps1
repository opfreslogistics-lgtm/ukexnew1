# Fix Git PATH Issue - Run this script in PowerShell as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git PATH Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "This script will add Git to PATH for current user only." -ForegroundColor Yellow
    Write-Host ""
}

# Git installation paths
$gitPaths = @(
    "C:\Program Files\Git\bin",
    "C:\Program Files\Git\cmd",
    "C:\Program Files (x86)\Git\bin",
    "C:\Program Files (x86)\Git\cmd"
)

# Find Git installation
$gitPath = $null
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $gitPath = $path
        Write-Host "Found Git at: $gitPath" -ForegroundColor Green
        break
    }
}

if (-not $gitPath) {
    Write-Host "ERROR: Git not found in common installation paths!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    pause
    exit 1
}

# Add to PATH for current session
$env:PATH += ";$gitPath"
Write-Host "Added Git to PATH for current session" -ForegroundColor Green

# Test Git
Write-Host ""
Write-Host "Testing Git..." -ForegroundColor Cyan
try {
    $gitVersion = & git --version
    Write-Host "SUCCESS: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git still not working" -ForegroundColor Red
    pause
    exit 1
}

# Add to permanent PATH
Write-Host ""
Write-Host "Adding Git to permanent PATH..." -ForegroundColor Cyan

if ($isAdmin) {
    # System-wide PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($currentPath -notlike "*$gitPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$gitPath", "Machine")
        Write-Host "Added Git to system PATH (requires restart)" -ForegroundColor Green
    } else {
        Write-Host "Git already in system PATH" -ForegroundColor Yellow
    }
} else {
    # User PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$gitPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$gitPath", "User")
        Write-Host "Added Git to user PATH" -ForegroundColor Green
    } else {
        Write-Host "Git already in user PATH" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done! Please restart your terminal." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "After restarting, run: git --version" -ForegroundColor Yellow
Write-Host ""

pause


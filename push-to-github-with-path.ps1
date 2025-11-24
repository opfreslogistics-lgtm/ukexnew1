# Push to GitHub - With Git PATH Fix
# This script will add Git to PATH and push your code

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OPFRES Vault - Push to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Add Git to PATH for this session
$gitPaths = @(
    "C:\Program Files\Git\bin",
    "C:\Program Files\Git\cmd"
)

$gitAdded = $false
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $env:PATH += ";$path"
        $gitAdded = $true
        Write-Host "Added Git to PATH: $path" -ForegroundColor Green
        break
    }
}

if (-not $gitAdded) {
    Write-Host "ERROR: Git not found!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    pause
    exit 1
}

# Test Git
Write-Host ""
Write-Host "Testing Git..." -ForegroundColor Cyan
try {
    $gitVersion = & git --version
    Write-Host "SUCCESS: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git not working. Trying full path..." -ForegroundColor Yellow
    $gitExe = "C:\Program Files\Git\bin\git.exe"
    if (Test-Path $gitExe) {
        # Use full path for git commands
        function git { & "C:\Program Files\Git\bin\git.exe" $args }
        Write-Host "Using full path to Git" -ForegroundColor Yellow
    } else {
        Write-Host "ERROR: Cannot find Git!" -ForegroundColor Red
        pause
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Initializing Git Repository" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Initialize git if not already done
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to initialize git" -ForegroundColor Red
        pause
        exit 1
    }
} else {
    Write-Host "Git repository already initialized" -ForegroundColor Green
}

# Add all files
Write-Host ""
Write-Host "Adding all files..." -ForegroundColor Yellow
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add files" -ForegroundColor Red
    pause
    exit 1
}

# Commit
Write-Host ""
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Initial commit - Production ready OPFRES Vault"
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: Commit failed or nothing to commit" -ForegroundColor Yellow
}

# Check if remote exists
Write-Host ""
Write-Host "Checking remote repository..." -ForegroundColor Yellow
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Adding remote repository..." -ForegroundColor Yellow
    git remote add origin https://github.com/opfreslogistics-lgtm/ukexnew1.git
} else {
    Write-Host "Remote already exists. Updating..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/opfreslogistics-lgtm/ukexnew1.git
}

# Set branch to main
Write-Host ""
Write-Host "Setting branch to main..." -ForegroundColor Yellow
git branch -M main

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ready to Push!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository: https://github.com/opfreslogistics-lgtm/ukexnew1.git" -ForegroundColor White
Write-Host ""
Write-Host "You will be prompted for GitHub credentials." -ForegroundColor Yellow
Write-Host "Use your GitHub username and a Personal Access Token as password." -ForegroundColor Yellow
Write-Host ""
Write-Host "To create a token: https://github.com/settings/tokens" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to push to GitHub..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Code pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "View your repository at:" -ForegroundColor White
    Write-Host "https://github.com/opfreslogistics-lgtm/ukexnew1" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Push failed. Common issues:" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "1. Authentication failed - Use Personal Access Token" -ForegroundColor Yellow
    Write-Host "2. Repository not found - Check repository URL" -ForegroundColor Yellow
    Write-Host "3. Permission denied - Check repository access" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "See GITHUB_PUSH_GUIDE.md for detailed help." -ForegroundColor Cyan
    Write-Host ""
}

pause


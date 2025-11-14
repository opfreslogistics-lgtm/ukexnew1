@echo off
echo ========================================
echo UKEX Vault - Push to GitHub
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed or not in PATH
    echo.
    echo Please install Git from: https://git-scm.com/download/win
    echo Or use GitHub Desktop: https://desktop.github.com/
    echo.
    pause
    exit /b 1
)

echo Git is installed. Proceeding...
echo.

REM Initialize git if not already done
if not exist .git (
    echo Initializing git repository...
    git init
    echo.
)

REM Add all files
echo Adding all files...
git add .
echo.

REM Commit
echo Committing changes...
git commit -m "Initial commit - Production ready UKEX Vault"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo NOTE: No changes to commit, or commit already exists.
    echo.
)

REM Check if remote exists
git remote get-url origin >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Adding remote repository...
    git remote add origin https://github.com/opfreslogistics-lgtm/ukexnew1.git
    echo.
) else (
    echo Remote already exists. Updating...
    git remote set-url origin https://github.com/opfreslogistics-lgtm/ukexnew1.git
    echo.
)

REM Set branch to main
git branch -M main
echo.

echo ========================================
echo Ready to push!
echo ========================================
echo.
echo Repository: https://github.com/opfreslogistics-lgtm/ukexnew1.git
echo.
echo You will be prompted for GitHub credentials.
echo Use your GitHub username and a Personal Access Token as password.
echo.
echo To create a token: https://github.com/settings/tokens
echo.
pause

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Code pushed to GitHub!
    echo ========================================
    echo.
    echo View your repository at:
    echo https://github.com/opfreslogistics-lgtm/ukexnew1
    echo.
) else (
    echo.
    echo ========================================
    echo Push failed. Common issues:
    echo ========================================
    echo 1. Authentication failed - Use Personal Access Token
    echo 2. Repository not found - Check repository URL
    echo 3. Permission denied - Check repository access
    echo.
    echo See GITHUB_PUSH_GUIDE.md for detailed help.
    echo.
)

pause


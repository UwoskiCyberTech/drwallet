@echo off
echo ╔════════════════════════════════════════════════════════════════╗
echo ║          🚀 ALMRISKSCAN - DEPLOY TO NEW GITHUB REPO           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo This script will help you deploy to a new GitHub repository
echo.

:INPUT_USERNAME
set /p GITHUB_USERNAME="Enter your GitHub username: "
if "%GITHUB_USERNAME%"=="" (
    echo ❌ Username cannot be empty!
    goto INPUT_USERNAME
)

:INPUT_REPO
set /p REPO_NAME="Enter repository name [almriskscan]: "
if "%REPO_NAME%"=="" set REPO_NAME=almriskscan

echo.
echo ═══════════════════════════════════════════════════════════════
echo Summary:
echo ═══════════════════════════════════════════════════════════════
echo GitHub URL: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
echo.
set /p CONFIRM="Is this correct? (Y/N): "
if /i not "%CONFIRM%"=="Y" goto INPUT_USERNAME

echo.
echo ⏳ Step 1: Removing old remote...
git remote remove origin 2>nul

echo ✅ Step 2: Adding new remote...
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo ✅ Step 3: Renaming branch to main...
git branch -M main

echo ✅ Step 4: Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Push failed! Make sure:
    echo    1. You created the repository on GitHub
    echo    2. The repository name is correct
    echo    3. You have push permissions
    echo.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                    ✅ SUCCESS!                                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Your code is now on GitHub at:
echo https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.
echo ═══════════════════════════════════════════════════════════════
echo NEXT STEP: Deploy to Vercel
echo ═══════════════════════════════════════════════════════════════
echo.
echo 1. Go to: https://vercel.com/new
echo 2. Import: %GITHUB_USERNAME%/%REPO_NAME%
echo 3. Set Root Directory to: apps/web
echo 4. Add environment variables (see DEPLOY_TO_NEW_REPO.md)
echo 5. Click Deploy!
echo.
pause

@echo off
echo ========================================
echo Skyblock Accessories Tracker Deployment
echo ========================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ This is not a Git repository.
    echo Please run: git init
    pause
    exit /b 1
)

REM Check if remote is configured
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  No remote 'origin' found.
    echo Please set up your GitHub repository first:
    echo   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    echo   git push -u origin main
    pause
    exit /b 1
)

REM Check if gh-pages is installed
echo Checking dependencies...
npm list gh-pages >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing gh-pages dependency...
    npm install --save-dev gh-pages
)

REM Clean any previous builds
if exist dist (
    echo Cleaning previous build...
    rmdir /s /q dist
)

REM Build the project
echo.
echo Building the project...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix any errors before deploying.
    pause
    exit /b 1
)

REM Deploy to GitHub Pages
echo.
echo Deploying to GitHub Pages...
npm run deploy
if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    echo.
    echo Possible solutions:
    echo 1. Make sure you have pushed your changes to GitHub:
    echo    git add .
    echo    git commit -m "Update app"
    echo    git push origin main
    echo.
    echo 2. Make sure your GitHub repository has Pages enabled:
    echo    - Go to your repository on GitHub
    echo    - Click Settings ^> Pages
    echo    - Select "Deploy from a branch"
    echo    - Choose "gh-pages" branch and "/ (root)" folder
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Deployment successful!
echo 🌐 Your app is now live on GitHub Pages!
echo.
echo You can access it at:
echo https://petarwho.github.io/SkyblockAccessories
echo.
pause

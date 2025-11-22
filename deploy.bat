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
    echo   git remote add origin https://github.com/PetarWho/SkyblockAccessories.git
    echo   git push -u origin main
    pause
    exit /b 1
)

REM Check if gh-pages is installed
echo Checking dependencies...
npm list gh-pages 2>nul | find "gh-pages" >nul
if %errorlevel% neq 0 (
    echo Installing gh-pages dependency...
    npm install --save-dev gh-pages
    if %errorlevel% neq 0 (
        echo ❌ Failed to install gh-pages. Please check your npm setup.
        pause
        exit /b 1
    )
)

REM Clean any previous builds
if exist dist (
    echo Cleaning previous build...
    rmdir /s /q dist
)

REM Build the project
echo.
echo Building the project...
echo Running: npm run build
echo Note: Building with base path '/SkyblockAccessories/' for GitHub Pages
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed with error code %errorlevel%
    echo.
    echo Trying to diagnose the issue...
    echo.
    echo Checking if TypeScript compiles correctly:
    call npx tsc --noEmit
    if %errorlevel% neq 0 (
        echo ❌ TypeScript compilation failed
        echo Please fix TypeScript errors before deploying
    ) else (
        echo ✅ TypeScript compilation succeeded
        echo The issue might be with Vite build process
    )
    echo.
    echo Try running 'npm run build' manually to see the full error message
    pause
    exit /b 1
)
echo ✅ Build completed successfully

REM Deploy to GitHub Pages
echo.
echo Deploying to GitHub Pages...
echo Running: npm run deploy
call npm run deploy
if %errorlevel% neq 0 (
    echo.
    echo ❌ Deployment failed with error code %errorlevel%
    echo.
    echo Trying alternative deployment method...
    echo.
    echo Running: npx gh-pages --dist dist
    call npx gh-pages --dist dist
    if %errorlevel% neq 0 (
        echo.
        echo ❌ Both deployment methods failed
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
        echo 3. Make sure you have admin rights to the repository
        echo.
        echo 4. Try running 'npm run deploy' manually to see the full error
        pause
        exit /b 1
    ) else (
        echo ✅ Alternative deployment method succeeded
    )
) else (
    echo ✅ Deployment completed successfully
)

echo.
echo ✅ Deployment successful!
echo 🌐 Your app is now live on GitHub Pages!
echo.
echo You can access it at:
echo https://petarwho.github.io/SkyblockAccessories
echo.
pause

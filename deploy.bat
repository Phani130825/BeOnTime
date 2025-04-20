@echo off
echo 🚀 Starting deployment process...

echo 📦 Installing dependencies...
call npm run install-all

echo 🏗️ Building client...
cd client
call npm run build
cd ..

REM Verify build directory exists
if not exist "client\build" (
  echo ❌ Build directory not found. Build process failed.
  exit /b 1
)

REM Verify index.html exists
if not exist "client\build\index.html" (
  echo ❌ index.html not found in build directory. Build process failed.
  exit /b 1
)

echo ✅ Build successful!

echo 🚀 Deploying to Vercel...
call vercel --prod

echo ✅ Deployment complete!
pause 
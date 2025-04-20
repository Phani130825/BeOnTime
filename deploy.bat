@echo off
echo Preparing for GitHub deployment...

REM Check if .git directory exists
if not exist .git (
  echo Initializing git repository...
  git init
)

REM Add all files
echo Adding files to git...
git add .

REM Commit changes
echo Committing changes...
git commit -m "Prepare for Vercel deployment"

REM Check if remote exists
git remote -v | findstr "origin" > nul
if %errorlevel% neq 0 (
  echo Please enter your GitHub repository URL:
  set /p repo_url=
  git remote add origin %repo_url%
)

REM Push to GitHub
echo Pushing to GitHub...
git push -u origin main
if %errorlevel% neq 0 (
  echo Trying master branch instead...
  git push -u origin master
)

echo Deployment preparation complete!
echo Now you can deploy to Vercel by connecting your GitHub repository.
pause 
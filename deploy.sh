#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")"

# Check if .git directory exists
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
fi

# Add all files
echo "Adding files to git..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "Prepare for Vercel deployment"

# Check if remote exists
if ! git remote | grep -q "origin"; then
  echo "Please enter your GitHub repository URL:"
  read repo_url
  git remote add origin $repo_url
fi

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main || git push -u origin master

echo "Deployment preparation complete!"
echo "Now you can deploy to Vercel by connecting your GitHub repository." 
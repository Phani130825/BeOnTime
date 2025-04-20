#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build the client
echo "🏗️ Building client..."
cd client
npm run build
cd ..

# Verify build directory exists
if [ ! -d "client/build" ]; then
  echo "❌ Build directory not found. Build process failed."
  exit 1
fi

# Verify index.html exists
if [ ! -f "client/build/index.html" ]; then
  echo "❌ index.html not found in build directory. Build process failed."
  exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!" 
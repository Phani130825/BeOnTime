# Vercel Deployment Guide for BeOnTime

This guide will help you deploy your BeOnTime application to Vercel.

## Prerequisites

1. Install [Node.js](https://nodejs.org/) (v14 or higher)
2. Install [Vercel CLI](https://vercel.com/docs/cli) globally:
   ```
   npm install -g vercel
   ```
3. Create a [Vercel account](https://vercel.com/signup) if you don't have one
4. Make sure you have a MongoDB database set up (you can use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

## Environment Variables

Before deploying, make sure to set up the following environment variables in your Vercel project:

1. `MONGODB_URI`: Your MongoDB connection string
2. `JWT_SECRET`: A secret key for JWT token generation
3. `NODE_ENV`: Set to "production"

## Important Note About Build Process

The deployment process requires the React application to be built first, which generates the `client/build` directory containing the `index.html` file. This file is essential for the deployment to work correctly. The deployment scripts will handle this build process automatically.

## Deployment Steps

### Option 1: Using the Deployment Scripts

#### For Windows Users:
1. Run the `deploy.bat` script:
   ```
   deploy.bat
   ```

#### For macOS/Linux Users:
1. Make the script executable:
   ```
   chmod +x deploy.sh
   ```
2. Run the script:
   ```
   ./deploy.sh
   ```

### Option 2: Manual Deployment

1. Install dependencies:
   ```
   npm run install-all
   ```

2. Build the client:
   ```
   cd client
   npm run build
   cd ..
   ```

3. Verify the build was successful:
   ```
   # Check if the build directory exists
   dir client\build  # Windows
   ls client/build   # macOS/Linux
   
   # Check if index.html exists
   dir client\build\index.html  # Windows
   ls client/build/index.html   # macOS/Linux
   ```

4. Deploy to Vercel:
   ```
   vercel --prod
   ```

## Troubleshooting

### DEPLOYMENT_NOT_FOUND Error

If you encounter a DEPLOYMENT_NOT_FOUND error:

1. Make sure you're logged in to Vercel:
   ```
   vercel login
   ```

2. Check if your project is linked to Vercel:
   ```
   vercel link
   ```

3. Verify that the build process completed successfully and the `client/build/index.html` file exists.

4. Try deploying again:
   ```
   vercel --prod
   ```

### Build Failures

If the build fails:

1. Check the build logs in the Vercel dashboard
2. Make sure all dependencies are correctly specified in package.json files
3. Verify that the build commands in vercel.json are correct
4. Try building locally first to identify any issues:
   ```
   cd client
   npm run build
   ```

### API Issues

If your API endpoints are not working:

1. Check the server logs in the Vercel dashboard
2. Verify that your MongoDB connection string is correct
3. Make sure your API routes are properly configured in vercel.json

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) 
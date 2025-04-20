# Deploying BeOnTime to Vercel with MongoDB Atlas

This guide will help you deploy the BeOnTime application to Vercel using MongoDB Atlas as the database.

## Prerequisites

1. A MongoDB Atlas account (free tier is sufficient)
2. A Vercel account
3. Your application code

## Setting up MongoDB Atlas

1. Log in to your MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster if you don't have one already (the free tier is sufficient)
3. Set up database access:
   - Go to Security > Database Access
   - Create a new database user with read/write permissions
   - Note down the username and password

4. Set up network access:
   - Go to Security > Network Access
   - Add your IP address or use 0.0.0.0/0 to allow access from anywhere (for development)

5. Get your connection string:
   - Go to your cluster and click "Connect"
   - Select "Connect your application"
   - Copy the connection string and replace `<password>` with your database user's password

## Deploying to Vercel

1. Push your code to a GitHub repository

2. Log in to Vercel and create a new project:
   - Connect to your GitHub repository
   - Configure the project settings:
     - Framework Preset: Node.js
     - Root Directory: server (or wherever your server code is located)
     - Build Command: `npm install`
     - Output Directory: N/A
     - Install Command: `npm install`

3. Add environment variables:
   - Go to Project Settings > Environment Variables
   - Add the following variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Your JWT secret key
     - `NODE_ENV`: production
     - `SMTP_HOST`: Your SMTP host
     - `SMTP_PORT`: Your SMTP port
     - `SMTP_SECURE`: true or false
     - `SMTP_USER`: Your SMTP username
     - `SMTP_PASS`: Your SMTP password
     - `SMTP_FROM`: Your sender email address

4. Deploy the project:
   - Click "Deploy" to start the deployment process
   - Vercel will automatically build and deploy your application

## Important Notes

1. **MongoDB Atlas Free Tier**: The free tier of MongoDB Atlas provides:
   - 512MB of storage
   - Shared RAM
   - Up to 100 connections
   - This is sufficient for development and small production applications

2. **Environment Variables**: Make sure all your environment variables are properly set in Vercel.

3. **CORS Configuration**: If your frontend is hosted on a different domain, you may need to update your CORS configuration in the server code.

4. **Database Migration**: If you have existing data in your local MongoDB, you'll need to migrate it to MongoDB Atlas. You can use tools like `mongodump` and `mongorestore` for this purpose.

## Troubleshooting

1. **Connection Issues**: If you're having trouble connecting to MongoDB Atlas, check:
   - Your network access settings in MongoDB Atlas
   - Your connection string format
   - Your environment variables in Vercel

2. **Deployment Failures**: If your deployment fails, check the build logs in Vercel for errors.

3. **Application Errors**: If your application is deployed but not working correctly, check the function logs in Vercel. 
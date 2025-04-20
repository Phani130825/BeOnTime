# Deploying BeOnTime to Vercel

This guide will walk you through the process of deploying your BeOnTime application to Vercel.

## Prerequisites

1. A GitHub account
2. A Vercel account (you can sign up at [vercel.com](https://vercel.com) using your GitHub account)
3. A MongoDB Atlas account with a cluster set up

## Step 1: Push Your Code to GitHub

1. If you haven't already, initialize a Git repository in your project folder:
   ```bash
   git init
   ```

2. Add all your files to Git:
   ```bash
   git add .
   ```

3. Commit your changes:
   ```bash
   git commit -m "Initial commit"
   ```

4. Create a new repository on GitHub (don't initialize it with a README)

5. Connect your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/beontime.git
   ```

6. Push your code to GitHub:
   ```bash
   git push -u origin main
   ```
   (If your default branch is called "master" instead of "main", use `git push -u origin master`)

## Step 2: Deploy to Vercel

1. Log in to your Vercel account

2. Click "Add New..." and select "Project"

3. Import your GitHub repository:
   - Connect to GitHub if you haven't already
   - Select the "beontime" repository
   - Click "Import"

4. Configure your project:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npm install`
   - Output Directory: N/A
   - Install Command: `npm install`

5. Add Environment Variables:
   - Click "Environment Variables"
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

6. Click "Deploy"

## Step 3: Verify Your Deployment

1. After deployment completes, Vercel will provide you with a URL where your application is accessible

2. Test your application by:
   - Creating a new user account
   - Logging in
   - Creating and managing habits

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check the build logs in Vercel for errors
   - Make sure all dependencies are listed in package.json
   - Verify that the vercel.json file is correctly configured

2. **Connection Issues**:
   - Ensure your MongoDB Atlas connection string is correct
   - Check that your IP address is whitelisted in MongoDB Atlas
   - Verify that your MongoDB Atlas user has the correct permissions

3. **Environment Variables**:
   - Make sure all required environment variables are set in Vercel
   - Check for typos in variable names
   - Ensure values are correctly formatted

### Getting Help

If you encounter issues not covered here:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Visit the [Vercel support page](https://vercel.com/support)
3. Search for similar issues on [Stack Overflow](https://stackoverflow.com/questions/tagged/vercel) 
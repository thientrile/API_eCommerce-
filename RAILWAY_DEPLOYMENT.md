# Railway Deployment Guide

## Prerequisites
1. Railway account (https://railway.app/)
2. MongoDB Atlas account (https://cloud.mongodb.com/)
3. GitHub repository with your code
4. Your project code pushed to GitHub

## Quick Deployment Steps

### Step 1: Setup MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier available)
3. Create a database user:
   - Username: `your_username`
   - Password: `your_password`
4. Network Access: Add IP Address `0.0.0.0/0` (Allow access from anywhere)
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`

### Step 2: Deploy to Railway
1. Go to [Railway](https://railway.app/)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `API_eCommerce-`
5. Railway will automatically detect it's a Node.js project

### Step 3: Add Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your_database_name?retryWrites=true&w=majority
```

### Step 4: Add Redis Service
1. In Railway dashboard, click "New Service"
2. Select "Database" → "Redis"
3. Railway will automatically create a Redis instance
4. Copy the Redis URL from the "Connect" tab
5. Add to your environment variables:

```
REDIS_URL=redis://default:password@redis-url:port
```

### Step 5: Deploy
1. Push any final changes to GitHub
2. Railway will automatically redeploy
3. Check the deployment logs in Railway dashboard

## Environment Variables Reference
```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-address>/<database-name>?retryWrites=true&w=majority
REDIS_URL=redis://default:ROaBImRbyeUbvIbGSkghIWjFngGEKLHC@ballast.proxy.rlwy.net:50811
```

## Verification Steps
1. Check deployment logs for successful database connections
2. Test your API endpoints
3. Verify MongoDB and Redis connections in logs

## Troubleshooting
- Ensure all environment variables are set correctly
- Check that MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Verify Redis service is running in Railway dashboard
- Check deployment logs for connection errors

## Local Development
1. Copy `.env.example` to `.env`
2. Update environment variables with your local/development values
3. Run `npm run dev` for development with auto-reload

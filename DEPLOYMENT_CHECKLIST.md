# Deployment Checklist

## Pre-Deployment Checklist
- [ ] Code is pushed to GitHub repository
- [ ] MongoDB Atlas cluster is created and configured
- [ ] Database user created with proper permissions
- [ ] IP whitelist includes 0.0.0.0/0 for Railway access
- [ ] All environment variables are prepared
- [ ] Package.json has correct start script
- [ ] Dependencies are properly listed in package.json

## Railway Deployment Steps
- [ ] Railway account created/logged in
- [ ] New project created from GitHub repository
- [ ] Environment variables added:
  - [ ] NODE_ENV=production
  - [ ] PORT=3000
  - [ ] MONGODB_URI (MongoDB Atlas connection string)
  - [ ] REDIS_URL (Railway Redis service URL)
- [ ] Redis service added to Railway project
- [ ] Initial deployment completed successfully

## Post-Deployment Verification
- [ ] Application starts without errors
- [ ] MongoDB connection successful (check logs)
- [ ] Redis connection successful (check logs)
- [ ] API endpoints are accessible
- [ ] Health check endpoint responds
- [ ] Database operations work correctly

## Troubleshooting Checklist
If deployment fails, check:
- [ ] All environment variables are set correctly
- [ ] MongoDB Atlas IP whitelist includes 0.0.0.0/0
- [ ] MongoDB connection string is correct
- [ ] Redis service is running in Railway
- [ ] No syntax errors in code
- [ ] All dependencies are installed (check package.json)

## Useful Railway Commands
- View logs: Check Railway dashboard → your project → Deployments
- Restart service: Railway dashboard → your project → Settings → Restart
- Environment variables: Railway dashboard → your project → Variables

## MongoDB Atlas Connection String Format
```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

## Redis URL Format (Railway provides this automatically)
```
redis://default:<password>@<host>:<port>
```

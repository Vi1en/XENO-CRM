# Railway Deployment Guide

## 🚀 Deploy Frontend to Railway

### Step 1: Prepare the Repository
1. Make sure all changes are committed and pushed to GitHub
2. The frontend is in the `frontend/` directory

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository: `XENO-CRM`

### Step 3: Configure the Service
1. **Root Directory**: Set to `frontend`
2. **Build Command**: `npm ci && npm run build`
3. **Start Command**: `npm start`

### Step 4: Set Environment Variables
In Railway dashboard, go to Variables tab and add:

```
NODE_ENV=production
NEXTAUTH_URL=https://your-app-name.up.railway.app
NEXTAUTH_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=https://backend-production-05a7e.up.railway.app/api/v1
```

### Step 5: Deploy
1. Railway will automatically detect it's a Next.js app
2. It will build and deploy your frontend
3. You'll get a URL like: `https://your-app-name.up.railway.app`

### Step 6: Update NEXTAUTH_URL
1. After deployment, copy the Railway URL
2. Update the `NEXTAUTH_URL` variable in Railway dashboard
3. Redeploy if needed

## 🎯 Expected Result
- Clean, responsive dashboard
- Real data from your backend API
- Working authentication
- All features accessible

## 🔧 Troubleshooting
- Check Railway logs if deployment fails
- Ensure all environment variables are set
- Verify the backend API is accessible

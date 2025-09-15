# Google OAuth Setup Guide

## Quick Setup Steps

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Sign in with your Google account

### 2. Create or Select Project
- Click on the project dropdown at the top
- Create a new project or select existing one
- Name it something like "Xeno CRM"

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API" 
- Click on it and press "Enable"

### 4. Configure OAuth Consent Screen
- Go to "APIs & Services" → "OAuth consent screen"
- Choose "External" user type
- Fill in required fields:
  - App name: "Xeno CRM"
  - User support email: your email
  - Developer contact: your email
- Add authorized domains:
  - `myxcrm.netlify.app`
  - `backend-production-05a7e.up.railway.app`

### 5. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client ID"
- Choose "Web application"
- Add authorized redirect URIs:
  - `https://backend-production-05a7e.up.railway.app/api/v1/google/callback`
- Copy the Client ID and Client Secret

### 6. Set Environment Variables in Railway
- Go to your Railway project dashboard
- Go to "Variables" tab
- Add these environment variables:
  ```
  CLIENT_ID=your-google-client-id-here
  CLIENT_SECRET=your-google-client-secret-here
  JWT_SECRET=any-random-secret-string
  FRONTEND_URL=https://myxcrm.netlify.app
  BACKEND_URL=https://backend-production-05a7e.up.railway.app
  ```

### 7. Test the Setup
- Visit: https://myxcrm.netlify.app
- Click "Sign in with Google"
- You should be redirected to Google's login page

## Troubleshooting

### If you get "redirect_uri_mismatch" error:
- Make sure the redirect URI in Google Console exactly matches:
  `https://backend-production-05a7e.up.railway.app/api/v1/google/callback`

### If you get "CLIENT_ID not configured" error:
- Make sure you've set the CLIENT_ID environment variable in Railway
- Redeploy your Railway app after adding the variables

### If you get "Invalid client" error:
- Double-check your CLIENT_ID and CLIENT_SECRET
- Make sure they're set correctly in Railway

## Quick Test
You can test if your backend is receiving the environment variables by visiting:
https://backend-production-05a7e.up.railway.app/api/v1/google/login

It should either:
- Redirect to Google (if configured correctly)
- Return a helpful error message (if not configured)

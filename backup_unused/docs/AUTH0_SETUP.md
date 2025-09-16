# Auth0 Setup Guide

This guide explains how to configure Auth0 authentication for the Xeno CRM application.

## Backend Configuration

### Required Environment Variables

Add these environment variables to your Railway backend deployment:

```bash
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# Application URLs
FRONTEND_URL=https://myxcrm.netlify.app
BACKEND_URL=https://backend-production-05a7e.up.railway.app
```

### Auth0 Dashboard Configuration

1. **Create an Auth0 Application**:
   - Go to [Auth0 Dashboard](https://manage.auth0.com)
   - Navigate to Applications > Applications
   - Click "Create Application"
   - Choose "Regular Web Application"

2. **Configure Application Settings**:
   - **Allowed Callback URLs**: `https://backend-production-05a7e.up.railway.app/api/v1/auth/callback`
   - **Allowed Logout URLs**: `https://myxcrm.netlify.app`
   - **Allowed Web Origins**: `https://myxcrm.netlify.app`
   - **Allowed Origins (CORS)**: `https://myxcrm.netlify.app`

3. **Get Credentials**:
   - Copy the Domain, Client ID, and Client Secret
   - Add them to your Railway environment variables

## Authentication Flow

1. **Login**: User clicks "Sign in with Auth0" → Redirects to backend `/auth/login` → Redirects to Auth0 → User authenticates
2. **Callback**: Auth0 redirects to backend `/auth/callback` → Backend exchanges code for tokens → Backend creates JWT → Redirects to frontend with JWT
3. **Frontend**: Frontend receives JWT → Stores in localStorage → Uses for API calls
4. **Logout**: User clicks logout → Redirects to backend `/auth/logout` → Redirects to Auth0 logout → Redirects to frontend

## API Endpoints

- `POST /api/v1/auth/login` - Start Auth0 login flow
- `GET /api/v1/auth/callback` - Handle Auth0 callback
- `GET /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/verify` - Verify JWT token

## Frontend Integration

The frontend uses the `useAuth` hook which:
- Manages authentication state
- Handles login/logout
- Provides auth headers for API calls
- Automatically redirects unauthenticated users

## Debug Logs

The application includes extensive console logging for debugging:
- `🔐 Auth0 Login:` - Login flow initiation
- `🔄 Auth0 Callback:` - Callback processing
- `👋 Auth0 Logout:` - Logout processing
- `🔍 Auth0 Verify:` - Token verification
- `✅` - Success operations
- `❌` - Error operations

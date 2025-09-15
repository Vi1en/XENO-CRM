import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = Router();

// JWT secret for our own tokens
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${process.env.BACKEND_URL || 'https://backend-production-05a7e.up.railway.app'}/api/v1/google/callback`;

/**
 * @swagger
 * /api/v1/google/login:
 *   get:
 *     summary: Start Google OAuth login flow
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth login page
 *       500:
 *         description: Internal server error
 */
router.get('/login', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Google Login: Starting Google OAuth flow...');
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://myxcrm.netlify.app';
    
    console.log('🔐 Google Login: Frontend URL:', frontendUrl);
    console.log('🔐 Google Login: Google Client ID:', !!GOOGLE_CLIENT_ID);
    console.log('🔐 Google Login: Redirect URI:', GOOGLE_REDIRECT_URI);
    
    if (!GOOGLE_CLIENT_ID) {
      console.error('❌ Google Login: CLIENT_ID not configured');
      console.error('❌ Google Login: Available env vars:', {
        CLIENT_ID: !!process.env.CLIENT_ID,
        CLIENT_SECRET: !!process.env.CLIENT_SECRET,
        BACKEND_URL: process.env.BACKEND_URL,
        FRONTEND_URL: process.env.FRONTEND_URL
      });
      
      // Return a helpful error message
      return res.status(500).json({ 
        success: false, 
        message: 'Google OAuth not configured. Please set CLIENT_ID and CLIENT_SECRET environment variables in Railway.',
        debug: {
          CLIENT_ID: !!process.env.CLIENT_ID,
          CLIENT_SECRET: !!process.env.CLIENT_SECRET
        }
      });
    }
    
    // Generate Google OAuth authorization URL
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      scope: 'openid email profile',
      response_type: 'code',
      state: encodeURIComponent(frontendUrl),
      access_type: 'offline',
      prompt: 'consent'
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    console.log('🔐 Google Login: Generated auth URL:', authUrl);
    
    // Redirect to Google OAuth
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Google Login Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate Google login' 
    });
  }
});

/**
 * @swagger
 * /api/v1/google/callback:
 *   get:
 *     summary: Google OAuth callback handler
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to frontend with JWT token
 *       500:
 *         description: Internal server error
 */
router.get('/callback', async (req: Request, res: Response) => {
  try {
    console.log('🔄 Google Callback: Processing callback...');
    console.log('🔄 Google Callback: Query params:', req.query);
    
    const { code, state, error } = req.query;
    
    if (error) {
      console.error('❌ Google Callback: OAuth error:', error);
      return res.redirect(`${state}/login?error=oauth_error`);
    }
    
    if (!code || !state) {
      console.error('❌ Google Callback: Missing code or state parameter');
      return res.redirect(`${state}/login?error=missing_parameters`);
    }
    
    const frontendUrl = decodeURIComponent(state as string);
    console.log('🔄 Google Callback: Frontend URL from state:', frontendUrl);
    
    // Exchange code for tokens
    console.log('🔄 Google Callback: Exchanging code for tokens...');
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_REDIRECT_URI,
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    const tokenData = tokenResponse.data;
    console.log('🔄 Google Callback: Token exchange successful');
    console.log('🔄 Google Callback: Access token received:', !!tokenData.access_token);
    
    // Get user info from Google
    console.log('🔄 Google Callback: Getting user info from Google...');
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    const userInfo = userInfoResponse.data;
    console.log('🔄 Google Callback: User info received:', {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
    });
    
    // Create our own JWT token
    const ourJwt = jwt.sign(
      {
        userId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: 'google',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🔄 Google Callback: Our JWT token created');
    console.log('🔄 Google Callback: Redirecting to frontend with token...');
    
    // Redirect back to frontend with token
    const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(ourJwt)}`;
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('❌ Google Callback Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Google authentication failed' 
    });
  }
});

/**
 * @swagger
 * /api/v1/google/verify:
 *   post:
 *     summary: Verify JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Token is invalid
 */
router.post('/verify', (req: Request, res: Response) => {
  try {
    console.log('🔍 Google Verify: Verifying JWT token...');
    
    const { token } = req.body;
    
    if (!token) {
      console.log('❌ Google Verify: No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    // Verify our JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    console.log('✅ Google Verify: Token is valid');
    console.log('✅ Google Verify: User info:', {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    });
    
    res.json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        provider: decoded.provider,
      }
    });
    
  } catch (error) {
    console.error('❌ Google Verify Error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

export default router;

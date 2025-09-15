import { Router, Request, Response } from 'express';
import { AuthenticationClient } from 'auth0';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const router = Router();

// Initialize Auth0 client
const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN || '',
  clientId: process.env.AUTH0_CLIENT_ID || '',
  clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
});

// JWT secret for our own tokens
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Start Auth0 login flow
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Auth0 login page
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('🔐 Auth0 Login: Starting login flow...');
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://myxcrm.netlify.app';
    const backendUrl = process.env.BACKEND_URL || 'https://backend-production-05a7e.up.railway.app';
    
    console.log('🔐 Auth0 Login: Frontend URL:', frontendUrl);
    console.log('🔐 Auth0 Login: Backend URL:', backendUrl);
    
    // Generate Auth0 authorization URL manually
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.AUTH0_CLIENT_ID || '',
      redirect_uri: `${backendUrl}/api/v1/auth/callback`,
      scope: 'openid profile email',
      state: frontendUrl,
    });
    
    const authUrl = `https://${process.env.AUTH0_DOMAIN}/authorize?${params.toString()}`;
    
    console.log('🔐 Auth0 Login: Generated auth URL:', authUrl);
    
    // Redirect to Auth0
    res.redirect(authUrl);
  } catch (error) {
    console.error('❌ Auth0 Login Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate login' 
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/callback:
 *   get:
 *     summary: Auth0 callback handler
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
    console.log('🔄 Auth0 Callback: Processing callback...');
    console.log('🔄 Auth0 Callback: Query params:', req.query);
    
    const { code, state } = req.query;
    
    if (!code || !state) {
      console.error('❌ Auth0 Callback: Missing code or state parameter');
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters' 
      });
    }
    
    const frontendUrl = state as string;
    console.log('🔄 Auth0 Callback: Frontend URL from state:', frontendUrl);
    
    // Exchange code for tokens using direct HTTP call
    console.log('🔄 Auth0 Callback: Exchanging code for tokens...');
    const tokenResponse = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'authorization_code',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      code: code,
      redirect_uri: `${process.env.BACKEND_URL || 'https://backend-production-05a7e.up.railway.app'}/api/v1/auth/callback`,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const tokenData = tokenResponse.data;
    console.log('🔄 Auth0 Callback: Token exchange successful');
    console.log('🔄 Auth0 Callback: Access token received:', !!tokenData.access_token);
    
    // Get user info from Auth0
    console.log('🔄 Auth0 Callback: Getting user info from Auth0...');
    const userInfoResponse = await axios.get(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    const userInfo = userInfoResponse.data;
    console.log('🔄 Auth0 Callback: User info received:', {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name,
    });
    
    // Create our own JWT token
    const ourJwt = jwt.sign(
      {
        userId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: 'auth0',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🔄 Auth0 Callback: Our JWT token created');
    console.log('🔄 Auth0 Callback: Redirecting to frontend with token...');
    
    // Redirect back to frontend with token
    const redirectUrl = `${frontendUrl}/auth/callback?token=${encodeURIComponent(ourJwt)}`;
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('❌ Auth0 Callback Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal server error
 */
router.get('/logout', async (req: Request, res: Response) => {
  try {
    console.log('👋 Auth0 Logout: Processing logout...');
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://myxcrm.netlify.app';
    const auth0Domain = process.env.AUTH0_DOMAIN || '';
    
    console.log('👋 Auth0 Logout: Frontend URL:', frontendUrl);
    console.log('👋 Auth0 Logout: Auth0 Domain:', auth0Domain);
    
    // Auth0 logout URL
    const logoutUrl = `https://${auth0Domain}/v2/logout?returnTo=${encodeURIComponent(frontendUrl)}&client_id=${process.env.AUTH0_CLIENT_ID}`;
    
    console.log('👋 Auth0 Logout: Generated logout URL:', logoutUrl);
    console.log('👋 Auth0 Logout: Redirecting to Auth0 logout...');
    
    res.redirect(logoutUrl);
  } catch (error) {
    console.error('❌ Auth0 Logout Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Logout failed' 
    });
  }
});

/**
 * @swagger
 * /api/v1/auth/verify:
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
    console.log('🔍 Auth0 Verify: Verifying JWT token...');
    
    const { token } = req.body;
    
    if (!token) {
      console.log('❌ Auth0 Verify: No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    // Verify our JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    console.log('✅ Auth0 Verify: Token is valid');
    console.log('✅ Auth0 Verify: User info:', {
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
    console.error('❌ Auth0 Verify Error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

export default router;
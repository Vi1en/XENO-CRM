import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// JWT secret for our own tokens
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

/**
 * @swagger
 * /api/v1/demo/login:
 *   post:
 *     summary: Demo login for testing
 *     tags: [Authentication]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "demo@example.com"
 *     responses:
 *       200:
 *         description: Demo login successful
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log('🎭 Demo Login: Starting demo login...');
    
    const { email = 'demo@example.com' } = req.body;
    
    // Create a demo user
    const demoUser = {
      userId: 'demo-user-123',
      email: email,
      name: 'Demo User',
      picture: 'https://via.placeholder.com/150',
      provider: 'demo',
    };
    
    // Create our JWT token
    const ourJwt = jwt.sign(demoUser, JWT_SECRET, { expiresIn: '7d' });
    
    console.log('🎭 Demo Login: Demo JWT token created');
    console.log('🎭 Demo Login: User info:', demoUser);
    
    // Return the token directly (for demo purposes)
    res.json({
      success: true,
      token: ourJwt,
      user: demoUser,
      message: 'Demo login successful'
    });
    
  } catch (error) {
    console.error('❌ Demo Login Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Demo login failed' 
    });
  }
});

/**
 * @swagger
 * /api/v1/demo/verify:
 *   post:
 *     summary: Verify demo JWT token
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
    console.log('🔍 Demo Verify: Verifying JWT token...');
    
    const { token } = req.body;
    
    if (!token) {
      console.log('❌ Demo Verify: No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    // Verify our JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    console.log('✅ Demo Verify: Token is valid');
    console.log('✅ Demo Verify: User info:', {
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
    console.error('❌ Demo Verify Error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

export default router;

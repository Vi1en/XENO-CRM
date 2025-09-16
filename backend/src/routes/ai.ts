import { Router } from 'express';
import { z } from 'zod';
import { generateSegmentRules, generateMessageVariants, generateAnalyticsInsights, getAIHealthStatus } from '../services/ai-enhanced';
import { aiInsights } from '../services/ai-insights';
import { AnalyticsAIService } from '../services/analytics-ai';
import { Customer } from '../models/customer';
import { Campaign } from '../models/campaign';
import { Order } from '../models/order';

const router = Router();

// Validation schemas
const nlToSegmentSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
});

const messageVariantsSchema = z.object({
  objective: z.string().min(1, 'Objective is required'),
  tone: z.string().min(1, 'Tone is required'),
  offer: z.string().optional(),
  brandVoice: z.string().optional(),
});

/**
 * @swagger
 * /api/v1/ai/nl-to-segment:
 *   post:
 *     summary: Convert natural language to segment rules
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AISegmentRequest'
 *     responses:
 *       200:
 *         description: Segment rules generated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AISegmentResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/nl-to-segment', async (req, res) => {
  try {
    const { prompt } = nlToSegmentSchema.parse(req.body);
    
    console.log('🔍 AI Segment Generation - Input prompt:', prompt);
    const result = await generateSegmentRules(prompt);
    console.log('🔍 AI Segment Generation - Generated result:', JSON.stringify(result, null, 2));
    
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('AI NL to segment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/ai/message-variants:
 *   post:
 *     summary: Generate message variants
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - objective
 *               - tone
 *             properties:
 *               objective:
 *                 type: string
 *                 description: Campaign objective
 *                 example: "Increase sales of winter jackets"
 *               tone:
 *                 type: string
 *                 description: Message tone
 *                 example: "friendly and persuasive"
 *               offer:
 *                 type: string
 *                 description: Special offer or promotion
 *                 example: "20% off all winter jackets"
 *     responses:
 *       200:
 *         description: Message variants generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     variants:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid input data
 */
router.post('/message-variants', async (req, res) => {
  try {
    const { objective, tone, offer } = messageVariantsSchema.parse(req.body);
    
    const result = await generateMessageVariants(objective, tone, offer);
    
    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('AI message variants error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// AI Analytics endpoint
router.get('/analytics', async (req, res) => {
  try {
    console.log('🤖 Generating AI analytics...');
    
    // Fetch all data
    const [customers, campaigns, orders] = await Promise.all([
      Customer.find({}),
      Campaign.find({}),
      Order.find({})
    ]);

    // Generate AI insights
    const analytics = AnalyticsAIService.generateInsights(customers, campaigns, orders);
    
    console.log(`📊 Generated analytics: ${analytics.insights.length} insights`);
    
    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('AI analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});


/**
 * @swagger
 * /api/v1/ai/analytics:
 *   get:
 *     summary: Get AI-powered analytics insights
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Analytics insights generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', async (req, res) => {
  try {
    console.log('🤖 AI Analytics request received');
    const insights = await generateAnalyticsInsights();
    
    return res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('AI Analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/ai/dashboard-insights:
 *   get:
 *     summary: Get comprehensive dashboard insights
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Dashboard insights generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard-insights', async (req, res) => {
  try {
    console.log('📊 Dashboard insights request received');
    const insights = await aiInsights.getDashboardInsights();
    
    return res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    console.error('Dashboard insights error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/ai/health:
 *   get:
 *     summary: Get AI service health status
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: AI health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal server error
 */
router.get('/health', async (req, res) => {
  try {
    console.log('🔍 AI Health check request received');
    const healthStatus = await getAIHealthStatus();
    
    return res.json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    console.error('AI Health check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/ai/clear-cache:
 *   post:
 *     summary: Clear AI insights cache
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
router.post('/clear-cache', async (req, res) => {
  try {
    console.log('🗑️ AI Cache clear request received');
    aiInsights.clearCache();
    
    return res.json({
      success: true,
      message: 'AI insights cache cleared successfully',
    });
  } catch (error) {
    console.error('AI Cache clear error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export { router as aiRoutes };

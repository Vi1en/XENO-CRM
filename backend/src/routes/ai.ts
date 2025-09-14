import { Router } from 'express';
import { z } from 'zod';
import { generateSegmentRules, generateMessageVariants, generateCampaignSummary } from '../services/ai';
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
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Natural language description of the segment
 *                 example: "Customers who spent more than $100 in the last 30 days"
 *     responses:
 *       200:
 *         description: Segment rules generated
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
 *                     rules:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Invalid input data
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


export { router as aiRoutes };

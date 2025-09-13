import { Router } from 'express';
import { z } from 'zod';
import { publishToQueue } from '../services/rabbitmq';

const router = Router();

// Validation schema
const deliveryReceiptSchema = z.object({
  communicationLogId: z.string().min(1, 'Communication log ID is required'),
  status: z.enum(['SENT', 'FAILED', 'DELIVERED', 'BOUNCED']),
  vendorId: z.string().optional(),
  reason: z.string().optional(),
});

/**
 * @swagger
 * /api/v1/delivery/receipt:
 *   post:
 *     summary: Receive delivery receipt
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - communicationLogId
 *               - status
 *             properties:
 *               communicationLogId:
 *                 type: string
 *                 description: Communication log ID
 *               status:
 *                 type: string
 *                 enum: [SENT, FAILED, DELIVERED, BOUNCED]
 *                 description: Delivery status
 *               vendorId:
 *                 type: string
 *                 description: Vendor identifier
 *               reason:
 *                 type: string
 *                 description: Failure reason if status is FAILED
 *     responses:
 *       200:
 *         description: Receipt processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/receipt', async (req, res) => {
  try {
    // Validate request body
    const validatedData = deliveryReceiptSchema.parse(req.body);
    
    // Add timestamp
    const receiptData = {
      ...validatedData,
      receivedAt: new Date().toISOString(),
    };
    
    // Publish to RabbitMQ queue for batch processing
    await publishToQueue('queue.delivery.receipt', receiptData);
    
    console.log(`📥 Delivery receipt received for ${validatedData.communicationLogId}: ${validatedData.status}`);
    
    res.json({
      success: true,
      message: 'Receipt queued for processing',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Delivery receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export { router as deliveryRoutes };

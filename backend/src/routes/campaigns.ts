import { Router } from 'express';
import { z } from 'zod';
import { Campaign } from '../models/campaign';
import { Segment } from '../models/segment';
import { Customer } from '../models/customer';
import { generateCampaignSummary } from '../services/ai';
import { personalizeMessage, generateSmartPersonalizedMessage } from '../services/message-personalization';
import { CommunicationLog } from '../models/communication-log';
import { publishToQueue } from '../services/rabbitmq';
import mongoose from 'mongoose';

const router = Router();

// Validation schemas
const campaignCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  segmentId: z.string().min(1, 'Segment ID is required'),
  message: z.string().min(1, 'Message is required'),
  scheduledAt: z.string().datetime().optional(),
});

const campaignUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  segmentId: z.string().min(1, 'Segment ID is required').optional(),
  message: z.string().min(1, 'Message is required').optional(),
  scheduledAt: z.string().datetime().optional(),
});

// Helper function to build customer query from segment rules
function buildCustomerQueryFromSegment(rules: any[]): any {
  const query: any = {};
  
  for (const rule of rules) {
    const { field, operator, value } = rule;
    
    switch (operator) {
      case 'equals':
        query[field] = value;
        break;
      case 'not_equals':
        query[field] = { $ne: value };
        break;
      case 'greater_than':
        query[field] = { $gt: value };
        break;
      case 'less_than':
        query[field] = { $lt: value };
        break;
      case 'contains':
        query[field] = { $in: [value] };
        break;
      case 'not_contains':
        query[field] = { $nin: [value] };
        break;
      case 'in':
        query[field] = { $in: value };
        break;
      case 'not_in':
        query[field] = { $nin: value };
        break;
    }
  }
  
  return query;
}

/**
 * @swagger
 * /api/v1/campaigns:
 *   post:
 *     summary: Create campaign
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - segmentId
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 description: Campaign name
 *               description:
 *                 type: string
 *                 description: Campaign description
 *               segmentId:
 *                 type: string
 *                 description: Target segment ID
 *               message:
 *                 type: string
 *                 description: Campaign message
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled start time
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     campaignId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     totalRecipients:
 *                       type: integer
 *       400:
 *         description: Invalid input data
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, segmentId, message, scheduledAt } = campaignCreateSchema.parse(req.body);
    
    // Verify segment exists
    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found',
      });
    }
    
    // Get customers matching the segment with personalization data
    const query = buildCustomerQueryFromSegment(segment.rules);
    const customers = await Customer.find(query, {
      _id: 1,
      externalId: 1,
      email: 1,
      phone: 1,
      firstName: 1,
      lastName: 1,
      totalSpend: 1,
      visits: 1,
      lastOrderAt: 1,
      tags: 1,
    });
    
    // Create campaign
    const campaign = new Campaign({
      name,
      description,
      segmentId,
      message,
      status: scheduledAt ? 'scheduled' : 'draft',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      stats: {
        totalRecipients: customers.length,
        sent: 0,
        failed: 0,
        delivered: 0,
        bounced: 0,
      },
    });
    
    await campaign.save();
    
    // Create communication log entries with customer data for personalization
    const communicationLogs = customers.map((customer) => {
      const communicationLogId = new mongoose.Types.ObjectId().toString();
      return {
        communicationLogId,
        campaignId: (campaign._id as any).toString(),
        customerId: (customer._id as any).toString(),
        message,
        email: customer.email,
        phone: customer.phone,
        status: 'PENDING' as const,
        // Include customer data for personalization
        customerData: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          totalSpend: customer.totalSpend,
          visits: customer.visits,
          lastOrderAt: customer.lastOrderAt,
          tags: customer.tags,
        },
      };
    });
    
    await CommunicationLog.insertMany(communicationLogs);
    
    // If not scheduled, enqueue delivery jobs immediately with personalized messages
    if (!scheduledAt) {
      for (const log of communicationLogs) {
        // Personalize the message before queuing
        let personalizedMessage = log.message;
        if (log.customerData) {
          try {
            const personalized = generateSmartPersonalizedMessage(
              log.message,
              log.customerData
            );
            personalizedMessage = personalized.message;
            console.log(`🎯 Personalized message for ${log.customerData.firstName}: ${personalizedMessage}`);
          } catch (personalizationError) {
            console.warn('⚠️ Message personalization failed, using original message:', personalizationError);
          }
        }
        
        // Queue with personalized message
        await publishToQueue('queue.campaign.delivery', {
          ...log,
          message: personalizedMessage,
        });
      }
      
      // Update campaign status
      campaign.status = 'running';
      campaign.startedAt = new Date();
      await campaign.save();
    }
    
    return res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: {
        campaignId: campaign._id,
        name: campaign.name,
        totalRecipients: campaign.stats.totalRecipients,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Campaign creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/campaigns:
 *   get:
 *     summary: List campaigns
 *     tags: [Campaigns]
 *     responses:
 *       200:
 *         description: List of campaigns with stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                       stats:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({}, {
      name: 1,
      description: 1,
      status: 1,
      stats: 1,
      createdAt: 1,
    } as any).sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    console.error('List campaigns error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   get:
 *     summary: Get campaign details
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign details with recipients
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
 *                     campaign:
 *                       type: object
 *                     recipients:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Campaign not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }
    
    // Get communication logs for this campaign
    const recipients = await CommunicationLog.find(
      { campaignId: id },
      {
        communicationLogId: 1,
        customerId: 1,
        status: 1,
        sentAt: 1,
        deliveredAt: 1,
        reason: 1,
      }
    ).populate('customerId', 'externalId email firstName lastName');
    
    return res.json({
      success: true,
      data: {
        campaign,
        recipients,
      },
    });
  } catch (error) {
    console.error('Get campaign details error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   get:
 *     summary: Get campaign by ID
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign details
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
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     segmentId:
 *                       type: string
 *                     message:
 *                       type: string
 *                     status:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: Campaign not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findById(id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }
    
    return res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   put:
 *     summary: Update campaign
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Campaign name
 *               description:
 *                 type: string
 *                 description: Campaign description
 *               segmentId:
 *                 type: string
 *                 description: Target segment ID
 *               message:
 *                 type: string
 *                 description: Campaign message
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled send time
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       404:
 *         description: Campaign not found
 *       400:
 *         description: Invalid input data
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = campaignUpdateSchema.parse(req.body);
    
    const campaign = await Campaign.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Update campaign error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/{id}:
 *   delete:
 *     summary: Delete campaign
 *     tags: [Campaigns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Campaign not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await Campaign.findByIdAndDelete(id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/{id}/summary:
 *   get:
 *     summary: Generate AI campaign summary
 *     tags: [Campaigns, AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Campaign ID
 *     responses:
 *       200:
 *         description: AI-generated campaign summary
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
 *                     summary:
 *                       type: string
 *       404:
 *         description: Campaign not found
 */
router.get('/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;
    
    const summary = await generateCampaignSummary(id);
    
    return res.json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    console.error('AI campaign summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/campaigns/test-personalization:
 *   post:
 *     summary: Test message personalization
 *     tags: [Campaigns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - customerId
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message template to personalize
 *               customerId:
 *                 type: string
 *                 description: Customer ID to personalize for
 *     responses:
 *       200:
 *         description: Personalized message generated
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
 *                     originalMessage:
 *                       type: string
 *                     personalizedMessage:
 *                       type: string
 *                     customerData:
 *                       type: object
 *       404:
 *         description: Customer not found
 */
router.post('/test-personalization', async (req, res) => {
  try {
    const { message, customerId } = req.body;
    
    if (!message || !customerId) {
      return res.status(400).json({
        success: false,
        message: 'Message and customerId are required',
      });
    }
    
    // Get customer data
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }
    
    // Generate personalized message
    const personalized = generateSmartPersonalizedMessage(message, {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      totalSpend: customer.totalSpend,
      visits: customer.visits,
      lastOrderAt: customer.lastOrderAt,
      tags: customer.tags,
    });
    
    return res.json({
      success: true,
      data: {
        originalMessage: message,
        personalizedMessage: personalized.message,
        customerData: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          totalSpend: customer.totalSpend,
          visits: customer.visits,
          lastOrderAt: customer.lastOrderAt,
          tags: customer.tags,
        },
      },
    });
  } catch (error) {
    console.error('Personalization test error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Test endpoint to update campaign stats
router.put('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const { sent, delivered, failed, bounced } = req.body;
    
    const campaign = await Campaign.findByIdAndUpdate(id, {
      $set: {
        'stats.sent': sent || 0,
        'stats.delivered': delivered || 0,
        'stats.failed': failed || 0,
        'stats.bounced': bounced || 0,
      }
    }, { new: true });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'Campaign stats updated successfully',
      data: campaign,
    });
  } catch (error) {
    console.error('Campaign stats update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Send campaign endpoint
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid campaign ID',
      });
    }

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    if (campaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Campaign can only be sent if it is in draft status',
      });
    }

    // Get segment and customers
    const segment = await Segment.findById(campaign.segmentId);
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found',
      });
    }

    // Build customer query from segment rules
    const customerQuery = buildCustomerQuery(segment.rules);
    const customers = await Customer.find(customerQuery);

    if (customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No customers found for this segment',
      });
    }

    // Update campaign status
    campaign.status = 'running';
    campaign.startedAt = new Date();
    campaign.stats = {
      totalRecipients: customers.length,
      sent: 0,
      failed: 0,
      delivered: 0,
      bounced: 0,
    };
    await campaign.save();

    // Create communication logs and queue messages
    const communicationLogs = [];
    for (const customer of customers) {
      const personalizedMessage = generateSmartPersonalizedMessage(
        campaign.message,
        customer
      );

      const communicationLog = new CommunicationLog({
        campaignId: campaign._id,
        customerId: customer._id,
        message: personalizedMessage,
        status: 'PENDING',
        customerData: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          totalSpend: customer.totalSpend,
          visits: customer.visits,
          lastOrderAt: customer.lastOrderAt,
          tags: customer.tags,
        },
      });
      await communicationLog.save();
      communicationLogs.push(communicationLog);

      // Queue message for delivery
      await publishToQueue('campaign-delivery', {
        communicationLogId: communicationLog._id,
        customerId: customer._id,
        message: personalizedMessage,
        campaignId: campaign._id,
      });
    }

    return res.json({
      success: true,
      message: 'Campaign sent successfully',
      data: {
        campaignId: campaign._id,
        totalRecipients: customers.length,
        communicationLogs: communicationLogs.length,
      },
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export { router as campaignsRoutes };

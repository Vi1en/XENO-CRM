import { Router } from 'express';
import { z } from 'zod';
import { Segment, ISegmentRule } from '../models/segment';
import { Customer } from '../models/customer';

const router = Router();

// Validation schemas
const segmentRuleSchema = z.object({
  field: z.enum(['totalSpend', 'visits', 'lastOrderAt', 'tags']),
  operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains', 'in', 'not_in']),
  value: z.any(),
});

const segmentPreviewSchema = z.object({
  rules: z.array(segmentRuleSchema),
});

const segmentCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  rules: z.array(segmentRuleSchema),
});

const segmentUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  rules: z.array(segmentRuleSchema).optional(),
});

// Helper function to build MongoDB query from rules
function buildCustomerQuery(rules: any[]): any {
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
 * /api/v1/segments/preview:
 *   post:
 *     summary: Preview segment count
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rules
 *             properties:
 *               rules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       enum: [totalSpend, visits, lastOrderAt, tags]
 *                     operator:
 *                       type: string
 *                       enum: [equals, not_equals, greater_than, less_than, contains, not_contains, in, not_in]
 *                     value:
 *                       type: any
 *     responses:
 *       200:
 *         description: Segment preview count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       400:
 *         description: Invalid input data
 */
router.post('/preview', async (req, res) => {
  try {
    const { rules } = segmentPreviewSchema.parse(req.body);
    
    const query = buildCustomerQuery(rules);
    const count = await Customer.countDocuments(query);
    
    return res.json({ count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Segment preview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/segments:
 *   post:
 *     summary: Create segment
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rules
 *             properties:
 *               name:
 *                 type: string
 *                 description: Segment name
 *               description:
 *                 type: string
 *                 description: Segment description
 *               rules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       enum: [totalSpend, visits, lastOrderAt, tags]
 *                     operator:
 *                       type: string
 *                       enum: [equals, not_equals, greater_than, less_than, contains, not_contains, in, not_in]
 *                     value:
 *                       type: any
 *     responses:
 *       201:
 *         description: Segment created successfully
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
 *                     segmentId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     customerCount:
 *                       type: integer
 *       400:
 *         description: Invalid input data
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, rules } = segmentCreateSchema.parse(req.body);
    
    // Count customers matching the rules
    const query = buildCustomerQuery(rules);
    const customerCount = await Customer.countDocuments(query);
    
    // Create segment
    const segment = new Segment({
      name,
      description,
      rules,
      customerCount,
    });
    
    await segment.save();
    
    return res.status(201).json({
      success: true,
      message: 'Segment created successfully',
      data: {
        segmentId: segment._id,
        name: segment.name,
        customerCount: segment.customerCount,
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
    
    console.error('Segment creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/segments:
 *   get:
 *     summary: List segments
 *     tags: [Segments]
 *     responses:
 *       200:
 *         description: List of segments
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
 *                       customerCount:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/', async (req, res) => {
  try {
    const segments = await Segment.find({}, {
      name: 1,
      description: 1,
      customerCount: 1,
      createdAt: 1,
    }).sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      data: segments,
    });
  } catch (error) {
    console.error('List segments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/segments/{id}:
 *   get:
 *     summary: Get segment by ID
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment details
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
 *                     rules:
 *                       type: array
 *                     customerCount:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *       404:
 *         description: Segment not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const segment = await Segment.findById(id);
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found',
      });
    }
    
    return res.json({
      success: true,
      data: segment,
    });
  } catch (error) {
    console.error('Get segment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/segments/{id}:
 *   put:
 *     summary: Update segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Segment name
 *               description:
 *                 type: string
 *                 description: Segment description
 *               rules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     field:
 *                       type: string
 *                       enum: [totalSpend, visits, lastOrderAt, tags]
 *                     operator:
 *                       type: string
 *                       enum: [equals, not_equals, greater_than, less_than, contains, not_contains, in, not_in]
 *                     value:
 *                       type: any
 *     responses:
 *       200:
 *         description: Segment updated successfully
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
 *         description: Segment not found
 *       400:
 *         description: Invalid input data
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = segmentUpdateSchema.parse(req.body);
    
    // If rules are being updated, recalculate customer count
    let customerCount = undefined;
    if (updateData.rules) {
      const query = buildCustomerQuery(updateData.rules);
      customerCount = await Customer.countDocuments(query);
    }
    
    const updatePayload: any = { ...updateData, updatedAt: new Date() };
    if (customerCount !== undefined) {
      updatePayload.customerCount = customerCount;
    }
    
    const segment = await Segment.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true, runValidators: true }
    );
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'Segment updated successfully',
      data: segment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Update segment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/segments/{id}:
 *   delete:
 *     summary: Delete segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment deleted successfully
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
 *         description: Segment not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const segment = await Segment.findByIdAndDelete(id);
    
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found',
      });
    }
    
    return res.json({
      success: true,
      message: 'Segment deleted successfully',
    });
  } catch (error) {
    console.error('Delete segment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export { router as segmentsRoutes };

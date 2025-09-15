import { Router } from 'express';
import { Customer } from '../models/customer';
import { z } from 'zod';

const router = Router();

// Customer creation schema
const customerCreateSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  totalSpend: z.number().min(0).default(0),
  visits: z.number().min(0).default(0),
  lastOrderAt: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
});

/**
 * @swagger
 * /api/v1/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: List of customers
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
 *                     $ref: '#/components/schemas/Customer'
 *       500:
 *         description: Internal server error
 */
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer email address
 *               firstName:
 *                 type: string
 *                 description: Customer first name
 *               lastName:
 *                 type: string
 *                 description: Customer last name
 *               phone:
 *                 type: string
 *                 description: Customer phone number
 *               totalSpend:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *                 description: Total amount spent by customer
 *               visits:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Number of visits
 *               lastOrderAt:
 *                 type: string
 *                 format: date-time
 *                 description: Date of last order
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Customer tags
 *     responses:
 *       201:
 *         description: Customer created successfully
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
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
  try {
    const validatedData = customerCreateSchema.parse(req.body);
    
    // Generate externalId if not provided
    const externalId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    const customer = new Customer({
      ...validatedData,
      externalId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await customer.save();
    
    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    
    console.error('Error creating customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }
    return res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Customer'
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }
    return res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer deleted successfully
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
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }
    return res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/customers/analytics:
 *   get:
 *     summary: Get customer analytics and segmentation data
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Customer analytics data
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
 *                     customerSegments:
 *                       type: object
 *                       properties:
 *                         vip:
 *                           type: number
 *                           description: Number of VIP customers
 *                         premium:
 *                           type: number
 *                           description: Number of premium customers
 *                         regular:
 *                           type: number
 *                           description: Number of regular customers
 *                     campaignPerformance:
 *                       type: object
 *                       properties:
 *                         running:
 *                           type: number
 *                           description: Number of running campaigns
 *                         completed:
 *                           type: number
 *                           description: Number of completed campaigns
 *                         scheduled:
 *                           type: number
 *                           description: Number of scheduled campaigns
 *       500:
 *         description: Internal server error
 */
router.get('/analytics', async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    
    // Calculate customer segments based on total spend
    const vipCustomers = await Customer.countDocuments({ totalSpend: { $gte: 1000 } });
    const premiumCustomers = await Customer.countDocuments({ 
      totalSpend: { $gte: 500, $lt: 1000 } 
    });
    const regularCustomers = totalCustomers - vipCustomers - premiumCustomers;
    
    return res.json({
      success: true,
      data: {
        customerSegments: {
          vip: vipCustomers,
          premium: premiumCustomers,
          regular: regularCustomers
        },
        campaignPerformance: {
          running: 0, // This would come from campaigns collection
          completed: 0,
          scheduled: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/customers/segments:
 *   get:
 *     summary: Get customer segments count
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: Customer segments count
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
 *                     segments:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *       500:
 *         description: Internal server error
 */
router.get('/segments', async (req, res) => {
  try {
    console.log('📊 Fetching customer segments...');
    
    // Get all customers and process them in JavaScript instead of MongoDB aggregation
    const customers = await Customer.find({});
    console.log('📊 Total customers found:', customers.length);
    
    if (customers.length === 0) {
      return res.json({
        success: true,
        data: { segments: { regular: 0 } }
      });
    }
    
    // Get a sample customer to see the structure
    console.log('📊 Sample customer structure:', customers[0]);
    
    // Process customers to count segments
    const segments: { [key: string]: number } = {};
    let regularCount = 0;
    
    customers.forEach(customer => {
      if (customer.tags && Array.isArray(customer.tags) && customer.tags.length > 0) {
        // Customer has tags, count each tag
        customer.tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            segments[tag] = (segments[tag] || 0) + 1;
          }
        });
      } else {
        // Customer has no tags, count as regular
        regularCount++;
      }
    });
    
    // Add regular count if there are any
    if (regularCount > 0) {
      segments['regular'] = regularCount;
    }

    console.log('📊 Final segments:', segments);

    return res.json({
      success: true,
      data: { segments }
    });
  } catch (error) {
    console.error('❌ Error fetching customer segments:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customer segments',
      details: error.message
    });
  }
});

export { router as customersRoutes };


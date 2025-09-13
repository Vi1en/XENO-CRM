import { Router } from 'express';
import { z } from 'zod';
import { publishToQueue } from '../services/rabbitmq';

const router = Router();

// Validation schemas
const customerSchema = z.object({
  externalId: z.string().min(1, 'External ID is required'),
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  totalSpend: z.number().min(0, 'Total spend must be non-negative'),
  visits: z.number().int().min(0, 'Visits must be non-negative integer'),
  lastOrderAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const orderSchema = z.object({
  externalId: z.string().min(1, 'External ID is required'),
  customerExternalId: z.string().min(1, 'Customer external ID is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  status: z.enum(['pending', 'completed', 'cancelled', 'refunded']),
  items: z.array(z.object({
    productId: z.string(),
    name: z.string(),
    quantity: z.number().int().min(1),
    price: z.number().min(0),
  })).optional(),
  orderDate: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

/**
 * @swagger
 * /api/v1/ingest/customers:
 *   post:
 *     summary: Ingest customer data
 *     tags: [Ingestion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - externalId
 *               - email
 *               - firstName
 *               - lastName
 *             properties:
 *               externalId:
 *                 type: string
 *                 description: Unique external identifier for the customer
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
 *                 description: Total amount spent by customer
 *               visits:
 *                 type: integer
 *                 minimum: 0
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
 *       200:
 *         description: Customer data successfully queued for processing
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
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/customers', async (req, res) => {
  try {
    // Validate request body
    const validatedData = customerSchema.parse(req.body);
    
    // Add timestamps
    const customerData = {
      ...validatedData,
      createdAt: validatedData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Publish to RabbitMQ queue
    await publishToQueue('queue.customers.ingest', customerData);
    
    res.json({
      success: true,
      message: 'Customer data queued for processing',
      data: {
        externalId: customerData.externalId,
        email: customerData.email,
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
    
    console.error('Customer ingestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/ingest/orders:
 *   post:
 *     summary: Ingest order data
 *     tags: [Ingestion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - externalId
 *               - customerExternalId
 *               - amount
 *               - currency
 *               - status
 *               - orderDate
 *             properties:
 *               externalId:
 *                 type: string
 *                 description: Unique external identifier for the order
 *               customerExternalId:
 *                 type: string
 *                 description: External ID of the customer who placed the order
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 description: Order amount
 *               currency:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *                 description: Order currency code
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled, refunded]
 *                 description: Order status
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                 description: Order items
 *               orderDate:
 *                 type: string
 *                 format: date-time
 *                 description: Order date
 *     responses:
 *       200:
 *         description: Order data successfully queued for processing
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
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/orders', async (req, res) => {
  try {
    // Validate request body
    const validatedData = orderSchema.parse(req.body);
    
    // Add timestamps
    const orderData = {
      ...validatedData,
      createdAt: validatedData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Publish to RabbitMQ queue
    await publishToQueue('queue.orders.ingest', orderData);
    
    res.json({
      success: true,
      message: 'Order data queued for processing',
      data: {
        externalId: orderData.externalId,
        customerExternalId: orderData.customerExternalId,
        amount: orderData.amount,
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
    
    console.error('Order ingestion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export { router as ingestionRoutes };

import { Router } from 'express';
import { z } from 'zod';
import { Order } from '../models/order';
import { Customer } from '../models/customer';

const router = Router();

// Helper function to parse date from various formats
function parseDate(dateString: string): Date {
  if (!dateString) return new Date();
  
  // Try DD/MM/YYYY format first
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  
  // Try YYYY-MM-DD format
  if (dateString.includes('-')) {
    return new Date(dateString);
  }
  
  // Try ISO string
  return new Date(dateString);
}

// Validation schemas
const orderCreateSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  totalSpent: z.number().min(0, 'Total spent must be positive'),
  date: z.string().optional(),
});

const orderUpdateSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').optional(),
  totalSpent: z.number().min(0, 'Total spent must be positive').optional(),
  date: z.string().optional(),
});

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name
 *     responses:
 *       200:
 *         description: List of orders
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = { customerName: { $regex: search, $options: 'i' } };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(query);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/orders/test:
 *   get:
 *     summary: Test orders endpoint
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Test successful
 */
router.get('/test', (req, res) => {
  return res.json({ success: true, message: 'Orders route is working' });
});

// Debug endpoint
router.get('/debug', async (req, res) => {
  try {
    // Test Order model
    const testOrder = new Order({
      customerName: 'test customer',
      totalSpent: 100,
      date: new Date()
    });
    
    return res.json({ 
      success: true, 
      message: 'Order model test successful',
      orderId: testOrder.orderId 
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Order model test failed',
      error: error.message
    });
  }
});

// Simple delete test endpoint
router.delete('/test-delete/:id', async (req, res) => {
  try {
    console.log('🧪 Test delete endpoint called with ID:', req.params.id);
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found for test',
      });
    }
    
    await Order.findByIdAndDelete(req.params.id);
    
    return res.json({
      success: true,
      message: 'Test order deleted successfully',
    });
  } catch (error) {
    console.error('Test delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test delete failed',
      error: error.message
    });
  }
});

// Simple test endpoint
router.post('/test-create', async (req, res) => {
  try {
    console.log('Test create request:', req.body);
    
    // Test customer lookup
    const customer = await Customer.findOne({
      $expr: {
        $eq: [
          { $concat: ['$firstName', ' ', '$lastName'] },
          'jonan puro'
        ]
      }
    });
    
    console.log('Customer found:', customer ? 'Yes' : 'No');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    // Test order creation
    const order = new Order({
      customerName: 'jonan puro',
      totalSpent: 1000,
      date: new Date()
    });
    
    await order.save();
    
    return res.json({
      success: true,
      message: 'Test order created successfully',
      data: order
    });
  } catch (error: any) {
    console.error('Test create error:', error);
    return res.status(500).json({
      success: false,
      message: 'Test create failed',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - totalSpent
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: Customer name
 *               totalSpent:
 *                 type: number
 *                 description: Total amount spent
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Order date
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Order'
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
router.post('/', async (req, res) => {
  try {
    console.log('Order creation request:', req.body);
    const { customerName, totalSpent, date } = orderCreateSchema.parse(req.body);
    console.log('Parsed data:', { customerName, totalSpent, date });
    
    // Find customer by name
    console.log('Looking for customer:', customerName);
    const customer = await Customer.findOne({
      $expr: {
        $eq: [
          { $concat: ['$firstName', ' ', '$lastName'] },
          customerName
        ]
      }
    });
    console.log('Found customer:', customer ? 'Yes' : 'No');
    console.log('Customer details:', customer ? { firstName: customer.firstName, lastName: customer.lastName, totalSpend: customer.totalSpend } : 'Not found');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found. Please create the customer first.',
      });
    }

    // Create order
    const order = new Order({
      customerName,
      totalSpent,
      date: parseDate(date || ''),
    });

    await order.save();

    // Update customer's totalSpend
    customer.totalSpend += totalSpent;
    await customer.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('Create order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: Customer name
 *               totalSpent:
 *                 type: number
 *                 description: Total amount spent
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Order date
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
router.put('/:id', async (req, res) => {
  try {
    const { customerName, totalSpent, date } = orderUpdateSchema.parse(req.body);
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Store old values for customer update
    const oldTotalSpent = order.totalSpent;
    const oldCustomerName = order.customerName;

    // Update order
    if (customerName) order.customerName = customerName;
    if (totalSpent !== undefined) order.totalSpent = totalSpent;
    if (date) order.date = parseDate(date);

    await order.save();

    // Update customer's totalSpend
    if (oldCustomerName !== customerName || oldTotalSpent !== totalSpent) {
      // Find old customer and subtract old amount
      const oldCustomer = await Customer.findOne({
        $expr: {
          $eq: [
            { $concat: ['$firstName', ' ', '$lastName'] },
            oldCustomerName
          ]
        }
      });

      if (oldCustomer) {
        oldCustomer.totalSpend -= oldTotalSpent;
        await oldCustomer.save();
      }

      // Find new customer and add new amount
      const newCustomer = await Customer.findOne({
        $expr: {
          $eq: [
            { $concat: ['$firstName', ' ', '$lastName'] },
            order.customerName
          ]
        }
      });

      if (newCustomer) {
        newCustomer.totalSpend += order.totalSpent;
        await newCustomer.save();
      }
    }

    return res.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('Update order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️ Delete order request:', req.params.id);
    console.log('🗑️ Order ID type:', typeof req.params.id);
    console.log('🗑️ Order ID length:', req.params.id?.length);
    
    // Validate order ID
    if (!req.params.id || typeof req.params.id !== 'string') {
      console.error('❌ Invalid order ID provided');
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findById(req.params.id);
    console.log('🗑️ Order found:', order ? 'Yes' : 'No');
    console.log('🗑️ Order details:', order ? { _id: order._id, customerName: order.customerName, totalSpent: order.totalSpent } : 'Not found');
    
    if (!order) {
      console.log('❌ Order not found in database');
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Try to find customer and update totalSpend (with error handling)
    try {
      console.log('🗑️ Looking for customer:', order.customerName);
      const customer = await Customer.findOne({
        $expr: {
          $eq: [
            { $concat: ['$firstName', ' ', '$lastName'] },
            order.customerName
          ]
        }
      });
      console.log('🗑️ Customer found:', customer ? 'Yes' : 'No');
      console.log('🗑️ Customer details:', customer ? { firstName: customer.firstName, lastName: customer.lastName, totalSpend: customer.totalSpend } : 'Not found');

      if (customer) {
        console.log('🗑️ Updating customer totalSpend from', customer.totalSpend, 'to', customer.totalSpend - order.totalSpent);
        customer.totalSpend -= order.totalSpent;
        await customer.save();
        console.log('🗑️ Customer updated successfully');
      } else {
        console.log('⚠️ Customer not found, proceeding with order deletion only');
      }
    } catch (customerError) {
      console.error('⚠️ Error updating customer (non-fatal):', customerError);
      // Continue with order deletion even if customer update fails
    }

    // Delete the order
    console.log('🗑️ Deleting order from database...');
    const deleteResult = await Order.findByIdAndDelete(req.params.id);
    console.log('🗑️ Order delete result:', deleteResult ? 'Success' : 'Failed');
    
    if (!deleteResult) {
      console.error('❌ Order deletion failed - no document was deleted');
      return res.status(500).json({
        success: false,
        message: 'Failed to delete order',
      });
    }

    console.log('✅ Order deleted successfully');
    return res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete order error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/v1/orders/trends:
 *   get:
 *     summary: Get revenue trends and growth data
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Revenue trends data
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
 *                     customerGrowth:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           value:
 *                             type: number
 *                     revenueTrend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                           value:
 *                             type: number
 *       500:
 *         description: Internal server error
 */
router.get('/trends', async (req, res) => {
  try {
    const months = ['Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25'];
    
    // Generate mock trends data based on actual orders
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSpent' } } }
    ]);
    
    const revenue = totalRevenue[0]?.total || 0;
    
    const customerGrowth = months.map((month, index) => ({
      month,
      value: index < 4 ? 0 : Math.round(totalOrders * (index - 3) * 0.3)
    }));
    
    const revenueTrend = months.map((month, index) => ({
      month,
      value: Math.round(revenue * (index + 1) * 0.2)
    }));
    
    return res.json({
      success: true,
      data: {
        customerGrowth,
        revenueTrend
      }
    });
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export { router as orderRoutes };

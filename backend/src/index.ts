import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import { ingestionRoutes } from './routes/ingestion';
import { customersRoutes } from './routes/customers';
import { segmentsRoutes } from './routes/segments';
import { campaignsRoutes } from './routes/campaigns';
import { deliveryRoutes } from './routes/delivery';
import { aiRoutes } from './routes/ai';
import { orderRoutes } from './routes/orders';
import authRoutes from './routes/auth';
import auth0Routes from './routes/auth0';
import googleAuthRoutes from './routes/google-auth';
import { connectToDatabase } from './services/database';
import { connectToRabbitMQ } from './services/rabbitmq';

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS configuration - Allow specific origins with fallback
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://myxcrm.netlify.app',
      'https://xeno-crm-frontend.onrender.com',
      'https://xeno-crm-frontend-sigma.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS: Allowing origin:', origin);
      callback(null, true); // Allow all origins for now
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Additional CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});


// Routes
app.use('/api/v1/ingest', ingestionRoutes);
app.use('/api/v1/customers', customersRoutes);
app.use('/api/v1/segments', segmentsRoutes);
app.use('/api/v1/campaigns', campaignsRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/auth', auth0Routes);
app.use('/api/v1/google', googleAuthRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Documentation JSON endpoint
app.get('/api/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Simple OpenAPI 3.1.0 specification
  const swaggerSpec = {
    openapi: '3.1.0',
    info: {
      title: 'Xeno CRM API',
      version: '1.0.0',
      description: 'A comprehensive mini CRM system with AI-powered segmentation and campaign management',
      contact: {
        name: 'Xeno CRM Team',
        email: 'support@xenocrm.com',
      },
    },
    servers: [
      {
        url: 'https://backend-production-05a7e.up.railway.app/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from Google OAuth authentication',
        },
      },
      schemas: {
        Customer: {
          type: 'object',
          required: ['firstName', 'lastName', 'email'],
          properties: {
            _id: { type: 'string', description: 'Unique customer identifier' },
            firstName: { type: 'string', description: 'Customer first name' },
            lastName: { type: 'string', description: 'Customer last name' },
            email: { type: 'string', format: 'email', description: 'Customer email address' },
            phone: { type: 'string', description: 'Customer phone number' },
            visits: { type: 'integer', minimum: 0, description: 'Number of customer visits' },
            tags: { type: 'array', items: { type: 'string' }, description: 'Customer tags for segmentation' },
            lastOrderAt: { type: 'string', format: 'date-time', description: 'Date of last order' },
            createdAt: { type: 'string', format: 'date-time', description: 'Customer creation date' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update date' },
          },
        },
        Segment: {
          type: 'object',
          required: ['name', 'description', 'rules'],
          properties: {
            _id: { type: 'string', description: 'Unique segment identifier' },
            name: { type: 'string', description: 'Segment name' },
            description: { type: 'string', description: 'Segment description' },
            rules: { type: 'array', items: { type: 'object' }, description: 'Array of filtering rules' },
            customerCount: { type: 'integer', minimum: 0, description: 'Number of customers in this segment' },
            createdAt: { type: 'string', format: 'date-time', description: 'Segment creation date' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update date' },
          },
        },
        Campaign: {
          type: 'object',
          required: ['name', 'description', 'segmentId', 'message'],
          properties: {
            _id: { type: 'string', description: 'Unique campaign identifier' },
            name: { type: 'string', description: 'Campaign name' },
            description: { type: 'string', description: 'Campaign description' },
            type: { type: 'string', enum: ['email', 'sms', 'push', 'social'], description: 'Campaign type' },
            status: { type: 'string', enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'], description: 'Campaign status' },
            segmentId: { type: 'string', description: 'Target segment ID' },
            message: { type: 'string', description: 'Campaign message content' },
            sentCount: { type: 'integer', minimum: 0, description: 'Number of messages sent' },
            openRate: { type: 'number', minimum: 0, maximum: 100, description: 'Email open rate percentage' },
            clickRate: { type: 'number', minimum: 0, maximum: 100, description: 'Click-through rate percentage' },
            scheduledAt: { type: 'string', format: 'date-time', description: 'Scheduled send date' },
            createdAt: { type: 'string', format: 'date-time', description: 'Campaign creation date' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update date' },
          },
        },
        Order: {
          type: 'object',
          required: ['customerId', 'items', 'totalAmount'],
          properties: {
            _id: { type: 'string', description: 'Unique order identifier' },
            customerId: { type: 'string', description: 'Customer ID who placed the order' },
            items: { type: 'array', items: { type: 'object' }, description: 'Order items' },
            totalAmount: { type: 'number', minimum: 0, description: 'Total order amount' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'], description: 'Order status' },
            shippingAddress: { type: 'object', description: 'Shipping address' },
            paymentMethod: { type: 'string', description: 'Payment method used' },
            createdAt: { type: 'string', format: 'date-time', description: 'Order creation date' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update date' },
          },
        },
        Success: {
          type: 'object',
          required: ['success'],
          properties: {
            success: { type: 'boolean', description: 'Operation success status' },
            message: { type: 'string', description: 'Success message' },
            data: { type: 'object', description: 'Response data' },
          },
        },
        Error: {
          type: 'object',
          required: ['error'],
          properties: {
            error: { type: 'string', description: 'Error message' },
            message: { type: 'string', description: 'Detailed error message' },
            statusCode: { type: 'integer', description: 'HTTP status code' },
          },
        },
      },
    },
    paths: {
      '/customers': {
        get: {
          summary: 'Get all customers',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of customers',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Customer' } },
                    },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          summary: 'Create a new customer',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
          responses: {
            '201': { description: 'Customer created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
            '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/customers/{id}': {
        get: {
          summary: 'Get customer by ID',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Customer ID' }],
          responses: {
            '200': { description: 'Customer details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Customer' } } } },
            '404': { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        put: {
          summary: 'Update customer',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Customer ID' }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
          responses: {
            '200': { description: 'Customer updated successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
            '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '404': { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        delete: {
          summary: 'Delete customer',
          tags: ['Customers'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Customer ID' }],
          responses: {
            '200': { description: 'Customer deleted successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
            '404': { description: 'Customer not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/segments': {
        get: {
          summary: 'Get all segments',
          tags: ['Segments'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of segments',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Segment' } },
                    },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          summary: 'Create a new segment',
          tags: ['Segments'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Segment' },
              },
            },
          },
          responses: {
            '201': { description: 'Segment created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
            '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/campaigns': {
        get: {
          summary: 'Get all campaigns',
          tags: ['Campaigns'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of campaigns',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Campaign' } },
                    },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          summary: 'Create a new campaign',
          tags: ['Campaigns'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Campaign' },
              },
            },
          },
          responses: {
            '201': { description: 'Campaign created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
            '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/orders': {
        get: {
          summary: 'Get all orders',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of orders',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
                    },
                  },
                },
              },
            },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
        post: {
          summary: 'Create a new order',
          tags: ['Orders'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
          responses: {
            '201': { description: 'Order created successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/Success' } } } },
            '400': { description: 'Bad request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/google/auth': {
        get: {
          summary: 'Initiate Google OAuth',
          tags: ['Authentication'],
          responses: {
            '302': { description: 'Redirect to Google OAuth' },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/google/callback': {
        get: {
          summary: 'Google OAuth callback',
          tags: ['Authentication'],
          parameters: [
            { name: 'code', in: 'query', required: true, schema: { type: 'string' }, description: 'Authorization code from Google' },
            { name: 'state', in: 'query', required: false, schema: { type: 'string' }, description: 'State parameter for CSRF protection' }
          ],
          responses: {
            '200': {
              description: 'Authentication successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      token: { type: 'string', description: 'JWT access token' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', description: 'Google user ID' },
                          name: { type: 'string', description: 'User full name' },
                          email: { type: 'string', format: 'email', description: 'User email address' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': { description: 'Bad request - invalid authorization code', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
            '500': { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
    },
  };
  
  res.json(swaggerSpec);
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await connectToDatabase();
    await connectToRabbitMQ();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

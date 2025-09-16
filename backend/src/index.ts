import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
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

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xeno Mini CRM API',
      version: '1.0.0',
      description: 'A comprehensive mini CRM system with AI-powered segmentation and campaign management',
      contact: {
        name: 'Xeno CRM Team',
        email: 'support@xenocrm.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://backend-production-05a7e.up.railway.app',
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
            _id: {
              type: 'string',
              description: 'Unique customer identifier',
              example: '64f8a1b2c3d4e5f6a7b8c9d0',
            },
            firstName: {
              type: 'string',
              description: 'Customer first name',
              example: 'John',
            },
            lastName: {
              type: 'string',
              description: 'Customer last name',
              example: 'Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email address',
              example: 'john.doe@example.com',
            },
            phone: {
              type: 'string',
              description: 'Customer phone number',
              example: '+1-555-123-4567',
            },
            visits: {
              type: 'integer',
              minimum: 0,
              description: 'Number of customer visits',
              example: 5,
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Customer tags for segmentation',
              example: ['vip', 'loyal', 'new-customer'],
            },
            lastOrderAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date of last order',
              example: '2024-01-15T10:30:00.000Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Customer creation date',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Segment: {
          type: 'object',
          required: ['name', 'description', 'rules'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique segment identifier',
              example: '64f8a1b2c3d4e5f6a7b8c9d1',
            },
            name: {
              type: 'string',
              description: 'Segment name',
              example: 'High-Value Customers',
            },
            description: {
              type: 'string',
              description: 'Segment description',
              example: 'Customers with high purchase frequency and value',
            },
            rules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field to filter on',
                    example: 'visits',
                  },
                  operator: {
                    type: 'string',
                    description: 'Comparison operator',
                    example: 'gte',
                  },
                  value: {
                    type: 'string',
                    description: 'Value to compare against',
                    example: '5',
                  },
                },
              },
              description: 'Array of filtering rules',
            },
            customerCount: {
              type: 'integer',
              minimum: 0,
              description: 'Number of customers in this segment',
              example: 25,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Segment creation date',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Campaign: {
          type: 'object',
          required: ['name', 'description', 'segmentId', 'message'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique campaign identifier',
              example: '64f8a1b2c3d4e5f6a7b8c9d2',
            },
            name: {
              type: 'string',
              description: 'Campaign name',
              example: 'Summer Sale 2024',
            },
            description: {
              type: 'string',
              description: 'Campaign description',
              example: 'Promotional campaign for summer products',
            },
            type: {
              type: 'string',
              enum: ['email', 'sms', 'push', 'social'],
              description: 'Campaign type',
              example: 'email',
            },
            status: {
              type: 'string',
              enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
              description: 'Campaign status',
              example: 'active',
            },
            segmentId: {
              type: 'string',
              description: 'Target segment ID',
              example: '64f8a1b2c3d4e5f6a7b8c9d1',
            },
            message: {
              type: 'string',
              description: 'Campaign message content',
              example: 'Get 20% off on all summer items! Limited time offer.',
            },
            sentCount: {
              type: 'integer',
              minimum: 0,
              description: 'Number of messages sent',
              example: 150,
            },
            openRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Email open rate percentage',
              example: 25.5,
            },
            clickRate: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Click-through rate percentage',
              example: 5.2,
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled send date',
              example: '2024-01-20T09:00:00.000Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Campaign creation date',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Order: {
          type: 'object',
          required: ['customerId', 'items', 'totalAmount'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique order identifier',
              example: '64f8a1b2c3d4e5f6a7b8c9d3',
            },
            customerId: {
              type: 'string',
              description: 'Customer ID who placed the order',
              example: '64f8a1b2c3d4e5f6a7b8c9d0',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: {
                    type: 'string',
                    description: 'Product identifier',
                    example: 'prod_123',
                  },
                  productName: {
                    type: 'string',
                    description: 'Product name',
                    example: 'Premium Widget',
                  },
                  quantity: {
                    type: 'integer',
                    minimum: 1,
                    description: 'Quantity ordered',
                    example: 2,
                  },
                  price: {
                    type: 'number',
                    minimum: 0,
                    description: 'Unit price',
                    example: 29.99,
                  },
                },
              },
              description: 'Order items',
            },
            totalAmount: {
              type: 'number',
              minimum: 0,
              description: 'Total order amount',
              example: 59.98,
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
              description: 'Order status',
              example: 'delivered',
            },
            shippingAddress: {
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                  example: '123 Main St',
                },
                city: {
                  type: 'string',
                  example: 'New York',
                },
                state: {
                  type: 'string',
                  example: 'NY',
                },
                zipCode: {
                  type: 'string',
                  example: '10001',
                },
                country: {
                  type: 'string',
                  example: 'USA',
                },
              },
              description: 'Shipping address',
            },
            paymentMethod: {
              type: 'string',
              description: 'Payment method used',
              example: 'credit_card',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation date',
              example: '2024-01-01T00:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
              example: '2024-01-15T10:30:00.000Z',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
              example: 'Email is required',
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
              example: 400,
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Operation success status',
              example: true,
            },
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        AISegmentRequest: {
          type: 'object',
          required: ['prompt'],
          properties: {
            prompt: {
              type: 'string',
              description: 'Natural language description of the segment',
              example: 'Find customers who have made more than 3 purchases and spent over $500',
            },
          },
        },
        AISegmentResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'High-Value Frequent Buyers',
                },
                description: {
                  type: 'string',
                  example: 'Customers with more than 3 purchases and over $500 total spend',
                },
                rules: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        example: 'visits',
                      },
                      operator: {
                        type: 'string',
                        example: 'gte',
                      },
                      value: {
                        type: 'string',
                        example: '3',
                      },
                    },
                  },
                },
                estimatedCount: {
                  type: 'integer',
                  example: 25,
                },
              },
            },
          },
        },
        AICampaignRequest: {
          type: 'object',
          required: ['prompt', 'segmentId'],
          properties: {
            prompt: {
              type: 'string',
              description: 'Natural language description of the campaign',
              example: 'Create a summer sale campaign for loyal customers',
            },
            segmentId: {
              type: 'string',
              description: 'Target segment ID',
              example: '64f8a1b2c3d4e5f6a7b8c9d1',
            },
            brandVoice: {
              type: 'string',
              description: 'Brand voice for the campaign',
              example: 'friendly and professional',
            },
          },
        },
        AICampaignResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'Summer Sale 2024',
                },
                description: {
                  type: 'string',
                  example: 'Exclusive summer sale for our loyal customers',
                },
                message: {
                  type: 'string',
                  example: 'Get 20% off on all summer items! Limited time offer for our valued customers.',
                },
                variants: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  example: [
                    'Summer is here! Enjoy 20% off on all summer items.',
                    'Beat the heat with our summer sale - 20% off everything!',
                    'Loyal customers get 20% off summer collection!'
                  ],
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Debug: Log swagger spec
console.log('Swagger spec generated:', Object.keys(swaggerSpec));

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

// Swagger UI with custom configuration
const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #1f2937; font-size: 2rem; }
    .swagger-ui .info .description { color: #6b7280; font-size: 1.1rem; }
    .swagger-ui .scheme-container { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .swagger-ui .opblock { border-radius: 8px; margin-bottom: 20px; }
    .swagger-ui .opblock.opblock-post { border-color: #10b981; }
    .swagger-ui .opblock.opblock-get { border-color: #3b82f6; }
    .swagger-ui .opblock.opblock-put { border-color: #f59e0b; }
    .swagger-ui .opblock.opblock-delete { border-color: #ef4444; }
    .swagger-ui .btn { border-radius: 6px; }
    .swagger-ui .btn.execute { background-color: #3b82f6; border-color: #3b82f6; }
    .swagger-ui .btn.execute:hover { background-color: #2563eb; }
    .swagger-ui .response-col_status { font-weight: 600; }
    .swagger-ui .model { font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; }
    .swagger-ui .model-title { color: #1f2937; }
    .swagger-ui .prop-name { color: #7c3aed; }
    .swagger-ui .prop-type { color: #059669; }
    .swagger-ui .response-col_description__inner p { margin: 0; }
    .swagger-ui .response-col_description__inner code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
    @media (max-width: 768px) {
      .swagger-ui .wrapper { padding: 10px; }
      .swagger-ui .opblock { margin-bottom: 15px; }
      .swagger-ui .opblock-summary { padding: 10px; }
      .swagger-ui .opblock-description-wrapper { padding: 10px; }
      .swagger-ui .btn { padding: 8px 16px; font-size: 14px; }
    }
  `,
  customSiteTitle: 'Xeno CRM API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      // Add any custom request headers here if needed
      return req;
    },
    responseInterceptor: (res: any) => {
      // Add any custom response handling here if needed
      return res;
    },
  },
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Redirect /docs to /api/docs for easier access
app.get('/docs', (req, res) => {
  res.redirect('/api/docs');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

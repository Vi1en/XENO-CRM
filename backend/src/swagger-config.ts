// Simple Swagger configuration
export const swaggerSpec = {
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
      url: 'http://localhost:3001',
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
        properties: {
          _id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          visits: { type: 'integer' },
          tags: { type: 'array', items: { type: 'string' } },
          lastOrderAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Segment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          rules: { type: 'array' },
          customerCount: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Campaign: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string', enum: ['email', 'sms', 'push', 'social'] },
          status: { type: 'string', enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'] },
          segmentId: { type: 'string' },
          message: { type: 'string' },
          sentCount: { type: 'integer' },
          openRate: { type: 'number' },
          clickRate: { type: 'number' },
          scheduledAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          customerId: { type: 'string' },
          items: { type: 'array' },
          totalAmount: { type: 'number' },
          status: { type: 'string' },
          shippingAddress: { type: 'object' },
          paymentMethod: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          statusCode: { type: 'integer' },
        },
      },
    },
  },
  paths: {
    '/api/v1/customers': {
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
          '201': {
            description: 'Customer created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
        },
      },
    },
    '/api/v1/segments': {
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
        },
      },
    },
    '/api/v1/campaigns': {
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
        },
      },
    },
    '/api/v1/orders': {
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
        },
      },
    },
    '/api/v1/google/auth': {
      get: {
        summary: 'Initiate Google OAuth',
        tags: ['Authentication'],
        responses: {
          '302': {
            description: 'Redirect to Google OAuth',
          },
        },
      },
    },
    '/api/v1/google/callback': {
      get: {
        summary: 'Google OAuth callback',
        tags: ['Authentication'],
        parameters: [
          {
            name: 'code',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    token: { type: 'string' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

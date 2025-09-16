// Valid OpenAPI 3.1.0 specification
export const swaggerSpec = {
  openapi: '3.1.0',
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
        required: ['firstName', 'lastName', 'email'],
        properties: {
          _id: { 
            type: 'string',
            description: 'Unique customer identifier',
            example: '64f8a1b2c3d4e5f6a7b8c9d0'
          },
          firstName: { 
            type: 'string',
            description: 'Customer first name',
            example: 'John'
          },
          lastName: { 
            type: 'string',
            description: 'Customer last name',
            example: 'Doe'
          },
          email: { 
            type: 'string', 
            format: 'email',
            description: 'Customer email address',
            example: 'john.doe@example.com'
          },
          phone: { 
            type: 'string',
            description: 'Customer phone number',
            example: '+1-555-123-4567'
          },
          visits: { 
            type: 'integer',
            minimum: 0,
            description: 'Number of customer visits',
            example: 5
          },
          tags: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Customer tags for segmentation',
            example: ['vip', 'loyal', 'new-customer']
          },
          lastOrderAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Date of last order',
            example: '2024-01-15T10:30:00.000Z'
          },
          createdAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Customer creation date',
            example: '2024-01-01T00:00:00.000Z'
          },
          updatedAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Last update date',
            example: '2024-01-15T10:30:00.000Z'
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
            example: '64f8a1b2c3d4e5f6a7b8c9d1'
          },
          name: { 
            type: 'string',
            description: 'Segment name',
            example: 'High-Value Customers'
          },
          description: { 
            type: 'string',
            description: 'Segment description',
            example: 'Customers with high purchase frequency and value'
          },
          rules: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'visits' },
                operator: { type: 'string', example: 'gte' },
                value: { type: 'string', example: '5' }
              }
            },
            description: 'Array of filtering rules'
          },
          customerCount: { 
            type: 'integer',
            minimum: 0,
            description: 'Number of customers in this segment',
            example: 25
          },
          createdAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Segment creation date',
            example: '2024-01-01T00:00:00.000Z'
          },
          updatedAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Last update date',
            example: '2024-01-15T10:30:00.000Z'
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
            example: '64f8a1b2c3d4e5f6a7b8c9d2'
          },
          name: { 
            type: 'string',
            description: 'Campaign name',
            example: 'Summer Sale 2024'
          },
          description: { 
            type: 'string',
            description: 'Campaign description',
            example: 'Promotional campaign for summer products'
          },
          type: { 
            type: 'string', 
            enum: ['email', 'sms', 'push', 'social'],
            description: 'Campaign type',
            example: 'email'
          },
          status: { 
            type: 'string', 
            enum: ['draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'],
            description: 'Campaign status',
            example: 'active'
          },
          segmentId: { 
            type: 'string',
            description: 'Target segment ID',
            example: '64f8a1b2c3d4e5f6a7b8c9d1'
          },
          message: { 
            type: 'string',
            description: 'Campaign message content',
            example: 'Get 20% off on all summer items! Limited time offer.'
          },
          sentCount: { 
            type: 'integer',
            minimum: 0,
            description: 'Number of messages sent',
            example: 150
          },
          openRate: { 
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Email open rate percentage',
            example: 25.5
          },
          clickRate: { 
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Click-through rate percentage',
            example: 5.2
          },
          scheduledAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Scheduled send date',
            example: '2024-01-20T09:00:00.000Z'
          },
          createdAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Campaign creation date',
            example: '2024-01-01T00:00:00.000Z'
          },
          updatedAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Last update date',
            example: '2024-01-15T10:30:00.000Z'
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
            example: '64f8a1b2c3d4e5f6a7b8c9d3'
          },
          customerId: { 
            type: 'string',
            description: 'Customer ID who placed the order',
            example: '64f8a1b2c3d4e5f6a7b8c9d0'
          },
          items: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string', example: 'prod_123' },
                productName: { type: 'string', example: 'Premium Widget' },
                quantity: { type: 'integer', minimum: 1, example: 2 },
                price: { type: 'number', minimum: 0, example: 29.99 }
              }
            },
            description: 'Order items'
          },
          totalAmount: { 
            type: 'number',
            minimum: 0,
            description: 'Total order amount',
            example: 59.98
          },
          status: { 
            type: 'string',
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
            description: 'Order status',
            example: 'delivered'
          },
          shippingAddress: { 
            type: 'object',
            properties: {
              street: { type: 'string', example: '123 Main St' },
              city: { type: 'string', example: 'New York' },
              state: { type: 'string', example: 'NY' },
              zipCode: { type: 'string', example: '10001' },
              country: { type: 'string', example: 'USA' }
            },
            description: 'Shipping address'
          },
          paymentMethod: { 
            type: 'string',
            description: 'Payment method used',
            example: 'credit_card'
          },
          createdAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Order creation date',
            example: '2024-01-01T00:00:00.000Z'
          },
          updatedAt: { 
            type: 'string', 
            format: 'date-time',
            description: 'Last update date',
            example: '2024-01-15T10:30:00.000Z'
          },
        },
      },
      Success: {
        type: 'object',
        required: ['success'],
        properties: {
          success: { 
            type: 'boolean',
            description: 'Operation success status',
            example: true
          },
          message: { 
            type: 'string',
            description: 'Success message',
            example: 'Operation completed successfully'
          },
          data: { 
            type: 'object',
            description: 'Response data'
          },
        },
      },
      Error: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { 
            type: 'string',
            description: 'Error message',
            example: 'Validation failed'
          },
          message: { 
            type: 'string',
            description: 'Detailed error message',
            example: 'Email is required'
          },
          statusCode: { 
            type: 'integer',
            description: 'HTTP status code',
            example: 400
          },
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
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
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
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/v1/customers/{id}': {
      get: {
        summary: 'Get customer by ID',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID',
            example: '64f8a1b2c3d4e5f6a7b8c9d0'
          }
        ],
        responses: {
          '200': {
            description: 'Customer details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Customer' },
              },
            },
          },
          '404': {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      put: {
        summary: 'Update customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID',
            example: '64f8a1b2c3d4e5f6a7b8c9d0'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Customer' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Customer updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '404': {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Delete customer',
        tags: ['Customers'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Customer ID',
            example: '64f8a1b2c3d4e5f6a7b8c9d0'
          }
        ],
        responses: {
          '200': {
            description: 'Customer deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '404': {
            description: 'Customer not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
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
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
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
          '201': {
            description: 'Segment created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
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
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
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
          '201': {
            description: 'Campaign created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
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
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
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
          '201': {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Success' },
              },
            },
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
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
            headers: {
              Location: {
                description: 'Google OAuth authorization URL',
                schema: { type: 'string' }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
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
            description: 'Authorization code from Google',
            example: '4/0AX4XfWh...'
          },
          {
            name: 'state',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'State parameter for CSRF protection',
            example: 'random_state_string'
          }
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
                    token: { 
                      type: 'string',
                      description: 'JWT access token',
                      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                    },
                    user: {
                      type: 'object',
                      properties: {
                        id: { 
                          type: 'string',
                          description: 'Google user ID',
                          example: '123456789012345678901'
                        },
                        name: { 
                          type: 'string',
                          description: 'User full name',
                          example: 'John Doe'
                        },
                        email: { 
                          type: 'string',
                          format: 'email',
                          description: 'User email address',
                          example: 'john.doe@gmail.com'
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - invalid authorization code',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};

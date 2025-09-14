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
import { connectToDatabase } from './services/database';
import { connectToRabbitMQ } from './services/rabbitmq';

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'https://xeno-crm-frontend.vercel.app',
      'https://xeno-crm-frontend-sigma.vercel.app',
      'https://no-crm-frontend-sigma.vercel.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xeno Mini CRM API',
      version: '1.0.0',
      description: 'A comprehensive mini CRM system with AI-powered segmentation and campaign management',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
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

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

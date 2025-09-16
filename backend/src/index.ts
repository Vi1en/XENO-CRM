import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import path from 'path';
import { swaggerSpec } from './swagger-config';

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

// Swagger configuration imported from separate file

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

// Serve raw JSON spec
app.get('/api/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

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

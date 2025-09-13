import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3002;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simulate vendor send endpoint
app.post('/vendor/send', async (req, res) => {
  try {
    const { communicationLogId, message, email, phone, customerData } = req.body;
    
    console.log(`📧 Processing send request for communicationLogId: ${communicationLogId}`);
    console.log(`📧 Personalized Message: ${message}`);
    console.log(`📧 Email: ${email}, Phone: ${phone}`);
    if (customerData) {
      console.log(`👤 Customer: ${customerData.firstName} ${customerData.lastName} ($${customerData.totalSpend} spent, ${customerData.visits} visits)`);
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));
    
    // 90% success rate, 10% failure rate
    const isSuccess = Math.random() < 0.9;
    
    const result = {
      communicationLogId,
      status: isSuccess ? 'SENT' : 'FAILED',
      vendorId: `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reason: isSuccess ? undefined : 'Simulated delivery failure',
    };
    
    console.log(`📤 Vendor result: ${result.status} for ${communicationLogId}`);
    
    // Send receipt back to backend
    try {
      await axios.post(`${BACKEND_URL}/api/v1/delivery/receipt`, result, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`✅ Receipt sent to backend for ${communicationLogId}`);
    } catch (receiptError) {
      console.error(`❌ Failed to send receipt to backend for ${communicationLogId}:`, receiptError);
    }
    
    res.json({
      success: true,
      message: 'Message processed',
      data: result,
    });
  } catch (error) {
    console.error('❌ Vendor send error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'vendor-simulator',
  });
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
app.listen(PORT, () => {
  console.log(`🚀 Vendor Simulator running on port ${PORT}`);
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  console.log(`📧 Send endpoint: http://localhost:${PORT}/vendor/send`);
});

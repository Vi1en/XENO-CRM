import amqp from 'amqplib';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase } from './services/database';
import { CustomerConsumer } from './consumers/customer-consumer';
import { OrderConsumer } from './consumers/order-consumer';
import { DeliveryReceiptConsumer } from './consumers/delivery-receipt-consumer';
import { CampaignConsumer } from './consumers/campaign-consumer';

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function startWorker() {
  try {
    console.log('🚀 Starting Xeno CRM Worker...');
    
    // Connect to MongoDB
    await connectToDatabase();
    console.log('✅ Connected to MongoDB');
    
    // Connect to RabbitMQ
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672';
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    
    console.log('✅ Connected to RabbitMQ');
    
    // Initialize consumers
    const customerConsumer = new CustomerConsumer(channel);
    const orderConsumer = new OrderConsumer(channel);
    const deliveryReceiptConsumer = new DeliveryReceiptConsumer(channel);
    const campaignConsumer = new CampaignConsumer(channel);
    
    // Start consuming
    await customerConsumer.start();
    await orderConsumer.start();
    await deliveryReceiptConsumer.start();
    await campaignConsumer.start();
    
    console.log('✅ All consumers started');
    console.log('🔄 Worker is running...');
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🛑 Shutting down worker...');
      await customerConsumer.stop();
      await orderConsumer.stop();
      await deliveryReceiptConsumer.stop();
      await campaignConsumer.stop();
      await channel.close();
      await connection.close();
      await mongoose.disconnect();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Worker startup failed:', error);
    process.exit(1);
  }
}

startWorker();

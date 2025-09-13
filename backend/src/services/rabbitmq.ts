import amqp from 'amqplib';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export async function connectToRabbitMQ(): Promise<void> {
  try {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:password@localhost:5672';
    
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    
    // Declare queues
    await channel.assertQueue('queue.customers.ingest', { durable: true });
    await channel.assertQueue('queue.orders.ingest', { durable: true });
    await channel.assertQueue('queue.campaign.delivery', { durable: true });
    await channel.assertQueue('queue.delivery.receipt', { durable: true });
    
    console.log('✅ Connected to RabbitMQ');
  } catch (error) {
    console.error('❌ RabbitMQ connection error:', error);
    throw error;
  }
}

export async function publishToQueue(queueName: string, message: any): Promise<void> {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  
  try {
    const messageBuffer = Buffer.from(JSON.stringify(message));
    await channel.publish('', queueName, messageBuffer, { persistent: true });
    console.log(`📤 Published message to ${queueName}`);
  } catch (error) {
    console.error(`❌ Failed to publish to ${queueName}:`, error);
    throw error;
  }
}

export async function closeRabbitMQConnection(): Promise<void> {
  if (channel) {
    await channel.close();
  }
  if (connection) {
    await connection.close();
  }
}

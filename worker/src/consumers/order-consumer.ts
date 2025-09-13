import { Channel, ConsumeMessage } from 'amqplib';
import { Order, IOrder } from '../models/order';

export class OrderConsumer {
  private channel: Channel;
  private queueName = 'queue.orders.ingest';
  private batchSize = 500;
  private batchTimeout = 2000; // 2 seconds
  private messageBatch: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(channel: Channel) {
    this.channel = channel;
  }

  async start(): Promise<void> {
    await this.channel.assertQueue(this.queueName, { durable: true });
    await this.channel.prefetch(this.batchSize);
    
    console.log(`🔄 Starting order consumer for queue: ${this.queueName}`);
    
    await this.channel.consume(this.queueName, this.handleMessage.bind(this), {
      noAck: false,
    });
  }

  async stop(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    await this.processBatch();
    console.log('🛑 Order consumer stopped');
  }

  private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
    if (!msg) return;

    try {
      const orderData = JSON.parse(msg.content.toString());
      this.messageBatch.push(orderData);

      // Process batch if it reaches the batch size
      if (this.messageBatch.length >= this.batchSize) {
        await this.processBatch();
      } else {
        // Set timer for batch timeout if not already set
        if (!this.batchTimer) {
          this.batchTimer = setTimeout(() => {
            this.processBatch();
          }, this.batchTimeout);
        }
      }

      this.channel.ack(msg);
    } catch (error) {
      console.error('❌ Error processing order message:', error);
      this.channel.nack(msg, false, false); // Reject and don't requeue
    }
  }

  private async processBatch(): Promise<void> {
    if (this.messageBatch.length === 0) return;

    const startTime = Date.now();
    const batchSize = this.messageBatch.length;

    try {
      console.log(`📦 Processing order batch of ${batchSize} messages`);

      // Prepare bulk operations
      const bulkOps = this.messageBatch.map((orderData) => ({
        updateOne: {
          filter: { externalId: orderData.externalId },
          update: {
            $set: {
              ...orderData,
              orderDate: new Date(orderData.orderDate),
              createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

      // Execute bulk operation
      const result = await Order.bulkWrite(bulkOps);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Order batch processed: ${result.upsertedCount} inserted, ${result.modifiedCount} updated in ${duration}ms`);

    } catch (error) {
      console.error('❌ Error processing order batch:', error);
    } finally {
      // Clear batch and timer
      this.messageBatch = [];
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }
    }
  }
}

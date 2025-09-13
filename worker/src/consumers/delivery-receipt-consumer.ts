import { Channel, ConsumeMessage } from 'amqplib';
import { CommunicationLog } from '../models/communication-log';
import { Campaign } from '../models/campaign';

export class DeliveryReceiptConsumer {
  private channel: Channel;
  private queueName = 'queue.delivery.receipt';
  private batchSize = 100;
  private batchTimeout = 5000; // 5 seconds
  private messageBatch: any[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(channel: Channel) {
    this.channel = channel;
  }

  async start(): Promise<void> {
    await this.channel.assertQueue(this.queueName, { durable: true });
    await this.channel.prefetch(this.batchSize);
    
    console.log(`🔄 Starting delivery receipt consumer for queue: ${this.queueName}`);
    
    await this.channel.consume(this.queueName, this.handleMessage.bind(this), {
      noAck: false,
    });
  }

  async stop(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    await this.processBatch();
    console.log('🛑 Delivery receipt consumer stopped');
  }

  private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
    if (!msg) return;

    try {
      const receiptData = JSON.parse(msg.content.toString());
      this.messageBatch.push(receiptData);

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
      console.error('❌ Error processing delivery receipt message:', error);
      this.channel.nack(msg, false, false); // Reject and don't requeue
    }
  }

  private async processBatch(): Promise<void> {
    if (this.messageBatch.length === 0) return;

    const startTime = Date.now();
    const batchSize = this.messageBatch.length;

    try {
      console.log(`📦 Processing delivery receipt batch of ${batchSize} messages`);

      // Prepare bulk operations for communication logs
      const bulkOps = this.messageBatch.map((receiptData) => ({
        updateOne: {
          filter: { communicationLogId: receiptData.communicationLogId },
          update: {
            $set: {
              status: receiptData.status,
              vendorId: receiptData.vendorId,
              reason: receiptData.reason,
              sentAt: receiptData.status === 'SENT' ? new Date() : undefined,
              deliveredAt: receiptData.status === 'DELIVERED' ? new Date() : undefined,
              updatedAt: new Date(),
            },
          },
        },
      }));

      // Execute bulk operation for communication logs
      const result = await CommunicationLog.bulkWrite(bulkOps);
      
      // Update campaign stats
      await this.updateCampaignStats(this.messageBatch);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Delivery receipt batch processed: ${result.modifiedCount} updated in ${duration}ms`);

    } catch (error) {
      console.error('❌ Error processing delivery receipt batch:', error);
    } finally {
      // Clear batch and timer
      this.messageBatch = [];
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }
    }
  }

  private async updateCampaignStats(receipts: any[]): Promise<void> {
    try {
      // Group receipts by campaign ID
      const campaignStats = new Map<string, { sent: number; delivered: number; failed: number; bounced: number }>();
      
      for (const receipt of receipts) {
        // Get the communication log to find the campaign ID
        const commLog = await CommunicationLog.findOne({ communicationLogId: receipt.communicationLogId });
        if (!commLog) continue;
        
        const campaignId = commLog.campaignId;
        if (!campaignStats.has(campaignId)) {
          campaignStats.set(campaignId, { sent: 0, delivered: 0, failed: 0, bounced: 0 });
        }
        
        const stats = campaignStats.get(campaignId)!;
        
        switch (receipt.status) {
          case 'SENT':
            stats.sent++;
            break;
          case 'DELIVERED':
            stats.delivered++;
            break;
          case 'FAILED':
            stats.failed++;
            break;
          case 'BOUNCED':
            stats.bounced++;
            break;
        }
      }
      
      // Update each campaign's stats
      for (const [campaignId, stats] of campaignStats) {
        await Campaign.findByIdAndUpdate(campaignId, {
          $inc: {
            'stats.sent': stats.sent,
            'stats.delivered': stats.delivered,
            'stats.failed': stats.failed,
            'stats.bounced': stats.bounced,
          }
        });
        
        console.log(`📊 Updated campaign ${campaignId} stats: +${stats.sent} sent, +${stats.delivered} delivered, +${stats.failed} failed, +${stats.bounced} bounced`);
      }
    } catch (error) {
      console.error('❌ Error updating campaign stats:', error);
    }
  }
}

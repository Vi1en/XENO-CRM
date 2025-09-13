import { Channel, ConsumeMessage } from 'amqplib';
import axios from 'axios';
// Note: Message personalization will be handled by backend before queuing
// This keeps the worker service independent

export class CampaignConsumer {
  private channel: Channel;
  private queueName = 'queue.campaign.delivery';
  private vendorUrl: string;

  constructor(channel: Channel) {
    this.channel = channel;
    this.vendorUrl = process.env.VENDOR_URL || 'http://localhost:3002';
  }

  async start(): Promise<void> {
    await this.channel.assertQueue(this.queueName, { durable: true });
    await this.channel.prefetch(10); // Process 10 messages at a time
    
    console.log(`🔄 Starting campaign consumer for queue: ${this.queueName}`);
    
    await this.channel.consume(this.queueName, this.handleMessage.bind(this), {
      noAck: false,
    });
  }

  async stop(): Promise<void> {
    console.log('🛑 Campaign consumer stopped');
  }

  private async handleMessage(msg: ConsumeMessage | null): Promise<void> {
    if (!msg) return;

    try {
      const campaignData = JSON.parse(msg.content.toString());
      
      console.log(`📧 Processing campaign delivery for communicationLogId: ${campaignData.communicationLogId}`);

      // Use the message as-is (personalization handled by backend)
      const personalizedMessage = campaignData.message;

      // Call vendor simulator with personalized message
      const vendorResponse = await axios.post(`${this.vendorUrl}/vendor/send`, {
        communicationLogId: campaignData.communicationLogId,
        message: personalizedMessage,
        email: campaignData.email,
        phone: campaignData.phone,
        // Include customer data for vendor logging
        customerData: campaignData.customerData,
      }, {
        timeout: 30000, // 30 second timeout
      });

      console.log(`✅ Vendor response for ${campaignData.communicationLogId}:`, vendorResponse.data);
      
      this.channel.ack(msg);
    } catch (error) {
      console.error('❌ Error processing campaign message:', error);
      
      // For now, we'll ack the message even if it fails
      // In a production system, you might want to implement retry logic
      this.channel.ack(msg);
    }
  }
}

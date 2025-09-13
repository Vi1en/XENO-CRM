import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  description?: string;
  segmentId: string;
  message: string;
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled';
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  stats: {
    totalRecipients: number;
    sent: number;
    failed: number;
    delivered: number;
    bounced: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const campaignStatsSchema = new Schema({
  totalRecipients: { type: Number, default: 0 },
  sent: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  delivered: { type: Number, default: 0 },
  bounced: { type: Number, default: 0 },
});

const campaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  description: { type: String },
  segmentId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'],
    default: 'draft',
    index: true
  },
  scheduledAt: { type: Date },
  startedAt: { type: Date },
  completedAt: { type: Date },
  stats: campaignStatsSchema,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
campaignSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);

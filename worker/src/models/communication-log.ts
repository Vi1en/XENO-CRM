import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunicationLog extends Document {
  communicationLogId: string;
  campaignId: string;
  customerId: string;
  message: string;
  email?: string;
  phone?: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED' | 'BOUNCED';
  vendorId?: string;
  reason?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const communicationLogSchema = new Schema<ICommunicationLog>({
  communicationLogId: { type: String, required: true, unique: true, index: true },
  campaignId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['PENDING', 'SENT', 'FAILED', 'DELIVERED', 'BOUNCED'],
    default: 'PENDING',
    index: true
  },
  vendorId: { type: String },
  reason: { type: String },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
communicationLogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const CommunicationLog = mongoose.model<ICommunicationLog>('CommunicationLog', communicationLogSchema);

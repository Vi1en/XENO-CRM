import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  externalId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  totalSpend: number;
  visits: number;
  lastOrderAt?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>({
  externalId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String },
  totalSpend: { type: Number, required: true, default: 0 },
  visits: { type: Number, required: true, default: 0 },
  lastOrderAt: { type: Date },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-generate externalId before saving
customerSchema.pre('save', function(next) {
  if (!this.externalId) {
    // Generate externalId based on timestamp and random number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.externalId = `cust_${timestamp}_${random}`;
  }
  this.updatedAt = new Date();
  next();
});

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

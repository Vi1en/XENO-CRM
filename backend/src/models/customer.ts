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

// Update the updatedAt field before saving
customerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

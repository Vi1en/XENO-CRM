import mongoose, { Document, Schema } from 'mongoose';

export interface ISegmentRule {
  field: string;
  operator: string;
  value: any;
}

export interface ISegment extends Document {
  name: string;
  description?: string;
  rules: ISegmentRule[];
  customerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const segmentRuleSchema = new Schema<ISegmentRule>({
  field: { type: String, required: true },
  operator: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
});

const segmentSchema = new Schema<ISegment>({
  name: { type: String, required: true },
  description: { type: String },
  rules: [segmentRuleSchema],
  customerCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
segmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Segment = mongoose.model<ISegment>('Segment', segmentSchema);

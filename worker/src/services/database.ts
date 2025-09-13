import mongoose from 'mongoose';

export async function connectToDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/xeno-crm?authSource=admin';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Worker connected to MongoDB');
  } catch (error) {
    console.error('❌ Worker MongoDB connection error:', error);
    throw error;
  }
}

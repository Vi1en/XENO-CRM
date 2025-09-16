const { MongoClient } = require('mongodb');

// Test the exact same connection string that the backend should be using
const MONGODB_URI = 'mongodb+srv://manabmallick3345_db_user:manabvilen69@crm-cluster.ucechwc.mongodb.net/xeno-crm?retryWrites=true&w=majority&appName=crm-cluster';

async function debugBackend() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('xeno-crm');
    
    // Test the exact same query that the backend is using
    console.log('🔍 Testing Campaign.find() query...');
    const campaigns = await db.collection('campaigns').find({}, {
      name: 1,
      description: 1,
      status: 1,
      stats: 1,
      createdAt: 1,
    }).sort({ createdAt: -1 }).toArray();
    
    console.log(`📧 Found ${campaigns.length} campaigns:`);
    campaigns.forEach(campaign => {
      console.log(`- ${campaign.name}: ${campaign.description} (${campaign.status})`);
    });
    
    // Test segments query
    console.log('\n🔍 Testing Segment.find() query...');
    const segments = await db.collection('segments').find({}).sort({ createdAt: -1 }).toArray();
    
    console.log(`🎯 Found ${segments.length} segments:`);
    segments.forEach(segment => {
      console.log(`- ${segment.name}: ${segment.description}`);
    });
    
    // Test orders query
    console.log('\n🔍 Testing Order.find() query...');
    const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
    
    console.log(`🛒 Found ${orders.length} orders:`);
    orders.forEach(order => {
      console.log(`- ${order.orderId}: ${order.customerName} - $${order.totalSpent}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugBackend();

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://manabmallick3345_db_user:manabvilen69@crm-cluster.ucechwc.mongodb.net/xeno-crm?retryWrites=true&w=majority&appName=crm-cluster';

async function testDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('xeno-crm');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections:', collections.map(c => c.name));
    
    // Check customers
    const customerCount = await db.collection('customers').countDocuments();
    console.log(`👥 Customers: ${customerCount}`);
    
    // Check campaigns
    const campaignCount = await db.collection('campaigns').countDocuments();
    console.log(`📧 Campaigns: ${campaignCount}`);
    
    // Check segments
    const segmentCount = await db.collection('segments').countDocuments();
    console.log(`🎯 Segments: ${segmentCount}`);
    
    // Check orders
    const orderCount = await db.collection('orders').countDocuments();
    console.log(`🛒 Orders: ${orderCount}`);
    
    // Show sample data
    console.log('\n📊 Sample customers:');
    const customers = await db.collection('customers').find({}).limit(3).toArray();
    customers.forEach(c => console.log(`- ${c.firstName} ${c.lastName} (${c.email})`));
    
    console.log('\n📊 Sample campaigns:');
    const campaigns = await db.collection('campaigns').find({}).limit(3).toArray();
    campaigns.forEach(c => console.log(`- ${c.name}: ${c.description}`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testDatabase();

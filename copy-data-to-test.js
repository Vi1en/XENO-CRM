const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://manabmallick3345_db_user:manabvilen69@crm-cluster.ucechwc.mongodb.net/xeno-crm?retryWrites=true&w=majority&appName=crm-cluster';

async function copyDataToTest() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const sourceDb = client.db('xeno-crm');
    const targetDb = client.db('test');
    
    // Clear existing data in test database
    console.log('🧹 Clearing test database...');
    await targetDb.collection('customers').deleteMany({});
    await targetDb.collection('campaigns').deleteMany({});
    await targetDb.collection('segments').deleteMany({});
    await targetDb.collection('orders').deleteMany({});
    
    // Copy customers
    console.log('📝 Copying customers...');
    const customers = await sourceDb.collection('customers').find({}).toArray();
    if (customers.length > 0) {
      await targetDb.collection('customers').insertMany(customers);
      console.log(`✅ Copied ${customers.length} customers`);
    }
    
    // Copy campaigns
    console.log('📝 Copying campaigns...');
    const campaigns = await sourceDb.collection('campaigns').find({}).toArray();
    if (campaigns.length > 0) {
      await targetDb.collection('campaigns').insertMany(campaigns);
      console.log(`✅ Copied ${campaigns.length} campaigns`);
    }
    
    // Copy segments
    console.log('📝 Copying segments...');
    const segments = await sourceDb.collection('segments').find({}).toArray();
    if (segments.length > 0) {
      await targetDb.collection('segments').insertMany(segments);
      console.log(`✅ Copied ${segments.length} segments`);
    }
    
    // Copy orders
    console.log('📝 Copying orders...');
    const orders = await sourceDb.collection('orders').find({}).toArray();
    if (orders.length > 0) {
      await targetDb.collection('orders').insertMany(orders);
      console.log(`✅ Copied ${orders.length} orders`);
    }
    
    console.log('🎉 Data copied successfully to test database!');
    
    // Verify
    const finalCustomerCount = await targetDb.collection('customers').countDocuments();
    const finalCampaignCount = await targetDb.collection('campaigns').countDocuments();
    const finalSegmentCount = await targetDb.collection('segments').countDocuments();
    const finalOrderCount = await targetDb.collection('orders').countDocuments();
    
    console.log(`\n📊 Final counts in test database:`);
    console.log(`- Customers: ${finalCustomerCount}`);
    console.log(`- Campaigns: ${finalCampaignCount}`);
    console.log(`- Segments: ${finalSegmentCount}`);
    console.log(`- Orders: ${finalOrderCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

copyDataToTest();

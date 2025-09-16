const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://manabmallick3345_db_user:manabvilen69@crm-cluster.ucechwc.mongodb.net/xeno-crm?retryWrites=true&w=majority&appName=crm-cluster';

async function checkTestDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // Check test database
    const testDb = client.db('test');
    const testCollections = await testDb.listCollections().toArray();
    console.log('📋 Collections in test database:', testCollections.map(c => c.name));
    
    // Check customers in test database
    const testCustomerCount = await testDb.collection('customers').countDocuments();
    console.log(`👥 Customers in test: ${testCustomerCount}`);
    
    // Check campaigns in test database
    const testCampaignCount = await testDb.collection('campaigns').countDocuments();
    console.log(`📧 Campaigns in test: ${testCampaignCount}`);
    
    // Check segments in test database
    const testSegmentCount = await testDb.collection('segments').countDocuments();
    console.log(`🎯 Segments in test: ${testSegmentCount}`);
    
    // Check orders in test database
    const testOrderCount = await testDb.collection('orders').countDocuments();
    console.log(`🛒 Orders in test: ${testOrderCount}`);
    
    // Show sample data from test database
    if (testCustomerCount > 0) {
      console.log('\n📊 Sample customers from test database:');
      const testCustomers = await testDb.collection('customers').find({}).limit(3).toArray();
      testCustomers.forEach(c => console.log(`- ${c.firstName} ${c.lastName} (${c.email})`));
    }
    
    // Check if backend might be using a different database name
    console.log('\n🔍 Checking all databases for CRM data...');
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    
    for (const dbInfo of databases.databases) {
      if (dbInfo.name !== 'admin' && dbInfo.name !== 'local') {
        const db = client.db(dbInfo.name);
        const collections = await db.listCollections().toArray();
        const hasCustomers = collections.some(c => c.name === 'customers');
        const hasCampaigns = collections.some(c => c.name === 'campaigns');
        
        if (hasCustomers || hasCampaigns) {
          const customerCount = hasCustomers ? await db.collection('customers').countDocuments() : 0;
          const campaignCount = hasCampaigns ? await db.collection('campaigns').countDocuments() : 0;
          console.log(`📊 ${dbInfo.name}: ${customerCount} customers, ${campaignCount} campaigns`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkTestDatabase();

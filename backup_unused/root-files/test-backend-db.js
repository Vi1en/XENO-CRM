const { MongoClient } = require('mongodb');

// Test different possible database names
const MONGODB_URI = 'mongodb+srv://manabmallick3345_db_user:manabvilen69@crm-cluster.ucechwc.mongodb.net/xeno-crm?retryWrites=true&w=majority&appName=crm-cluster';

async function testBackendDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    // List all databases
    const admin = client.db().admin();
    const databases = await admin.listDatabases();
    console.log('📋 Available databases:', databases.databases.map(db => db.name));
    
    // Check xeno-crm database
    const db = client.db('xeno-crm');
    
    // List collections in xeno-crm
    const collections = await db.listCollections().toArray();
    console.log('📋 Collections in xeno-crm:', collections.map(c => c.name));
    
    // Check campaigns in xeno-crm
    const campaignCount = await db.collection('campaigns').countDocuments();
    console.log(`📧 Campaigns in xeno-crm: ${campaignCount}`);
    
    // Check if there are campaigns in other databases
    for (const dbInfo of databases.databases) {
      if (dbInfo.name !== 'xeno-crm') {
        const testDb = client.db(dbInfo.name);
        const testCollections = await testDb.listCollections().toArray();
        const campaignCollections = testCollections.filter(c => c.name === 'campaigns');
        
        if (campaignCollections.length > 0) {
          const testCampaignCount = await testDb.collection('campaigns').countDocuments();
          console.log(`📧 Campaigns in ${dbInfo.name}: ${testCampaignCount}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testBackendDatabase();

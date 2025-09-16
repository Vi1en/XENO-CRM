const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://manabmallick3345_db_user:manabvilen69@crm-cluster.ucechwc.mongodb.net/xeno-crm?retryWrites=true&w=majority&appName=crm-cluster';

async function seedProductionDataFixed() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('xeno-crm');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.collection('campaigns').deleteMany({});
    await db.collection('segments').deleteMany({});
    await db.collection('orders').deleteMany({});
    
    // Sample segments (create first to get IDs)
    const segments = [
      {
        name: 'High Value Customers',
        description: 'Customers who have spent more than $1000',
        rules: [
          { field: 'totalSpend', operator: 'greater_than', value: 1000 }
        ],
        customerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Frequent Visitors',
        description: 'Customers with more than 10 visits',
        rules: [
          { field: 'visits', operator: 'greater_than', value: 10 }
        ],
        customerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'VIP Customers',
        description: 'Customers with VIP tag',
        rules: [
          { field: 'tags', operator: 'contains', value: 'vip' }
        ],
        customerCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    console.log('📝 Inserting segments...');
    const segmentResult = await db.collection('segments').insertMany(segments);
    const segmentIds = Object.values(segmentResult.insertedIds);
    console.log(`✅ Inserted ${segments.length} segments`);
    
    // Sample campaigns with segmentId
    const campaigns = [
      {
        name: 'Welcome New Customers',
        description: 'Welcome campaign for new customers',
        segmentId: segmentIds[0].toString(),
        message: 'Welcome to our store! Enjoy 10% off your first order.',
        messageVariants: [
          'Welcome to our store! Enjoy 10% off your first order.',
          'Thanks for joining us! Get 10% off your first purchase.',
          'Welcome aboard! Use code WELCOME10 for 10% off.'
        ],
        status: 'draft',
        stats: {
          totalRecipients: 0,
          sent: 0,
          delivered: 0,
          failed: 0,
          bounced: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'VIP Exclusive Offer',
        description: 'Special offer for VIP customers',
        segmentId: segmentIds[2].toString(),
        message: 'Exclusive VIP offer: 20% off everything!',
        messageVariants: [
          'Exclusive VIP offer: 20% off everything!',
          'VIP members only: 20% discount on all items.',
          'Special VIP deal: Save 20% on your next order.'
        ],
        status: 'draft',
        stats: {
          totalRecipients: 0,
          sent: 0,
          delivered: 0,
          failed: 0,
          bounced: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Frequent Buyer Rewards',
        description: 'Reward campaign for frequent visitors',
        segmentId: segmentIds[1].toString(),
        message: 'Thank you for being a loyal customer! Here\'s 15% off your next order.',
        messageVariants: [
          'Thank you for being a loyal customer! Here\'s 15% off your next order.',
          'Loyalty reward: 15% discount on your next purchase.',
          'Thanks for your frequent visits! Enjoy 15% off.'
        ],
        status: 'draft',
        stats: {
          totalRecipients: 0,
          sent: 0,
          delivered: 0,
          failed: 0,
          bounced: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Sample orders
    const orders = [
      {
        orderId: 'ORD-001',
        customerName: 'John Doe',
        totalSpent: 250,
        date: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 'ORD-002',
        customerName: 'Atlas Test',
        totalSpent: 150,
        date: new Date('2024-01-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 'ORD-003',
        customerName: 'Jane Smith',
        totalSpent: 75,
        date: new Date('2024-01-05'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    console.log('📝 Inserting campaigns...');
    await db.collection('campaigns').insertMany(campaigns);
    console.log(`✅ Inserted ${campaigns.length} campaigns`);
    
    console.log('📝 Inserting orders...');
    await db.collection('orders').insertMany(orders);
    console.log(`✅ Inserted ${orders.length} orders`);
    
    console.log('🎉 Production database seeded successfully!');
    
    // Verify data
    const campaignCount = await db.collection('campaigns').countDocuments();
    const segmentCount = await db.collection('segments').countDocuments();
    const orderCount = await db.collection('orders').countDocuments();
    
    console.log(`\n📊 Final counts:`);
    console.log(`- Campaigns: ${campaignCount}`);
    console.log(`- Segments: ${segmentCount}`);
    console.log(`- Orders: ${orderCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedProductionDataFixed();

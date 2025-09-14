const { MongoClient } = require('mongodb');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://manabmallick3345_db_user:manabvilen69@crm-cluster.ucechwc.mongodb.net/xeno-crm?retryWrites=true&w=majority&appName=crm-cluster';

async function seedProductionData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('xeno-crm');
    
    // Sample customers
    const customers = [
      {
        externalId: 'prod_customer_001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1-555-0101',
        totalSpend: 2500,
        visits: 15,
        lastOrderAt: new Date('2024-01-15'),
        tags: ['vip', 'frequent-buyer'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        externalId: 'prod_customer_002',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@example.com',
        phone: '+1-555-0102',
        totalSpend: 1200,
        visits: 8,
        lastOrderAt: new Date('2024-01-10'),
        tags: ['new-customer'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        externalId: 'prod_customer_003',
        firstName: 'Carol',
        lastName: 'Davis',
        email: 'carol.davis@example.com',
        phone: '+1-555-0103',
        totalSpend: 500,
        visits: 3,
        lastOrderAt: new Date('2024-01-05'),
        tags: ['potential-vip'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Sample segments
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
      }
    ];
    
    // Sample campaigns
    const campaigns = [
      {
        name: 'Welcome New Customers',
        description: 'Welcome campaign for new customers',
        message: 'Welcome to our store! Enjoy 10% off your first order.',
        messageVariants: [
          'Welcome to our store! Enjoy 10% off your first order.',
          'Thanks for joining us! Get 10% off your first purchase.',
          'Welcome aboard! Use code WELCOME10 for 10% off.'
        ],
        status: 'draft',
        stats: {
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
        message: 'Exclusive VIP offer: 20% off everything!',
        messageVariants: [
          'Exclusive VIP offer: 20% off everything!',
          'VIP members only: 20% discount on all items.',
          'Special VIP deal: Save 20% on your next order.'
        ],
        status: 'draft',
        stats: {
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
        customerName: 'Alice Johnson',
        totalSpent: 250,
        date: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 'ORD-002',
        customerName: 'Bob Smith',
        totalSpent: 150,
        date: new Date('2024-01-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        orderId: 'ORD-003',
        customerName: 'Carol Davis',
        totalSpent: 75,
        date: new Date('2024-01-05'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert data
    console.log('📝 Inserting customers...');
    await db.collection('customers').insertMany(customers);
    console.log(`✅ Inserted ${customers.length} customers`);
    
    console.log('📝 Inserting segments...');
    await db.collection('segments').insertMany(segments);
    console.log(`✅ Inserted ${segments.length} segments`);
    
    console.log('📝 Inserting campaigns...');
    await db.collection('campaigns').insertMany(campaigns);
    console.log(`✅ Inserted ${campaigns.length} campaigns`);
    
    console.log('📝 Inserting orders...');
    await db.collection('orders').insertMany(orders);
    console.log(`✅ Inserted ${orders.length} orders`);
    
    console.log('🎉 Production database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedProductionData();

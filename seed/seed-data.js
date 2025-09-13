const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/xeno-crm?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Customer schema
const customerSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  totalSpend: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
  lastOrderAt: Date,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Customer = mongoose.model('Customer', customerSchema);

// Order schema
const orderSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true },
  customerExternalId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled', 'refunded'], required: true },
  items: [{
    productId: String,
    name: String,
    quantity: Number,
    price: Number,
  }],
  orderDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', orderSchema);

// Generate random data
const generateCustomers = (count) => {
  const customers = [];
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma', 'Alex', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com'];
  const tags = ['VIP', 'Premium', 'Regular', 'New', 'Loyal', 'High-Value', 'Frequent', 'Seasonal'];

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
    const totalSpend = Math.floor(Math.random() * 2000) + 10;
    const visits = Math.floor(Math.random() * 20) + 1;
    const lastOrderAt = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
    const customerTags = tags.slice(0, Math.floor(Math.random() * 3) + 1);

    customers.push({
      externalId: `cust_${i.toString().padStart(4, '0')}`,
      email,
      firstName,
      lastName,
      phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
      totalSpend,
      visits,
      lastOrderAt,
      tags: customerTags,
    });
  }

  return customers;
};

const generateOrders = (customers, count) => {
  const orders = [];
  const products = [
    { id: 'prod_001', name: 'Winter Jacket', price: 89.99 },
    { id: 'prod_002', name: 'Summer Dress', price: 49.99 },
    { id: 'prod_003', name: 'Running Shoes', price: 129.99 },
    { id: 'prod_004', name: 'Handbag', price: 79.99 },
    { id: 'prod_005', name: 'Jeans', price: 59.99 },
    { id: 'prod_006', name: 'T-Shirt', price: 19.99 },
    { id: 'prod_007', name: 'Sneakers', price: 99.99 },
    { id: 'prod_008', name: 'Sweater', price: 69.99 },
  ];
  const statuses = ['completed', 'completed', 'completed', 'pending', 'cancelled', 'refunded'];
  const currencies = ['USD', 'EUR', 'GBP'];

  for (let i = 1; i <= count; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const amount = product.price * quantity;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const orderDate = new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000);

    orders.push({
      externalId: `order_${i.toString().padStart(6, '0')}`,
      customerExternalId: customer.externalId,
      amount,
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      status,
      items: [{
        productId: product.id,
        name: product.name,
        quantity,
        price: product.price,
      }],
      orderDate,
    });
  }

  return orders;
};

// Main seed function
const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Customer.deleteMany({});
    await Order.deleteMany({});

    // Generate customers
    console.log('👥 Generating customers...');
    const customers = generateCustomers(200);
    await Customer.insertMany(customers);
    console.log(`✅ Created ${customers.length} customers`);

    // Generate orders
    console.log('🛒 Generating orders...');
    const orders = generateOrders(customers, 500);
    await Order.insertMany(orders);
    console.log(`✅ Created ${orders.length} orders`);

    console.log('🎉 Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${customers.length} customers`);
    console.log(`- ${orders.length} orders`);
    console.log(`- Average spend per customer: $${(customers.reduce((sum, c) => sum + c.totalSpend, 0) / customers.length).toFixed(2)}`);
    console.log(`- Total revenue: $${orders.reduce((sum, o) => sum + o.amount, 0).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// Run seed
seedData();

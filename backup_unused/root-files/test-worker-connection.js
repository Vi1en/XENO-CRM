const amqp = require('amqplib');

async function testWorkerConnection() {
  try {
    console.log('🔍 Testing Worker Service Connection...');
    
    const rabbitmqUrl = 'amqps://dewrctwu:BPiMIhJXUPHtppEjOnedSzFqyKG3DAaF@puffin.rmq2.cloudamqp.com/dewrctwu';
    const mongodbUri = 'mongodb+srv://manabmallick3345_db_user:manabvilen69@crm-cluster.ucechwc.mongodb.net/xeno-crm?retryWrites=true&w=majority&appName=crm-cluster';
    
    console.log('📡 Testing RabbitMQ connection...');
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    console.log('✅ RabbitMQ connection successful');
    
    console.log('📡 Testing MongoDB connection...');
    const mongoose = require('mongoose');
    await mongoose.connect(mongodbUri);
    console.log('✅ MongoDB connection successful');
    
    console.log('🔄 Testing queue operations...');
    await channel.assertQueue('queue.campaign.delivery', { durable: true });
    console.log('✅ Queue assertion successful');
    
    await channel.close();
    await connection.close();
    await mongoose.disconnect();
    
    console.log('✅ All connections successful - Worker should work!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('Full error:', error);
  }
}

testWorkerConnection();

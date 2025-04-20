const mongoose = require('mongoose');
require('dotenv').config();

const checkMongoDB = async () => {
  try {
    console.log('Checking MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beontime');
    
    // Connect to MongoDB with increased timeout
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beontime', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    });
    
    console.log('MongoDB Connected Successfully!');
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if users collection exists and has data
    if (collections.some(c => c.name === 'users')) {
      const userCount = await conn.connection.db.collection('users').countDocuments();
      console.log(`Number of users in database: ${userCount}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    
    if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
      console.error('MongoDB connection timed out. Please check if MongoDB is running and accessible.');
      console.error('Try running: mongod --dbpath /path/to/data/directory');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to MongoDB. Please check if MongoDB is running.');
    } else if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your MongoDB credentials.');
    } else {
      console.error('Unknown error:', error.message);
    }
    
    process.exit(1);
  }
};

checkMongoDB(); 
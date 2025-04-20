const mongoose = require('mongoose');
const User = require('./models/User');
const notificationService = require('./services/notificationService');
const nodemailer = require('nodemailer');
require('dotenv').config();

const testHabitNotification = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beontime');
    
    // Connect to MongoDB with increased timeout
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beontime', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000, // Increased to 60 seconds
      socketTimeoutMS: 60000, // Increased to 60 seconds
      connectTimeoutMS: 60000, // Added explicit connect timeout
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10, // Limit connection pool size
      minPoolSize: 2, // Maintain at least 2 connections
      maxIdleTimeMS: 30000 // Close idle connections after 30 seconds
    });

    console.log('Connected to MongoDB successfully');

    // Find a user
    const user = await User.findOne();
    if (!user) {
      console.log('No users found in the database. Please create a user first.');
      process.exit(1);
    }

    console.log('Found user:', {
      id: user._id,
      email: user.email,
      notificationPreferences: user.notificationPreferences
    });

    // Create a test habit
    const testHabit = {
      _id: new mongoose.Types.ObjectId(),
      user: user._id,
      title: 'Test Habit',
      description: 'This is a test habit for notification testing',
      category: 'test',
      notifications: {
        enabled: true
      }
    };

    console.log('Testing habit completion notification...');
    await notificationService.createHabitCompletion(testHabit);
    console.log('Habit completion notification sent successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error testing habit notification:', error);
    
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

testHabitNotification(); 
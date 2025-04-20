require('dotenv').config();
const mongoose = require('mongoose');
const emailService = require('./services/emailService');

// Create a test user ID
const testUserId = '68056045866a7d264a2f13e6'; // Replace with a valid user ID from your database

// Test sending an email
const testEmailService = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beontime');
    
    // Connect to MongoDB with increased timeout
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/beontime', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000,
    });

    console.log('Connected to MongoDB successfully');
    console.log('Testing email service...');
    
    // Send a test email
    const result = await emailService.sendEmailNotification(
      testUserId,
      'Test Email from BeOnTime',
      'This is a test email to verify the email service is working.',
      '<h2>Test Email</h2><p>This is a test email to verify the email service is working.</p>'
    );
    
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error testing email service:', error);
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
};

testEmailService(); 
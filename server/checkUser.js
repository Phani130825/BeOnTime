const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beontime', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000
    });

    console.log('Connected to MongoDB');

    // Find all users
    const users = await User.find({}).select('-password');
    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));

    // Check specific user
    const email = 'test@example.com'; // Change this to the email you're trying to log in with
    const user = await User.findOne({ email });
    
    if (user) {
      console.log(`User with email ${email} found:`, {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      });
    } else {
      console.log(`No user found with email ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkUser(); 
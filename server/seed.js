const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Community = require('./models/Community');
const Challenge = require('./models/Challenge');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beontime', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await mongoose.connection.db.collection('communities').deleteMany({});
    await mongoose.connection.db.collection('challenges').deleteMany({});
    await mongoose.connection.db.collection('users').deleteMany({ email: 'test@example.com' });

    console.log('Cleared existing data');

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword
    });
    await testUser.save();
    console.log('Created test user');

    // Create sample communities
    const communities = [
      {
        name: 'Fitness Enthusiasts',
        description: 'A community for people who love fitness and healthy living',
        category: 'fitness',
        creator: testUser._id,
        members: [{ user: testUser._id, role: 'admin' }]
      },
      {
        name: 'Productivity Masters',
        description: 'Share tips and tricks for better productivity',
        category: 'productivity',
        creator: testUser._id,
        members: [{ user: testUser._id, role: 'admin' }]
      },
      {
        name: 'Learning Together',
        description: 'A community for lifelong learners',
        category: 'learning',
        creator: testUser._id,
        members: [{ user: testUser._id, role: 'admin' }]
      }
    ];

    // Create sample challenges
    const challenges = [
      {
        title: '30-Day Fitness Challenge',
        description: 'Complete a workout every day for 30 days',
        category: 'fitness',
        duration: 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        creator: testUser._id,
        requirements: {
          habitCategory: 'fitness',
          minStreak: 7,
          dailyGoal: 1
        }
      },
      {
        title: 'Productivity Sprint',
        description: 'Complete your daily tasks for 21 days straight',
        category: 'productivity',
        duration: 21,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        creator: testUser._id,
        requirements: {
          habitCategory: 'productivity',
          minStreak: 5,
          dailyGoal: 3
        }
      }
    ];

    // Insert the data
    await Community.insertMany(communities);
    console.log('Created communities');
    await Challenge.insertMany(challenges);
    console.log('Created challenges');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 
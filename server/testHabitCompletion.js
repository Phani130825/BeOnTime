require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Habit = require('./models/Habit');
const notificationService = require('./services/notificationService');

const testHabitCompletion = async () => {
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

    // Create a new habit
    console.log('Creating new habit...');
    const habit = new Habit({
      user: user._id,
      title: 'Test Habit',
      description: 'This is a test habit',
      category: 'health',
      frequency: 'Daily',
      targetDays: 1,
      startTime: '08:00',
      endTime: '09:00',
      notifications: {
        enabled: true,
        startEnabled: true,
        endEnabled: true,
        endReminderMinutes: 5
      }
    });

    // Save the habit
    await habit.save();
    console.log('New habit created successfully');

    // Complete the habit
    console.log('Completing habit...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update completion history
    habit.completionHistory.push({
      date: today,
      completed: true
    });

    // Update progress
    habit.progress.push({
      date: today,
      completed: true
    });

    // Update streak
    habit.streak = 1;
    habit.completed = true;

    // Save the updated habit
    await habit.save();
    console.log('Habit updated successfully');

    // Create completion notification
    console.log('Creating completion notification...');
    await notificationService.createHabitCompletion(habit);
    console.log('Habit completion notification sent successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testHabitCompletion(); 
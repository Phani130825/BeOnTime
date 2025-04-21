const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const habitRoutes = require('./routes/habits');
const challengeRoutes = require('./routes/challenges');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/auth');
const notificationRoutes = require('./routes/notificationRoutes');
const scheduler = require('./services/scheduler');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beontime', {
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
}).then(() => {
  console.log('Connected to MongoDB');
  // Start the scheduler
  scheduler.start();
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  console.log('Build path:', buildPath);
  console.log('Build directory exists:', require('fs').existsSync(buildPath));
  
  // Serve static files from the React app
  app.use(express.static(buildPath));

  // The "catchall" handler: for any request that doesn't
  // match one above, send back React's index.html file.
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
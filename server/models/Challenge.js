const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['health', 'fitness', 'learning', 'productivity', 'wellness', 'other'],
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  }],
  requirements: {
    habitCategory: {
      type: String,
      enum: ['health', 'fitness', 'learning', 'productivity', 'wellness', 'other'],
    },
    minStreak: {
      type: Number,
      default: 0,
    },
    dailyGoal: {
      type: Number,
      default: 1,
    },
  },
  rewards: {
    points: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
    },
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed'],
    default: 'upcoming',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamps on save
challengeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update challenge status based on dates
challengeSchema.pre('save', function(next) {
  const now = new Date();
  
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'active';
  } else {
    this.status = 'completed';
  }
  
  next();
});

// Method to add a participant
challengeSchema.methods.addParticipant = function(userId) {
  if (!this.participants.some(p => p.user.toString() === userId.toString())) {
    this.participants.push({ user: userId });
  }
};

// Method to update participant progress
challengeSchema.methods.updateParticipantProgress = function(userId, progress) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.progress = progress;
    participant.completed = progress >= 100;
  }
};

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge; 
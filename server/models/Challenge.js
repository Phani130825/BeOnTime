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
  habitDetails: {
    title: {
      type: String,
      required: true,
    },
    description: String,
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
      required: true,
    },
    targetDays: {
      type: Number,
      required: true,
      min: 1,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 1440, // 24 hours in minutes
    },
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
    completionDate: Date,
    timePreferences: {
      startTime: {
        type: String,
        validate: {
          validator: function(v) {
            return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
          },
          message: props => `${props.value} is not a valid time format! Use HH:mm format.`,
        },
      },
      endTime: {
        type: String,
        validate: {
          validator: function(v) {
            return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
          },
          message: props => `${props.value} is not a valid time format! Use HH:mm format.`,
        },
      },
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

// Method to update participant time preferences
challengeSchema.methods.updateParticipantTimePreferences = function(userId, timePreferences) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.timePreferences = timePreferences;
  }
};

// Method to add challenge habit to a participant
challengeSchema.methods.addHabitToParticipant = async function(userId, Habit) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) return;

  const habit = new Habit({
    user: userId,
    title: this.habitDetails.title,
    description: this.habitDetails.description,
    category: this.category,
    frequency: this.habitDetails.frequency,
    targetDays: this.habitDetails.targetDays,
    startTime: participant.timePreferences?.startTime,
    endTime: participant.timePreferences?.endTime,
    isChallengeHabit: true,
    challenge: this._id,
    startDate: this.startDate,
    endDate: this.endDate
  });
  
  await habit.save();
};

// Method to remove challenge habit from a participant
challengeSchema.methods.removeHabitFromParticipant = async function(userId, Habit) {
  await Habit.deleteOne({
    user: userId,
    challenge: this._id
  });
};

// Method to check if a participant has completed the challenge
challengeSchema.methods.checkCompletion = async function(userId, Habit) {
  const habit = await Habit.findOne({
    user: userId,
    challenge: this._id
  });
  
  if (!habit) return false;
  
  const now = new Date();
  if (now > this.endDate) {
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (participant && !participant.completed) {
      participant.completed = true;
      participant.completionDate = now;
      await this.save();
    }
    return true;
  }
  
  return false;
};

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge; 
const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['health', 'fitness', 'learning', 'productivity', 'wellness', 'other']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    }
  }],
  adminHabits: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly'],
      required: true
    },
    targetDays: {
      type: Number,
      required: true,
      min: 1
    },
    startTime: {
      type: String,
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format! Use HH:mm format.`
      }
    },
    endTime: {
      type: String,
      validate: {
        validator: function(v) {
          return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
        },
        message: props => `${props.value} is not a valid time format! Use HH:mm format.`
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  posts: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
communitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to add an admin habit to all members' habits
communitySchema.methods.addAdminHabitToMembers = async function(adminHabit, Habit) {
  const members = this.members.map(m => m.user);
  const habits = members.map(userId => ({
    user: userId,
    title: adminHabit.title,
    description: adminHabit.description,
    category: this.category,
    frequency: adminHabit.frequency,
    targetDays: adminHabit.targetDays,
    startTime: adminHabit.startTime,
    endTime: adminHabit.endTime,
    isCommunityAdminHabit: true,
    community: this._id,
    communityAdminHabitId: adminHabit._id,
    createdBy: adminHabit.createdBy
  }));
  
  await Habit.insertMany(habits);
};

// Method to remove an admin habit from all members' habits
communitySchema.methods.removeAdminHabitFromMembers = async function(adminHabitId, Habit) {
  await Habit.deleteMany({
    community: this._id,
    communityAdminHabitId: adminHabitId
  });
};

// Method to update an admin habit in all members' habits
communitySchema.methods.updateAdminHabitInMembers = async function(adminHabit, Habit) {
  await Habit.updateMany(
    {
      community: this._id,
      communityAdminHabitId: adminHabit._id
    },
    {
      $set: {
        title: adminHabit.title,
        description: adminHabit.description,
        frequency: adminHabit.frequency,
        targetDays: adminHabit.targetDays,
        startTime: adminHabit.startTime,
        endTime: adminHabit.endTime
      }
    }
  );
};

// Method to get all members' progress for a specific admin habit
communitySchema.methods.getAdminHabitProgress = async function(adminHabitId, Habit) {
  const habits = await Habit.find({
    community: this._id,
    communityAdminHabitId: adminHabitId
  }).populate('user', 'name email');
  
  return habits.map(habit => ({
    user: habit.user,
    streak: habit.streak,
    progress: habit.progress,
    lastCompleted: habit.progress.length > 0 ? habit.progress[habit.progress.length - 1].date : null
  }));
};

const Community = mongoose.model('Community', communitySchema);

module.exports = Community; 
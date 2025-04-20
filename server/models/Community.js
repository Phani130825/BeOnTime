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
  tasks: [{
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

// Method to add a task to all members' habits
communitySchema.methods.addTaskToMemberHabits = async function(task, Habit) {
  const members = this.members.map(m => m.user);
  const habits = members.map(userId => ({
    user: userId,
    title: task.title,
    description: task.description,
    category: this.category,
    frequency: task.frequency,
    targetDays: task.targetDays,
    startTime: task.startTime,
    endTime: task.endTime,
    isCommunityTask: true,
    community: this._id,
    communityTaskId: task._id
  }));
  
  await Habit.insertMany(habits);
};

// Method to remove a task from all members' habits
communitySchema.methods.removeTaskFromMemberHabits = async function(taskId, Habit) {
  await Habit.deleteMany({
    community: this._id,
    communityTaskId: taskId
  });
};

// Method to update a task in all members' habits
communitySchema.methods.updateTaskInMemberHabits = async function(task, Habit) {
  await Habit.updateMany(
    {
      community: this._id,
      communityTaskId: task._id
    },
    {
      $set: {
        title: task.title,
        description: task.description,
        frequency: task.frequency,
        targetDays: task.targetDays,
        startTime: task.startTime,
        endTime: task.endTime
      }
    }
  );
};

const Community = mongoose.model('Community', communitySchema);

module.exports = Community; 
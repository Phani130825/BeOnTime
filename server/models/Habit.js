const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Health', 'Productivity', 'Self-Care', 'Learning', 'Other']
    },
    frequency: {
        type: String,
        required: true,
        enum: ['Daily', 'Weekly', 'Monthly']
    },
    targetDays: {
        type: Number,
        required: true,
        min: 1
    },
    startDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String
    },
    endDate: {
        type: Date
    },
    endTime: {
        type: String
    },
    notifications: {
        enabled: {
            type: Boolean,
            default: true
        },
        time: {
            type: String
        }
    },
    streak: {
        type: Number,
        default: 0
    },
    streakGoal: {
        type: Number,
        default: 30
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    completed: {
        type: Boolean,
        default: false
    },
    completionHistory: [{
        date: {
            type: Date,
            required: true
        },
        completed: {
            type: Boolean,
            required: true
        }
    }],
    notes: [{
        content: {
            type: String,
            default: ''
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [{
        type: String,
        trim: true
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
habitSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate streak and progress before saving
habitSchema.pre('save', function(next) {
    if (this.completionHistory && this.completionHistory.length > 0) {
        // Sort completion history by date
        const sortedHistory = this.completionHistory.sort((a, b) => b.date - a.date);
        
        // Calculate current streak
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < sortedHistory.length; i++) {
            const date = new Date(sortedHistory[i].date);
            date.setHours(0, 0, 0, 0);
            
            if (sortedHistory[i].completed) {
                if (i === 0 || (date.getTime() === today.getTime() - (streak * 86400000))) {
                    streak++;
                } else {
                    break;
                }
            }
        }
        
        this.streak = streak;
        
        // Calculate progress
        const totalDays = this.completionHistory.length;
        const completedDays = this.completionHistory.filter(day => day.completed).length;
        this.progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    }
    
    next();
});

// Method to check if habit was completed on a specific date
habitSchema.methods.isCompletedOnDate = function(date) {
    return this.completionHistory.some(entry => 
        entry.date.toDateString() === date.toDateString() && entry.completed
    );
};

// Method to add completion for a date
habitSchema.methods.addCompletion = function(date) {
    const existingEntry = this.completionHistory.find(entry => 
        entry.date.toDateString() === date.toDateString()
    );

    if (existingEntry) {
        existingEntry.completed = true;
    } else {
        this.completionHistory.push({ date, completed: true });
    }

    // Update streak
    this.updateStreak();
};

// Method to update streak
habitSchema.methods.updateStreak = function() {
    const today = new Date();
    let currentStreak = 0;
    let date = new Date(today);

    while (this.isCompletedOnDate(date)) {
        currentStreak++;
        date.setDate(date.getDate() - 1);
    }

    this.streak = currentStreak;
    if (currentStreak > this.streakGoal) {
        this.streakGoal = currentStreak;
    }
};

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit; 
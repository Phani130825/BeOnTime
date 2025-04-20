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
        enum: ['health', 'fitness', 'learning', 'productivity', 'wellness', 'other', 'self-care'],
        lowercase: true
    },
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
    isChallengeHabit: {
        type: Boolean,
        default: false
    },
    challenge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Challenge'
    },
    isCommunityAdminHabit: {
        type: Boolean,
        default: false
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    },
    communityAdminHabitId: {
        type: mongoose.Schema.Types.ObjectId
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    notifications: {
        enabled: {
            type: Boolean,
            default: true
        },
        startEnabled: {
            type: Boolean,
            default: true
        },
        endEnabled: {
            type: Boolean,
            default: true
        },
        endReminderMinutes: {
            type: Number,
            default: 5,
            min: 1,
            max: 60
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
    progress: [{
        date: {
            type: Date,
            required: true
        },
        completed: {
            type: Boolean,
            required: true
        },
        notes: String
    }],
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
    this.updatedAt = new Date();
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

// Method to mark habit as completed for a specific date
habitSchema.methods.markCompleted = async function(notes = '') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayProgress = this.progress.find(p => {
        const progressDate = new Date(p.date);
        progressDate.setHours(0, 0, 0, 0);
        return progressDate.getTime() === today.getTime();
    });
    
    if (todayProgress) {
        todayProgress.completed = true;
        todayProgress.notes = notes;
    } else {
        this.progress.push({
            date: today,
            completed: true,
            notes
        });
    }
    
    // Update streak
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayProgress = this.progress.find(p => {
        const progressDate = new Date(p.date);
        progressDate.setHours(0, 0, 0, 0);
        return progressDate.getTime() === yesterday.getTime();
    });
    
    if (yesterdayProgress && yesterdayProgress.completed) {
        this.streak += 1;
    } else {
        this.streak = 1;
    }
    
    await this.save();
};

// Method to mark habit as incomplete for today
habitSchema.methods.markIncomplete = async function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayProgress = this.progress.find(p => {
        const progressDate = new Date(p.date);
        progressDate.setHours(0, 0, 0, 0);
        return progressDate.getTime() === today.getTime();
    });
    
    if (todayProgress) {
        todayProgress.completed = false;
    }
    
    this.streak = 0;
    await this.save();
};

// Method to check if habit is completed for a specific date
habitSchema.methods.isCompleted = function(date) {
    const progress = this.progress.find(p => 
        p.date.toDateString() === date.toDateString()
    );
    return progress ? progress.completed : false;
};

// Method to get completion rate
habitSchema.methods.getCompletionRate = function() {
    const totalDays = this.progress.length;
    if (totalDays === 0) return 0;
    
    const completedDays = this.progress.filter(p => p.completed).length;
    return (completedDays / totalDays) * 100;
};

// Method to check if a habit is completed for today
habitSchema.methods.isCompletedToday = function() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayProgress = this.progress.find(p => {
        const progressDate = new Date(p.date);
        progressDate.setHours(0, 0, 0, 0);
        return progressDate.getTime() === today.getTime();
    });
    
    return todayProgress ? todayProgress.completed : false;
};

// Index for faster queries
habitSchema.index({ user: 1, startDate: 1 });
habitSchema.index({ user: 1, completed: 1 });
habitSchema.index({ user: 1, 'notifications.enabled': 1 });

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit; 
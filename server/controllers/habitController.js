const Habit = require('../models/Habit');
const notificationService = require('../services/notificationService');

// Create new habit
exports.createHabit = async (req, res) => {
    try {
        console.log('Creating new habit with data:', {
            body: req.body,
            userId: req.user._id
        });

        const habit = new Habit({
            ...req.body,
            user: req.user._id
        });

        await habit.save();
        console.log('Habit saved successfully:', habit);

        // Create a notification for the new habit
        console.log('Attempting to create notification for habit:', {
            habitId: habit._id,
            title: habit.title,
            userId: habit.user,
            notifications: habit.notifications
        });
        
        await notificationService.createHabitReminder(habit);
        console.log('Notification created successfully');

        res.status(201).json(habit);
    } catch (error) {
        console.error('Error in createHabit:', error);
        res.status(400).json({ message: error.message });
    }
};

// Mark habit as completed
exports.completeHabit = async (req, res) => {
    try {
        const habit = await Habit.findById(req.params.id).populate('challenge');
        
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        // Check if user owns the habit
        if (habit.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to complete this habit' });
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Ensure progress is an array of objects
        if (!Array.isArray(habit.progress)) {
            habit.progress = [];
        }

        // Ensure completionHistory is an array of objects
        if (!Array.isArray(habit.completionHistory)) {
            habit.completionHistory = [];
        }

        // Check if habit is already completed for today
        const existingProgress = habit.progress.find(p => 
            p && typeof p === 'object' && p.date && p.date.toDateString() === today.toDateString()
        );

        if (existingProgress) {
            existingProgress.completed = true;
        } else {
            habit.progress.push({
                date: today,
                completed: true
            });
        }

        // Update completionHistory
        const existingHistory = habit.completionHistory.find(h => 
            h && typeof h === 'object' && h.date && h.date.toDateString() === today.toDateString()
        );

        if (existingHistory) {
            existingHistory.completed = true;
        } else {
            habit.completionHistory.push({
                date: today,
                completed: true
            });
        }

        // Update streak
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const yesterdayProgress = habit.progress.find(p => 
            p && typeof p === 'object' && p.date && p.date.toDateString() === yesterday.toDateString() && p.completed
        );

        if (yesterdayProgress) {
            habit.streak = (habit.streak || 0) + 1;
        } else {
            habit.streak = 1;
        }

        // Update the completed field
        habit.completed = true;

        // If this is a challenge habit, update the challenge progress
        if (habit.isChallengeHabit && habit.challenge) {
            const challenge = habit.challenge;
            const participant = challenge.participants.find(p => 
                p.user.toString() === req.user._id.toString()
            );

            if (participant) {
                // Calculate progress based on completed days
                const totalDays = Math.ceil((challenge.endDate - challenge.startDate) / (1000 * 60 * 60 * 24));
                const completedDays = habit.completionHistory.filter(h => h.completed).length;
                const progress = Math.min(100, Math.round((completedDays / totalDays) * 100));

                participant.progress = progress;
                participant.completed = progress >= 100;
                if (participant.completed) {
                    participant.completionDate = new Date();
                }

                await challenge.save();
            }
        }

        // Ensure category is lowercase
        if (habit.category) {
            habit.category = habit.category.toLowerCase();
        }

        // Validate the habit before saving
        const validationError = habit.validateSync();
        if (validationError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationError.errors
            });
        }

        await habit.save();

        // Create completion notification
        await notificationService.createHabitCompletion(habit);

        res.json(habit);
    } catch (error) {
        console.error('Error completing habit:', error);
        res.status(500).json({ 
            message: 'Error completing habit', 
            error: error.message,
            details: error.errors 
        });
    }
};

// Update habit
exports.updateHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        res.json(habit);
    } catch (error) {
        console.error('Error updating habit:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete habit
exports.deleteHabit = async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        res.json({ message: 'Habit deleted successfully' });
    } catch (error) {
        console.error('Error deleting habit:', error);
        res.status(400).json({ message: error.message });
    }
};

// Get all habits for a user
exports.getHabits = async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user._id }).select('title description startDate endDate startTime endTime completionHistory streak progress category');
        res.json(habits);
    } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(400).json({ message: error.message });
    }
}; 
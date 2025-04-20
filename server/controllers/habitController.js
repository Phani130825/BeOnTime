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
        const habit = await Habit.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { completed: true },
            { new: true }
        );

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        // Create completion notification
        await notificationService.createHabitCompletion(habit);

        res.json(habit);
    } catch (error) {
        console.error('Error completing habit:', error);
        res.status(400).json({ message: error.message });
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
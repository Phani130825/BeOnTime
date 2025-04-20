const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Habit = require('../models/Habit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const habitController = require('../controllers/habitController');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Create new habit
router.post('/', auth, async (req, res) => {
    try {
        // Validate required fields
        const { title, category, frequency, targetDays, startDate } = req.body;
        if (!title || !category || !frequency || !targetDays || !startDate) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                code: 'MISSING_FIELDS',
                details: ['title', 'category', 'frequency', 'targetDays', 'startDate'].filter(field => !req.body[field])
            });
        }

        // Validate category
        const validCategories = ['Health', 'Productivity', 'Self-Care', 'Learning', 'Other'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ 
                message: 'Invalid category',
                code: 'INVALID_CATEGORY'
            });
        }

        // Validate frequency
        const validFrequencies = ['Daily', 'Weekly', 'Monthly'];
        if (!validFrequencies.includes(frequency)) {
            return res.status(400).json({ 
                message: 'Invalid frequency',
                code: 'INVALID_FREQUENCY'
            });
        }

        // Validate target days
        if (targetDays < 1) {
            return res.status(400).json({ 
                message: 'Target days must be at least 1',
                code: 'INVALID_TARGET_DAYS'
            });
        }

        // Validate dates
        const startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) {
            return res.status(400).json({ 
                message: 'Invalid start date format. Expected format: YYYY-MM-DD',
                code: 'INVALID_START_DATE'
            });
        }

        const endDate = req.body.endDate ? new Date(req.body.endDate) : null;
        if (endDate && isNaN(endDate.getTime())) {
            return res.status(400).json({ 
                message: 'Invalid end date format. Expected format: YYYY-MM-DD',
                code: 'INVALID_END_DATE'
            });
        }

        // Validate time formats
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (req.body.startTime && !timeRegex.test(req.body.startTime)) {
            return res.status(400).json({
                message: 'Invalid start time format. Expected format: HH:mm',
                code: 'INVALID_START_TIME'
            });
        }

        if (req.body.endTime && !timeRegex.test(req.body.endTime)) {
            return res.status(400).json({
                message: 'Invalid end time format. Expected format: HH:mm',
                code: 'INVALID_END_TIME'
            });
        }

        // Use the controller function to create the habit
        return habitController.createHabit(req, res);
    } catch (error) {
        console.error('Error creating habit:', error);
        res.status(400).json({ 
            message: error.message,
            code: 'SAVE_ERROR',
            details: error.errors 
        });
    }
});

// Get all habits for a user
router.get('/', auth, async (req, res) => {
    try {
        const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get today's habits
router.get('/today', auth, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const habits = await Habit.find({
            user: req.user._id,
            startDate: { $lte: tomorrow },
            endDate: { $gte: today },
        }).sort('startTime');

        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get habits by category
router.get('/category/:category', auth, async (req, res) => {
    try {
        const habits = await Habit.find({
            user: req.user._id,
            category: req.params.category,
        }).sort({ createdAt: -1 });
        res.json(habits);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single habit
router.get('/:id', auth, async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        res.json(habit);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update habit
router.patch('/:id', auth, async (req, res) => {
    try {
        console.log('Received update request:', {
            id: req.params.id,
            body: req.body,
            userId: req.user._id
        });

        const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
        if (!habit) {
            console.log('Habit not found:', req.params.id);
            return res.status(404).json({ message: 'Habit not found' });
        }

        // Validate category if provided
        if (req.body.category) {
            const validCategories = ['Health', 'Productivity', 'Self-Care', 'Learning', 'Other'];
            if (!validCategories.includes(req.body.category)) {
                console.log('Invalid category:', req.body.category);
                return res.status(400).json({ 
                    message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
                    code: 'INVALID_CATEGORY'
                });
            }
        }

        // Validate frequency if provided
        if (req.body.frequency) {
            const validFrequencies = ['Daily', 'Weekly', 'Monthly'];
            if (!validFrequencies.includes(req.body.frequency)) {
                console.log('Invalid frequency:', req.body.frequency);
                return res.status(400).json({ 
                    message: `Invalid frequency. Must be one of: ${validFrequencies.join(', ')}`,
                    code: 'INVALID_FREQUENCY'
                });
            }
        }

        // Validate targetDays if provided
        if (req.body.targetDays && req.body.targetDays < 1) {
            console.log('Invalid targetDays:', req.body.targetDays);
            return res.status(400).json({ 
                message: 'Target days must be at least 1',
                code: 'INVALID_TARGET_DAYS'
            });
        }

        // Format dates if provided
        if (req.body.startDate) {
            const startDate = new Date(req.body.startDate);
            if (isNaN(startDate.getTime())) {
                console.log('Invalid startDate:', req.body.startDate);
                return res.status(400).json({ 
                    message: 'Invalid start date format. Expected format: YYYY-MM-DD',
                    code: 'INVALID_START_DATE'
                });
            }
            req.body.startDate = startDate;
        }

        if (req.body.endDate) {
            const endDate = new Date(req.body.endDate);
            if (isNaN(endDate.getTime())) {
                console.log('Invalid endDate:', req.body.endDate);
                return res.status(400).json({ 
                    message: 'Invalid end date format. Expected format: YYYY-MM-DD',
                    code: 'INVALID_END_DATE'
                });
            }
            req.body.endDate = endDate;
        }

        // Validate time formats if provided
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (req.body.startTime && !timeRegex.test(req.body.startTime)) {
            console.log('Invalid startTime:', req.body.startTime);
            return res.status(400).json({
                message: 'Invalid start time format. Expected format: HH:mm',
                code: 'INVALID_START_TIME'
            });
        }

        if (req.body.endTime && !timeRegex.test(req.body.endTime)) {
            console.log('Invalid endTime:', req.body.endTime);
            return res.status(400).json({
                message: 'Invalid end time format. Expected format: HH:mm',
                code: 'INVALID_END_TIME'
            });
        }

        // Update habit with validated data
        const updateData = {};
        Object.keys(req.body).forEach(key => {
            if (key !== '_id' && key !== 'user' && key !== 'createdAt' && key !== 'updatedAt') {
                updateData[key] = req.body[key];
            }
        });

        console.log('Updating habit with data:', updateData);

        Object.assign(habit, updateData);
        const updatedHabit = await habit.save();
        
        console.log('Habit updated successfully:', updatedHabit);
        res.json(updatedHabit);
    } catch (error) {
        console.error('Error updating habit:', error);
        res.status(400).json({ 
            message: error.message,
            code: 'UPDATE_ERROR',
            details: error.errors 
        });
    }
});

// Delete habit
router.delete('/:id', auth, async (req, res) => {
    try {
        const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }
        res.json({ message: 'Habit deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark habit as completed
router.post('/:id/complete', auth, habitController.completeHabit);

// Add a note to a habit
router.post('/:id/notes', auth, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({ 
                message: 'Note text is required and must be a non-empty string',
                code: 'INVALID_NOTE_TEXT'
            });
        }

        const habit = await Habit.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        habit.notes.push({
            content: text.trim(),
            createdAt: new Date(),
        });

        const updatedHabit = await habit.save();
        res.json(updatedHabit);
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(400).json({ 
            message: error.message,
            code: 'ADD_NOTE_ERROR'
        });
    }
});

// Get habit statistics
router.get('/:id/stats', auth, async (req, res) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' });
        }

        const stats = {
            streak: habit.streak,
            progress: habit.progress,
            totalCompletions: habit.completionHistory.filter(h => h.completed).length,
            streakGoal: habit.streakGoal,
            lastCompleted: habit.completionHistory.length > 0
                ? habit.completionHistory[habit.completionHistory.length - 1].date
                : null,
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 
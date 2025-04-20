const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');
const User = require('../models/User');

// Get all notifications
router.get('/', auth, notificationController.getNotifications);

// Get notification preferences
router.get('/preferences', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ 
            email: user.notificationPreferences?.email || false 
        });
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark notification as read
router.patch('/:notificationId/read', auth, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', auth, notificationController.markAllAsRead);

// Update notification preferences
router.patch('/preferences', auth, async (req, res) => {
    try {
        const { email } = req.body;
        await User.findByIdAndUpdate(req.user._id, {
            'notificationPreferences.email': email
        });
        res.json({ message: 'Notification preferences updated successfully' });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 
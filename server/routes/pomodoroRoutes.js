const express = require('express');
const router = express.Router();
const pomodoroController = require('../controllers/pomodoroController');
const auth = require('../middleware/auth');

// All routes are protected and require authentication
router.use(auth);

// Create a new pomodoro session
router.post('/sessions', pomodoroController.createSession);

// Get user's pomodoro sessions
router.get('/sessions', pomodoroController.getUserSessions);

// Get user's daily stats
router.get('/daily-stats', pomodoroController.getDailyStats);

// Reset daily stats
router.post('/reset-daily', pomodoroController.resetDailyStats);

module.exports = router; 
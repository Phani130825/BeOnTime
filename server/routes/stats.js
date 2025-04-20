const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserStats } = require('../controllers/statsController');

// Get user statistics
router.get('/', protect, getUserStats);

module.exports = router; 
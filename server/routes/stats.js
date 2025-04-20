const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const statsController = require('../controllers/statsController');

// Get user statistics
router.get('/', auth, statsController.getUserStats);

module.exports = router; 
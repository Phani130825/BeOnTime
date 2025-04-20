const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Placeholder routes for challenges
router.get('/', auth, (req, res) => {
  res.json({ message: 'Challenges feature coming soon' });
});

module.exports = router; 
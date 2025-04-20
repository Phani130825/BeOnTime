const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const challengeController = require('../controllers/challengeController');

// Get all challenges
router.get('/', auth, challengeController.getChallenges);

// Create a new challenge
router.post('/', auth, challengeController.createChallenge);

// Join a challenge
router.post('/:id/join', auth, challengeController.joinChallenge);

// Get challenge details
router.get('/:id', auth, challengeController.getChallenge);

module.exports = router; 
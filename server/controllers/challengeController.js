const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Habit = require('../models/Habit');

// Get all challenges
exports.getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate('creator', 'username email')
      .populate('participants.user', 'username email')
      .sort({ createdAt: -1 });
    
    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
};

// Create a new challenge
exports.createChallenge = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      duration, 
      startDate, 
      endDate, 
      requirements,
      habitDetails 
    } = req.body;
    
    // Validate required habitDetails fields
    if (!habitDetails || !habitDetails.title || !habitDetails.frequency || 
        !habitDetails.targetDays || !habitDetails.duration) {
      return res.status(400).json({ 
        message: 'Missing required habit details: title, frequency, targetDays, and duration are required' 
      });
    }

    const challenge = new Challenge({
      title,
      description,
      category,
      duration,
      startDate,
      endDate,
      requirements,
      habitDetails,
      creator: req.user._id
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(400).json({ message: error.message });
  }
};

// Join a challenge
exports.joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user is already a participant
    const isParticipant = challenge.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (isParticipant) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    // Create a new habit for the participant
    const habit = new Habit({
      user: req.user._id,
      title: challenge.habitDetails.title,
      description: challenge.habitDetails.description,
      category: challenge.category,
      frequency: challenge.habitDetails.frequency,
      targetDays: challenge.habitDetails.targetDays,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      isChallengeHabit: true,
      challenge: challenge._id,
      notifications: {
        enabled: true,
        startEnabled: true,
        endEnabled: true,
        endReminderMinutes: 5
      }
    });

    await habit.save();

    // Add participant to challenge
    challenge.participants.push({ 
      user: req.user._id,
      joinedAt: new Date()
    });
    await challenge.save();

    res.json(challenge);
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ message: 'Error joining challenge' });
  }
};

// Get challenge details
exports.getChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('participants.user', 'username email');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ message: 'Error fetching challenge' });
  }
}; 
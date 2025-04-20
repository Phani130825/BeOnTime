const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Community = require('../models/Community');

// Get all communities
router.get('/', auth, async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('creator', 'username email')
      .populate('members.user', 'username email')
      .sort({ createdAt: -1 });
    res.json(communities);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ message: 'Error fetching communities' });
  }
});

// Create a new community
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category } = req.body;
    
    const community = new Community({
      name,
      description,
      category,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await community.save();
    res.status(201).json(community);
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(400).json({ message: 'Error creating community' });
  }
});

// Join a community
router.post('/:id/join', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is already a member
    const isMember = community.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this community' });
    }

    community.members.push({ user: req.user._id });
    await community.save();

    res.json(community);
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ message: 'Error joining community' });
  }
});

// Get community details
router.get('/:id', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'username email')
      .populate('members.user', 'username email')
      .populate('posts.user', 'username email');
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json(community);
  } catch (error) {
    console.error('Error fetching community:', error);
    res.status(500).json({ message: 'Error fetching community' });
  }
});

module.exports = router; 
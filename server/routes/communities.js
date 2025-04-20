const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Community = require('../models/Community');
const Habit = require('../models/Habit');

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

    // Add all existing admin habits to the new member
    for (const adminHabit of community.adminHabits) {
      const habit = new Habit({
        user: req.user._id,
        title: adminHabit.title,
        description: adminHabit.description,
        category: community.category,
        frequency: adminHabit.frequency,
        targetDays: adminHabit.targetDays,
        startTime: adminHabit.startTime,
        endTime: adminHabit.endTime,
        isCommunityAdminHabit: true,
        community: community._id,
        communityAdminHabitId: adminHabit._id,
        createdBy: adminHabit.createdBy
      });
      await habit.save();
    }

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

// Create a new admin habit for a community
router.post('/:id/admin-habits', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is admin
    const isAdmin = community.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can create habits' });
    }

    const { title, description, frequency, targetDays, startTime, endTime } = req.body;
    
    const adminHabit = {
      title,
      description,
      frequency,
      targetDays,
      startTime,
      endTime,
      createdBy: req.user._id
    };

    community.adminHabits.push(adminHabit);
    await community.save();

    // Add the habit to all existing members
    await community.addAdminHabitToMembers(adminHabit, Habit);

    res.status(201).json(adminHabit);
  } catch (error) {
    console.error('Error creating admin habit:', error);
    res.status(400).json({ message: 'Error creating admin habit' });
  }
});

// Delete an admin habit from a community
router.delete('/:id/admin-habits/:habitId', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is admin
    const isAdmin = community.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can delete habits' });
    }

    const habitIndex = community.adminHabits.findIndex(
      h => h._id.toString() === req.params.habitId
    );

    if (habitIndex === -1) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Remove the habit from all members
    await community.removeAdminHabitFromMembers(req.params.habitId, Habit);

    // Remove the habit from the community
    community.adminHabits.splice(habitIndex, 1);
    await community.save();

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin habit:', error);
    res.status(500).json({ message: 'Error deleting admin habit' });
  }
});

// Update an admin habit in a community
router.put('/:id/admin-habits/:habitId', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is admin
    const isAdmin = community.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can update habits' });
    }

    const habitIndex = community.adminHabits.findIndex(
      h => h._id.toString() === req.params.habitId
    );

    if (habitIndex === -1) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const { title, description, frequency, targetDays, startTime, endTime } = req.body;
    
    const updatedHabit = {
      ...community.adminHabits[habitIndex],
      title,
      description,
      frequency,
      targetDays,
      startTime,
      endTime
    };

    // Update the habit for all members
    await community.updateAdminHabitInMembers(updatedHabit, Habit);

    // Update the habit in the community
    community.adminHabits[habitIndex] = updatedHabit;
    await community.save();

    res.json(updatedHabit);
  } catch (error) {
    console.error('Error updating admin habit:', error);
    res.status(400).json({ message: 'Error updating admin habit' });
  }
});

// Get progress for all members for a specific admin habit
router.get('/:id/admin-habits/:habitId/progress', auth, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is admin
    const isAdmin = community.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can view progress' });
    }

    const progress = await community.getAdminHabitProgress(req.params.habitId, Habit);
    res.json(progress);
  } catch (error) {
    console.error('Error fetching habit progress:', error);
    res.status(500).json({ message: 'Error fetching habit progress' });
  }
});

module.exports = router; 
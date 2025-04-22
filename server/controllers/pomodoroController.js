const PomodoroSession = require('../models/PomodoroSession');

// Validate session input
const validateSessionInput = (type, duration) => {
  const errors = [];
  
  if (!['work', 'shortBreak', 'longBreak'].includes(type)) {
    errors.push('Invalid session type');
  }
  
  if (typeof duration !== 'number' || duration <= 0 || duration > 120) {
    errors.push('Duration must be a positive number between 1 and 120 minutes');
  }
  
  return errors;
};

// Create a new pomodoro session
exports.createSession = async (req, res) => {
  try {
    const { type, duration } = req.body;
    const userId = req.user._id;

    // Validate input
    const errors = validateSessionInput(type, duration);
    if (errors.length > 0) {
      return res.status(400).json({ 
        message: 'Invalid input',
        errors 
      });
    }

    const session = new PomodoroSession({
      userId,
      type,
      duration,
      completedAt: new Date()
    });

    await session.save();
    console.log(`Pomodoro session saved: ${type} session for ${duration} minutes`);
    res.status(201).json(session);
  } catch (error) {
    console.error('Error saving pomodoro session:', error);
    res.status(500).json({ 
      message: 'Failed to save pomodoro session',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's pomodoro sessions
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 50, skip = 0 } = req.query;

    const sessions = await PomodoroSession.find({ userId })
      .sort({ completedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await PomodoroSession.countDocuments({ userId });

    res.json({
      sessions,
      total,
      hasMore: total > parseInt(skip) + sessions.length
    });
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    res.status(500).json({ 
      message: 'Failed to fetch pomodoro sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user's daily stats
exports.getDailyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await PomodoroSession.find({
      userId,
      completedAt: { $gte: today }
    }).sort({ completedAt: -1 });

    // Ensure we always return a valid response structure
    const stats = {
      totalPomodoros: sessions.filter(s => s.type === 'work').length,
      totalMinutes: sessions.reduce((acc, curr) => acc + (curr.duration || 0), 0),
      sessions: sessions.map(session => ({
        _id: session._id,
        type: session.type,
        duration: session.duration,
        completedAt: session.completedAt
      })),
      today: today.toISOString()
    };

    console.log(`Daily stats retrieved: ${stats.totalPomodoros} pomodoros, ${stats.totalMinutes} minutes`);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    // Return a valid empty response structure on error
    res.status(500).json({ 
      message: 'Failed to fetch daily stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      totalPomodoros: 0,
      totalMinutes: 0,
      sessions: [],
      today: new Date().toISOString()
    });
  }
};

// Reset daily stats
exports.resetDailyStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // We don't actually delete data, we just return empty stats for today
    const stats = {
      totalPomodoros: 0,
      totalMinutes: 0,
      sessions: [],
      today: new Date().toISOString()
    };
    
    console.log(`Daily stats reset for user: ${userId}`);
    res.json(stats);
  } catch (error) {
    console.error('Error resetting daily stats:', error);
    res.status(500).json({ 
      message: 'Failed to reset daily stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 
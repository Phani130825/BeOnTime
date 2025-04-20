const Habit = require('../models/Habit');
const Notification = require('../models/Notification');

// Helper function to format time ago
const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
};

// Helper function to get notification type
const getNotificationType = (type) => {
    switch (type) {
        case 'habit_start':
        case 'habit_end':
            return 'warning';
        case 'streak_achievement':
            return 'success';
        case 'habit_completion':
            return 'info';
        default:
            return 'info';
    }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get total habits
        const totalHabits = await Habit.countDocuments({ user: userId });

        // Get completed habits for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const completedHabits = await Habit.countDocuments({
            user: userId,
            'completionHistory.date': {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            },
            'completionHistory.completed': true
        });

        // Get longest streak
        const habits = await Habit.find({ user: userId });
        const longestStreak = Math.max(...habits.map(habit => habit.streak || 0));

        // Get completion rate
        const totalCompletions = habits.reduce((sum, habit) => {
            return sum + (habit.completionHistory?.filter(h => h.completed).length || 0);
        }, 0);
        const totalDays = habits.reduce((sum, habit) => {
            return sum + (habit.completionHistory?.length || 0);
        }, 0);
        const completionRate = totalDays > 0 ? Math.round((totalCompletions / totalDays) * 100) : 0;

        // Get weekly completion data
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyData = await Habit.aggregate([
            {
                $match: {
                    user: userId,
                    'completionHistory.date': { $gte: weekAgo },
                    'completionHistory.completed': true
                }
            },
            {
                $unwind: '$completionHistory'
            },
            {
                $match: {
                    'completionHistory.date': { $gte: weekAgo },
                    'completionHistory.completed': true
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$completionHistory.date' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // Get today's habits
        const todayHabits = await Habit.find({
            user: userId,
            startDate: { $lte: today },
            $or: [
                { endDate: { $gte: today } },
                { endDate: null }
            ]
        }).sort('startTime');

        // Get recent notifications
        const recentNotifications = await Notification.find({
            user: userId,
            read: false
        })
        .sort({ createdAt: -1 })
        .limit(5);

        res.json({
            stats: {
                totalHabits,
                completedHabits,
                longestStreak,
                completionRate,
                weeklyData,
                todayHabits: todayHabits.map(habit => ({
                    name: habit.title,
                    time: habit.startTime,
                    status: habit.completionHistory?.some(h => 
                        h.date.toDateString() === today.toDateString() && h.completed
                    ) ? 'Completed' : 'Pending'
                })),
                recentNotifications: recentNotifications.map(notification => ({
                    message: notification.message,
                    time: formatTimeAgo(notification.createdAt),
                    type: getNotificationType(notification.type)
                }))
            }
        });
    } catch (error) {
        console.error('Error getting user stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
}; 
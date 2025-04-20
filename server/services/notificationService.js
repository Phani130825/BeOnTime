const Notification = require('../models/Notification');
const Habit = require('../models/Habit');
const emailService = require('./emailService');

// Create habit reminder notification
const createHabitReminder = async (habit, type = 'start') => {
    try {
        if (!habit || !habit._id || !habit.user || !habit.title) {
            throw new Error('Invalid habit data provided to createHabitReminder');
        }

        console.log(`Creating ${type} reminder notification for habit:`, {
            habitId: habit._id,
            title: habit.title,
            userId: habit.user,
            notifications: habit.notifications
        });

        // Ensure notifications are enabled
        if (!habit.notifications?.enabled) {
            console.log('Notifications are not enabled for this habit');
            return null;
        }

        const notification = new Notification({
            user: habit.user,
            type: type === 'start' ? 'habit_start' : 'habit_end',
            title: type === 'start' ? 'Habit Start Time' : 'Habit End Time',
            message: type === 'start' 
                ? `Time to start your habit: ${habit.title}`
                : `Your habit ${habit.title} is ending soon`,
            data: {
                habitId: habit._id,
                habitTitle: habit.title,
                time: type === 'start' ? habit.startTime : habit.endTime
            }
        });

        console.log('Saving notification:', notification);
        await notification.save();
        console.log('Notification saved successfully:', notification);

        // Send email notification
        if (type === 'start') {
            await emailService.sendHabitReminderEmail(habit.user, habit);
        }

        return notification;
    } catch (error) {
        console.error('Error in createHabitReminder:', {
            error: error.message,
            stack: error.stack,
            habitData: habit ? {
                id: habit._id,
                title: habit.title,
                userId: habit.user,
                notifications: habit.notifications
            } : 'No habit data'
        });
        throw error;
    }
};

// Create streak achievement notification
const createStreakAchievement = async (habit, streak) => {
    try {
        const notification = new Notification({
            user: habit.user,
            type: 'streak_achievement',
            title: 'Streak Achievement!',
            message: `Congratulations! You've reached a ${streak}-day streak for ${habit.title}`,
            data: {
                habitId: habit._id,
                habitTitle: habit.title,
                streak: streak
            }
        });

        await notification.save();

        // Send email notification
        await emailService.sendStreakAchievementEmail(habit.user, habit, streak);

        return notification;
    } catch (error) {
        console.error('Error creating streak achievement notification:', error);
        throw error;
    }
};

// Create habit completion notification
const createHabitCompletion = async (habit) => {
    try {
        const notification = new Notification({
            user: habit.user,
            type: 'habit_completion',
            title: 'Habit Completed!',
            message: `Great job! You've completed ${habit.title} for today`,
            data: {
                habitId: habit._id,
                habitTitle: habit.title,
                completionDate: new Date()
            }
        });

        await notification.save();

        // Send email notification
        await emailService.sendHabitCompletionEmail(habit.user, habit);

        return notification;
    } catch (error) {
        console.error('Error creating habit completion notification:', error);
        throw error;
    }
};

// Create system notification
const createSystemNotification = async (userId, title, message, data = {}) => {
    try {
        const notification = new Notification({
            user: userId,
            type: 'system',
            title,
            message,
            data
        });

        await notification.save();

        // Send email notification
        await emailService.sendEmailNotification(
            userId,
            title,
            message,
            `<h2>${title}</h2><p>${message}</p>`
        );

        return notification;
    } catch (error) {
        console.error('Error creating system notification:', error);
        throw error;
    }
};

// Check and create notifications for habits
const checkHabitNotifications = async () => {
    try {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        // Find habits with notifications enabled
        const habits = await Habit.find({
            'notifications.enabled': true,
            completed: false
        }).populate('user');

        for (const habit of habits) {
            // Check start time notification
            if (habit.startTime === currentTime) {
                await createHabitReminder(habit, 'start');
            }

            // Check end time notification
            if (habit.endTime) {
                // Calculate reminder time (5 minutes before end time)
                const [endHour, endMinute] = habit.endTime.split(':').map(Number);
                const endDate = new Date();
                endDate.setHours(endHour, endMinute, 0, 0);
                
                const reminderTime = new Date(endDate.getTime() - 5 * 60000); // 5 minutes before
                const reminderHour = reminderTime.getHours();
                const reminderMinute = reminderTime.getMinutes();
                const reminderTimeStr = `${reminderHour.toString().padStart(2, '0')}:${reminderMinute.toString().padStart(2, '0')}`;

                if (reminderTimeStr === currentTime) {
                    await createHabitReminder(habit, 'end');
                }
            }
        }

        // Check for streak achievements
        const habitsWithStreaks = await Habit.find({
            streak: { $gt: 0 },
            completed: true
        }).populate('user');

        for (const habit of habitsWithStreaks) {
            if (habit.streak % 7 === 0) { // Notify for weekly streaks
                await createStreakAchievement(habit, habit.streak);
            }
        }
    } catch (error) {
        console.error('Error checking habit notifications:', error);
    }
};

module.exports = {
    createHabitReminder,
    createStreakAchievement,
    createHabitCompletion,
    createSystemNotification,
    checkHabitNotifications
}; 
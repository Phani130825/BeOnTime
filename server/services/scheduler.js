const notificationService = require('./notificationService');

// Run every minute
const CHECK_INTERVAL = 60 * 1000;

class Scheduler {
    constructor() {
        this.interval = null;
    }

    start() {
        if (this.interval) {
            return;
        }

        this.interval = setInterval(async () => {
            try {
                await notificationService.checkHabitNotifications();
            } catch (error) {
                console.error('Error in scheduler:', error);
            }
        }, CHECK_INTERVAL);

        console.log('Scheduler started');
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            console.log('Scheduler stopped');
        }
    }
}

module.exports = new Scheduler(); 
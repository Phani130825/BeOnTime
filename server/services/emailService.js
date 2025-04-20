const nodemailer = require('nodemailer');
const User = require('../models/User');

// Ensure environment variables are loaded
require('dotenv').config();

// Log configuration for debugging
console.log('Initializing email service with configuration:', {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM
});

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    debug: true,
    logger: true
});

// Verify the connection
transporter.verify(function(error, success) {
    if (error) {
        console.error('SMTP Connection Error:', error);
        console.error('SMTP Configuration:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            user: process.env.SMTP_USER,
            from: process.env.SMTP_FROM
        });
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

// Send email notification to a specific user
const sendEmailNotification = async (userId, subject, text, html) => {
    try {
        console.log('Attempting to send email notification to user:', userId);
        const user = await User.findById(userId);
        if (!user || !user.notificationPreferences.email) {
            console.log('Email notifications not enabled for user:', userId);
            return;
        }

        console.log('Sending email to:', user.email);
        const mailOptions = {
            from: `"BeOnTime" <${process.env.SMTP_FROM}>`,
            to: user.email,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email notification:', error);
        throw error;
    }
};

// Send habit reminder email
const sendHabitReminderEmail = async (userId, habit) => {
    console.log('Sending habit reminder email for habit:', habit.title);
    const subject = `Time to start your habit: ${habit.title}`;
    const text = `It's time to start your habit "${habit.title}". Don't forget to track your progress!`;
    const html = `
        <h2>Habit Reminder</h2>
        <p>It's time to start your habit <strong>${habit.title}</strong>.</p>
        <p>Don't forget to track your progress!</p>
        <p>Keep up the good work!</p>
    `;

    return sendEmailNotification(userId, subject, text, html);
};

// Send streak achievement email
const sendStreakAchievementEmail = async (userId, habit, streak) => {
    console.log('Sending streak achievement email for habit:', habit.title);
    const subject = `Congratulations! ${streak}-day streak achieved!`;
    const text = `You've reached a ${streak}-day streak for your habit "${habit.title}". Keep up the great work!`;
    const html = `
        <h2>Streak Achievement!</h2>
        <p>Congratulations! You've reached a <strong>${streak}-day streak</strong> for your habit <strong>${habit.title}</strong>.</p>
        <p>Keep up the great work!</p>
    `;

    return sendEmailNotification(userId, subject, text, html);
};

// Send habit completion email
const sendHabitCompletionEmail = async (userId, habit) => {
    console.log('Sending habit completion email for habit:', habit.title);
    const subject = `Habit Completed: ${habit.title}`;
    const text = `Great job! You've completed your habit "${habit.title}" for today.`;
    const html = `
        <h2>Habit Completed!</h2>
        <p>Great job! You've completed your habit <strong>${habit.title}</strong> for today.</p>
        <p>Keep up the momentum!</p>
    `;

    return sendEmailNotification(userId, subject, text, html);
};

module.exports = {
    sendEmailNotification,
    sendHabitReminderEmail,
    sendStreakAchievementEmail,
    sendHabitCompletionEmail
}; 
require('dotenv').config();
const nodemailer = require('nodemailer');

// Log configuration for debugging
console.log('Initializing test email with configuration:', {
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
        process.exit(1);
    } else {
        console.log('SMTP Server is ready to take our messages');
        sendTestEmail();
    }
});

function sendTestEmail() {
    const mailOptions = {
        from: process.env.SMTP_FROM,
        to: 'smarthabittracker@gmail.com',
        subject: 'Test Email from BeOnTime',
        text: 'This is a test email from BeOnTime application.',
        html: '<h1>Test Email</h1><p>This is a test email from BeOnTime application.</p>'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return;
        }
        console.log('Email sent successfully:', info.response);
    });
} 
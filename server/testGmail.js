require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmail() {
    console.log('Testing Gmail SMTP...');
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
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

    try {
        // Verify connection configuration
        await transporter.verify();
        console.log('Gmail SMTP server is ready');

        // Send test email
        const info = await transporter.sendMail({
            from: `"BeOnTime" <${process.env.SMTP_FROM}>`,
            to: process.env.SMTP_USER,
            subject: "Test Email via Gmail SMTP",
            text: "This is a test email sent via Gmail SMTP.",
            html: "<h1>Test Email</h1><p>This is a test email sent via Gmail SMTP.</p>"
        });

        console.log('Message sent:', info.messageId);
    } catch (error) {
        console.error('Error:', error);
    }
}

testGmail().catch(console.error); 
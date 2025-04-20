const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('SMTP Configuration:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_FROM:', process.env.SMTP_FROM);

// Create a transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send a test email
const sendTestEmail = async () => {
  try {
    const info = await transporter.sendMail({
      from: `"BeOnTime" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email from BeOnTime',
      text: 'This is a test email to verify the email service is working.',
      html: '<h2>Test Email</h2><p>This is a test email to verify the email service is working.</p>'
    });
    
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

sendTestEmail(); 
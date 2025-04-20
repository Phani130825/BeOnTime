const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
  try {
    console.log('Testing email service...');
    console.log('SMTP Configuration:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
      from: process.env.SMTP_FROM
    });

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

    // Replace with your email address
    const testEmail = 'your-email@example.com';
    
    // Send a test email directly
    const info = await transporter.sendMail({
      from: `"BeOnTime" <${process.env.SMTP_FROM}>`,
      to: testEmail,
      subject: 'Test Email from BeOnTime',
      text: 'This is a test email to verify the email service is working.',
      html: '<h2>Test Email</h2><p>This is a test email to verify the email service is working.</p>'
    });

    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending test email:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('Could not connect to the SMTP server. Please check your SMTP settings.');
    } else if (error.code === 'EAUTH') {
      console.error('Authentication failed. Please check your SMTP credentials.');
    } else {
      console.error('Unknown error:', error.message);
    }
  }
};

testEmail(); 
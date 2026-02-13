const nodemailer = require('nodemailer');
console.log("Email service file loaded");

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error.message);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

// Send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - REZIN',
      html: `
        <h2>Welcome to REZIN!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error.message);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Send forgot password email
const sendForgotPasswordEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - REZIN',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetUrl}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.response);
    return info;
  } catch (error) {
    console.error('Error sending forgot password email:', error.message);
    throw new Error(`Failed to send reset email: ${error.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendForgotPasswordEmail
};

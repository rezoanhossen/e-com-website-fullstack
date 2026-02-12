const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendForgotPasswordEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new User({ 
      name, 
      email, 
      password,
      emailVerificationToken,
      emailVerificationTokenExpiry
    });
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerificationToken);
      res.status(201).json({ 
        message: 'Registration successful. Please verify your email.',
        user: { id: user._id, name, email } 
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      
      // Still register the user but inform them about the email issue
      res.status(201).json({ 
        message: 'Registration successful, but we could not send verification email. Please contact support.',
        user: { id: user._id, name, email },
        emailError: emailError.message
      });
    }
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiry = null;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpiry = emailVerificationTokenExpiry;
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerificationToken);
      res.json({ message: 'Verification email sent. Please check your inbox.' });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      
      // Clear the verification token since email failed
      user.emailVerificationToken = null;
      user.emailVerificationTokenExpiry = null;
      await user.save();
      
      return res.status(500).json({ 
        message: `Failed to send verification email: ${emailError.message}. Please check email configuration.` 
      });
    }
  } catch (error) {
    console.error('Resend verification email error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        requiresEmailVerification: true,
        email: user.email
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user._id, name: user.name, email, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security reasons
      return res.status(200).json({ message: 'If an account exists with this email, a password reset link has been sent.' });
    }

    // Generate reset token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
    await user.save();

    // Send reset email
    try {
      await sendForgotPasswordEmail(email, resetPasswordToken);
      res.json({ message: 'If an account exists with this email, a password reset link has been sent. Please check your inbox.' });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError.message);
      
      // Clear the reset token since email failed
      user.resetPasswordToken = null;
      user.resetPasswordTokenExpiry = null;
      await user.save();
      
      return res.status(500).json({ 
        message: `Failed to send reset email: ${emailError.message}. Please check email configuration.` 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset tokens
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiry = null;
    
    // If email wasn't verified, mark it as verified after password reset
    // This allows users to reset forgotten passwords without being locked out
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationTokenExpiry = null;
    }
    
    await user.save();

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

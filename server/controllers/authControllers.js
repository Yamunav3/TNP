const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

exports.forgotPassword = async (req, res) => {
  try {
    // 1. Check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Generate random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 3. Hash token and set to database field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes

    await user.save();

    // 4. Send Email via Nodemailer
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click here: ${resetUrl}`
    });

    res.status(200).json({ message: "Email sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

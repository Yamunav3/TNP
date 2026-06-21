const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Google OAuth Callback
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'Google OAuth failed' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Prepare response data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      department: user.department,
      year: user.year,
      token,
    };

    // Redirect to frontend with token (you can also return JSON)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const redirectUrl = `${frontendUrl}/auth-success?token=${token}&user=${encodeURIComponent(
      JSON.stringify(userData)
    )}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=oauth_failed`);
  }
};

// GitHub OAuth Callback
exports.githubCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'GitHub OAuth failed' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Prepare response data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      github: user.github,
      department: user.department,
      year: user.year,
      token,
    };

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const redirectUrl = `${frontendUrl}/auth-success?token=${token}&user=${encodeURIComponent(
      JSON.stringify(userData)
    )}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=oauth_failed`);
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    // Extract token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      department: user.department,
      year: user.year,
      phone: user.phone,
      address: user.address,
      linkedin: user.linkedin,
      github: user.github,
      token,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Verify OAuth Token
exports.verifyOAuthToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        token,
      },
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', valid: false });
  }
};

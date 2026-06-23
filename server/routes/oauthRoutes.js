const express = require('express');
const passport = require('passport');
const oauthController = require('../controllers/oauthController');

const router = express.Router();

// Google OAuth Routes
// Initiate Google OAuth login
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5175'}/login/student?error=oauth_failed`,
  }),
  oauthController.googleCallback
);

// GitHub OAuth Routes
// Initiate GitHub OAuth login
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email', 'read:user'] })
);

// GitHub OAuth callback
router.get(
  '/github/callback',
  passport.authenticate('github', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5175'}/login/student?error=oauth_failed`,
  }),
  oauthController.githubCallback
);

// Get current authenticated user
router.get('/me', oauthController.getCurrentUser);

// Verify OAuth token
router.post('/verify-token', oauthController.verifyOAuthToken);

module.exports = router;

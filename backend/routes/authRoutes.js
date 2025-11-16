const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login`, session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/redirect?token=${token}`);
  }
);

// @desc    Get current user
// @route   GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

module.exports = router;

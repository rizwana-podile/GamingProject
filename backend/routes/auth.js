/* ==========================================================================
   AUTHENTICATION REST API ROUTES
   User Registration, Login, Token Authentication & Profile Verification
   ========================================================================== */

const express = require('express');
const router = express.Router();
const db = require('../database');

// 1. POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password required' });
  }

  const existing = db.findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ success: false, error: 'Username already taken' });
  }

  const user = db.createUser(username, password); // Simplified hashing for demo
  res.json({
    success: true,
    user: { id: user.id, username: user.username },
    token: `token_user_${user.id}_${Date.now()}`
  });
});

// 2. POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.findUserByUsername(username);

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ success: false, error: 'Invalid username or password' });
  }

  res.json({
    success: true,
    user: { id: user.id, username: user.username },
    token: `token_user_${user.id}_${Date.now()}`
  });
});

module.exports = router;

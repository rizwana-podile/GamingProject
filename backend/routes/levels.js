/* ==========================================================================
   COMMUNITY CUSTOM LEVELS REST API ROUTES
   Sharing, Saving & Discovering Player-Made Custom Snake Maps
   ========================================================================== */

const express = require('express');
const router = express.Router();
const db = require('../database');

// 1. GET /api/levels - List All Community Custom Levels
router.get('/', (req, res) => {
  const levels = db.getCustomLevels();
  res.json({
    success: true,
    levels: levels
  });
});

// 2. POST /api/levels/create - Submit Custom Map Layout
router.post('/create', (req, res) => {
  const { title, author, walls } = req.body;
  if (!title || !walls || !Array.isArray(walls)) {
    return res.status(400).json({ success: false, error: 'Title and walls matrix required' });
  }

  const level = db.addCustomLevel(title, author || 'Anonymous Creator', walls);
  res.json({
    success: true,
    message: 'Custom level published successfully',
    level: level
  });
});

module.exports = router;

/* ==========================================================================
   SCORES & LEADERBOARD REST API ROUTES
   High Score Submission, Global Rankings & Player Telemetry Data
   ========================================================================== */

const express = require('express');
const router = express.Router();
const db = require('../database');

// 1. GET /api/scores/leaderboard - Get Global Top Scores
router.get('/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const topScores = db.getTopScores(limit);
  res.json({
    success: true,
    leaderboard: topScores
  });
});

// 2. POST /api/scores/submit - Submit New High Score
router.post('/submit', (req, res) => {
  const { username, score, mode, level } = req.body;
  if (!score) {
    return res.status(400).json({ success: false, error: 'Score is required' });
  }

  const playerName = username || 'Anonymous_Snake';
  const savedScore = db.addScore(0, playerName, parseInt(score), mode || 'classic', parseInt(level) || 1);

  res.json({
    success: true,
    message: 'Score submitted successfully',
    record: savedScore
  });
});

module.exports = router;

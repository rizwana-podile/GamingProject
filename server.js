/**
 * Aetheria Engine - Full-Stack Express & WebSocket Server
 * REST API routes for leaderboards, user profiles, and custom levels + WebSocket server.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');

const JSONDatabase = require('./backend/database');
const MultiplayerServer = require('./backend/multiplayer');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const db = new JSONDatabase();
const multiplayer = new MultiplayerServer();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// REST API Endpoints
app.get('/api/leaderboards', (req, res) => {
  const game = req.query.game;
  const scores = db.getLeaderboard(game);
  res.json({ success: true, scores });
});

app.post('/api/leaderboards', (req, res) => {
  const { game, username, score } = req.body;
  if (!game || !username || score === undefined) {
    return res.status(400).json({ success: false, error: 'Missing parameters' });
  }
  db.addScore(game, username, score);
  res.json({ success: true, message: 'Score saved successfully' });
});

app.get('/api/levels', (req, res) => {
  const levels = db.getCustomLevels();
  res.json({ success: true, levels });
});

app.post('/api/levels', (req, res) => {
  const { name, author, levelData } = req.body;
  if (!name || !levelData) {
    return res.status(400).json({ success: false, error: 'Missing level parameters' });
  }
  const level = db.saveCustomLevel(name, author || 'Anonymous', levelData);
  res.json({ success: true, level });
});

// WebSocket upgrade handling
wss.on('connection', (ws) => {
  multiplayer.handleConnection(ws);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`⚡ Aetheria Arcade Server running on http://localhost:${PORT}`);
});

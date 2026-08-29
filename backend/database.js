/**
 * Aetheria Backend - In-Memory Database & Persistence Engine
 * Stores high scores, custom level JSON files, user statistics, and achievements.
 */

const fs = require('fs');
const path = require('path');

class JSONDatabase {
  constructor(dbFilePath = path.join(__dirname, 'data.json')) {
    this.filePath = dbFilePath;
    this.data = {
      leaderboards: [],
      users: {},
      customLevels: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.warn('[JSONDatabase] Could not read db file, initializing default data', e);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('[JSONDatabase] Save error:', e);
    }
  }

  addScore(game, username, score) {
    this.data.leaderboards.push({
      id: Date.now(),
      game,
      username,
      score,
      date: new Date().toISOString()
    });
    this.data.leaderboards.sort((a, b) => b.score - a.score);
    this.data.leaderboards = this.data.leaderboards.slice(0, 100); // Keep top 100
    this.save();
  }

  getLeaderboard(game) {
    if (!game) return this.data.leaderboards;
    return this.data.leaderboards.filter(item => item.game === game);
  }

  saveCustomLevel(name, author, levelData) {
    const level = {
      id: `level_${Date.now()}`,
      name,
      author,
      data: levelData,
      createdAt: new Date().toISOString()
    };
    this.data.customLevels.push(level);
    this.save();
    return level;
  }

  getCustomLevels() {
    return this.data.customLevels;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JSONDatabase;
}

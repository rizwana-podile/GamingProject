/* ==========================================================================
   PERSISTENCE & ACHIEVEMENTS ENGINE
   LocalStorage Management, High Scores & Unlockable Badges
   ========================================================================== */

class StorageEngine {
  constructor() {
    this.STORAGE_KEY = 'SNAKE_ARCADE_DELUXE_SAVE';
    this.data = this.loadData();
  }

  loadData() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    const defaultData = {
      highScore: 0,
      campaignLevelUnlocked: 1,
      levelStars: {},
      unlockedSkins: ['neon_cyan'],
      equippedSkin: 'neon_cyan',
      theme: 'neon',
      soundEnabled: true,
      soundVolume: 0.4,
      controlsType: 'arrows',
      customLevels: [],
      stats: {
        totalGamesPlayed: 0,
        totalFoodEaten: 0,
        totalDistance: 0,
        totalPowerupsPicked: 0,
        aiBattlesWon: 0
      },
      achievements: [
        { id: 'first_bite', title: 'First Bite', desc: 'Eat your first food', icon: '🍎', unlocked: false },
        { id: 'century', title: 'Century Club', desc: 'Reach 100 points in a single game', icon: '💯', unlocked: false },
        { id: 'speed_demon', title: 'Speed Demon', desc: 'Survive 30 seconds at maximum speed', icon: '⚡', unlocked: false },
        { id: 'powerup_junkie', title: 'Power Collector', desc: 'Collect 15 power-ups', icon: '⚡', unlocked: false },
        { id: 'bot_slayer', title: 'AI Dominator', desc: 'Defeat the AI snake in Bot Battle mode', icon: '🤖', unlocked: false },
        { id: 'campaign_hero', title: 'Grid Champion', desc: 'Complete 10 campaign levels', icon: '🏆', unlocked: false },
        { id: 'level_architect', title: 'Level Architect', desc: 'Create and save a custom level', icon: '✏️', unlocked: false }
      ]
    };

    if (!raw) return defaultData;
    try {
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed, stats: { ...defaultData.stats, ...(parsed.stats || {}) } };
    } catch (e) {
      console.error('Failed to parse local save data, falling back to default.', e);
      return defaultData;
    }
  }

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to write save data to LocalStorage.', e);
    }
  }

  updateHighScore(score) {
    if (score > this.data.highScore) {
      this.data.highScore = score;
      this.save();
      this.syncScoreWithBackend(score);
      return true; // New record!
    }
    return false;
  }

  async syncScoreWithBackend(score) {
    try {
      await fetch('/api/scores/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, mode: 'classic', level: 1 })
      });
    } catch (e) {
      // Server offline fallback to LocalStorage
    }
  }

  unlockAchievement(id) {
    const ach = this.data.achievements.find(a => a.id === id);
    if (ach && !ach.unlocked) {
      ach.unlocked = true;
      this.save();
      if (window.appUI) {
        window.appUI.showToast(ach.title, ach.desc, ach.icon);
      }
      return true;
    }
    return false;
  }

  saveCustomLevel(levelObj) {
    this.data.customLevels.push(levelObj);
    this.save();
    this.unlockAchievement('level_architect');
  }

  incrementStat(key, amount = 1) {
    if (this.data.stats[key] !== undefined) {
      this.data.stats[key] += amount;
      this.save();
      this.checkStatAchievements();
    }
  }

  checkStatAchievements() {
    if (this.data.stats.totalFoodEaten >= 1) this.unlockAchievement('first_bite');
    if (this.data.stats.totalPowerupsPicked >= 15) this.unlockAchievement('powerup_junkie');
    if (this.data.stats.aiBattlesWon >= 1) this.unlockAchievement('bot_slayer');
    if (this.data.campaignLevelUnlocked >= 10) this.unlockAchievement('campaign_hero');
  }
}

window.storageEngine = new StorageEngine();

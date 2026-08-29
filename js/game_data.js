/* ==========================================================================
   EXTENDED GAME DATA PACK & SECTOR CATALOGUE (LEVELS 21 to 100)
   Handcrafted Wall Coordinates, Theme Palettes, Retro Arcade Datasets & Leaderboards
   ========================================================================== */

class GameDataPack {
  constructor() {
    this.extraLevels = this.generate100Sectors();
    this.skinCatalog = this.initSkinCatalog();
    this.retroTrivia = this.initRetroTrivia();
    this.leaderboards = this.initLeaderboards();
  }

  initSkinCatalog() {
    return [
      { id: 'neon_cyan', name: 'Cyber Neon', head: '#00f3ff', body: '#0088cc', glow: 'rgba(0,243,255,0.6)' },
      { id: 'synth_pink', name: 'Synthwave Magenta', head: '#ff0055', body: '#990033', glow: 'rgba(255,0,85,0.6)' },
      { id: 'matrix_green', name: 'Matrix Hacker', head: '#00ff66', body: '#008833', glow: 'rgba(0,255,102,0.6)' },
      { id: 'solar_gold', name: 'Solar Flare Gold', head: '#ffb700', body: '#cc8800', glow: 'rgba(255,183,0,0.6)' },
      { id: 'plasma_purple', name: 'Plasma Violet', head: '#9d00ff', body: '#5500aa', glow: 'rgba(157,0,255,0.6)' },
      { id: 'ice_blue', name: 'Sub-Zero Ice', head: '#a5f3fc', body: '#0284c7', glow: 'rgba(165,243,252,0.6)' },
      { id: 'toxic_lime', name: 'Toxic Lime', head: '#84cc16', body: '#4d7c0f', glow: 'rgba(132,204,22,0.6)' },
      { id: 'crimson_vampire', name: 'Crimson Red', head: '#ef4444', body: '#991b1b', glow: 'rgba(239,68,68,0.6)' },
      { id: 'obsidian_dark', name: 'Obsidian Stealth', head: '#475569', body: '#1e293b', glow: 'rgba(71,85,105,0.6)' },
      { id: 'rainbow_prism', name: 'Chrono Prism', head: '#f43f5e', body: '#8b5cf6', glow: 'rgba(244,63,94,0.6)' }
    ];
  }

  generate100Sectors() {
    const sectors = [];
    const sectorTypes = ['Crossfire', 'Labyrinth', 'Chamber', 'Vortex', 'Citadel', 'Gate', 'Vault', 'Fortress'];
    
    for (let i = 21; i <= 100; i++) {
      const type = sectorTypes[i % sectorTypes.length];
      const walls = [];
      
      // Pattern algorithm for wall placement
      if (i % 3 === 0) {
        // Vertical pillars
        for (let r = 4; r <= 19; r += 3) {
          for (let c = 4; c <= 19; c += 5) {
            walls.push({ x: c, y: r });
          }
        }
      } else if (i % 3 === 1) {
        // Ring enclosure
        for (let x = 4; x <= 19; x++) {
          if (x !== 11 && x !== 12) {
            walls.push({ x: x, y: 4 });
            walls.push({ x: x, y: 19 });
          }
        }
      } else {
        // Corner traps
        for (let d = 0; d < 4; d++) {
          walls.push({ x: 3 + d, y: 3 + d });
          walls.push({ x: 20 - d, y: 3 + d });
          walls.push({ x: 3 + d, y: 20 - d });
          walls.push({ x: 20 - d, y: 20 - d });
        }
      }

      sectors.push({
        id: i,
        name: `Sector ${i}: ${type}`,
        targetScore: 300 + (i * 25),
        description: `Navigate Sector ${i} obstacles and score ${300 + (i * 25)} points.`,
        walls: walls,
        portals: [
          { inX: 2, inY: 2, outX: 21, outY: 21, color: '#00f3ff' }
        ]
      });
    }

    return sectors;
  }

  initRetroTrivia() {
    return [
      { q: "What year was the original Snake arcade game introduced?", a: "1976 (Blockade by Gremlin)" },
      { q: "Which iconic mobile phone popularized Snake worldwide in 1997?", a: "Nokia 6110" },
      { q: "What is the maximum score possible in classic Nokia Snake (9x15 grid)?", a: "2008 points" },
      { q: "What search algorithm is commonly used for optimal Snake AI pathfinding?", a: "A* (A-Star) Search Algorithm" }
    ];
  }

  initLeaderboards() {
    return [
      { rank: 1, name: "CYBER_KING", score: 14500, level: 85 },
      { rank: 2, name: "NEON_VIPER", score: 12200, level: 72 },
      { rank: 3, name: "GRID_RUNNER", score: 9800, level: 54 },
      { rank: 4, name: "A_STAR_BOT", score: 8400, level: 48 },
      { rank: 5, name: "RETRO_PIXEL", score: 6500, level: 35 }
    ];
  }
}

window.gameDataPack = new GameDataPack();

/**
 * Aetheria Engine - Multi-Game Arcade Hub Switcher
 * Dynamically loads and switches active game titles, updates HUD displays,
 * handles requestAnimationFrame game loop, and routes keyboard events.
 */

class ArcadeHub {
  constructor(canvas, synth, sfx) {
    this.canvas = canvas;
    this.synth = synth;
    this.sfx = sfx;

    this.activeGameKey = 'cybersnake';
    this.activeGame = null;
    this.isPaused = false;
    this.lastTime = 0;
    this.animFrameId = null;

    this.gamesRegistry = {
      cybersnake: { name: 'CyberSnake 3D/2D Deluxe', classGetter: () => typeof CyberSnakeGame !== 'undefined' ? CyberSnakeGame : null },
      dungeon:    { name: 'Aether Dungeon RPG', classGetter: () => typeof DungeonRPGGame !== 'undefined' ? DungeonRPGGame : null },
      shooter:    { name: 'Stellar Horizon Shooter', classGetter: () => typeof StellarHorizonGame !== 'undefined' ? StellarHorizonGame : null },
      racer:      { name: 'Synthwave CyberRacer', classGetter: () => typeof CyberRacerGame !== 'undefined' ? CyberRacerGame : null },
      hex:        { name: 'Hex Strategy & TD', classGetter: () => typeof HexTacticsGame !== 'undefined' ? HexTacticsGame : null },
      sandbox:    { name: 'Particle Physics Sandbox', classGetter: () => typeof ParticleSandboxGame !== 'undefined' ? ParticleSandboxGame : null }
    };
  }

  loadGame(gameKey) {
    const entry = this.gamesRegistry[gameKey];
    if (!entry) return;

    this.stopLoop();
    this.activeGameKey = gameKey;

    // Update HUD Active Game Title
    const hudGameName = document.getElementById('hud-game-name');
    if (hudGameName) hudGameName.textContent = entry.name;

    const GameClass = entry.classGetter();
    if (GameClass) {
      this.activeGame = new GameClass(this.canvas, this.synth, this.sfx);
      this.activeGame.init();
      this.startLoop();
    } else {
      console.warn(`[ArcadeHub] Game class for key '${gameKey}' not found.`);
    }
  }

  startLoop() {
    this.lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;

      if (!this.isPaused && this.activeGame) {
        this.activeGame.update(dt);
        this.activeGame.render();
      }

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  stopLoop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ArcadeHub;
}

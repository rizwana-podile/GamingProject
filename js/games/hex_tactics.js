/**
 * Aetheria Arcade - Hex Tactics & Tower Defense Engine
 * Axial grid coordinate math, tower spawner, laser projectiles, creep wave pathing,
 * game over life system, and score HUD.
 */

class HexGridMath {
  static axialToPixel(q, r, hexRadius) {
    const x = hexRadius * (Math.sqrt(3) * q + Math.sqrt(3) / 2 * r);
    const y = hexRadius * (3 / 2 * r);
    return { x, y };
  }
}

class HexTacticsGame {
  constructor(canvas, synth, sfx) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.synth = synth;
    this.sfx = sfx;

    this.hexRadius = 24;
    this.towers = [];
    this.creeps = [];
    this.projectiles = [];
    this.gold = 150;
    this.lives = 20;
    this.wave = 1;
    this.score = 0;
    this.isGameOver = false;

    this.grid = [];
    this.initGrid();
  }

  initGrid() {
    this.grid = [];
    for (let q = -4; q <= 4; q++) {
      for (let r = -4; r <= 4; r++) {
        if (Math.abs(q + r) <= 4) {
          this.grid.push({ q, r, tower: null });
        }
      }
    }
  }

  init() {
    this.gold = 150;
    this.lives = 20;
    this.wave = 1;
    this.score = 0;
    this.isGameOver = false;
    this.towers = [];
    this.creeps = [];
    this.projectiles = [];
    this.initGrid();
    this.spawnCreepWave();
    this.updateHUD();
  }

  spawnCreepWave() {
    for (let i = 0; i < 5 + this.wave * 2; i++) {
      this.creeps.push({
        x: 50,
        y: 40 - i * 45,
        hp: 40 + this.wave * 12,
        maxHp: 40 + this.wave * 12,
        speed: 50 + Math.random() * 20
      });
    }
  }

  handleKeyDown(key) {
    if (this.isGameOver && (key === 'Enter' || key === ' ')) {
      this.init();
    }
  }

  placeTower(q, r, type = 'plasma') {
    if (this.isGameOver || this.gold < 50) return false;
    const tile = this.grid.find(t => t.q === q && t.r === r);
    if (tile && !tile.tower) {
      tile.tower = { type, range: 160, damage: 15, cooldown: 0 };
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;
      const pos = HexGridMath.axialToPixel(q, r, this.hexRadius);

      this.towers.push({
        tile, q, r, type,
        x: centerX + pos.x,
        y: centerY + pos.y,
        cooldown: 0
      });

      this.gold -= 50;
      if (this.sfx) this.sfx.coin();
      return true;
    }
    return false;
  }

  update(dt) {
    if (this.isGameOver) return;

    // Towers attack creeps
    for (const t of this.towers) {
      if (t.cooldown > 0) t.cooldown -= dt;
      if (t.cooldown <= 0) {
        // Find closest creep in range
        let closestCreep = null;
        let minDist = 160;

        for (const c of this.creeps) {
          const dist = Math.hypot(c.x - t.x, c.y - t.y);
          if (dist < minDist) {
            minDist = dist;
            closestCreep = c;
          }
        }

        if (closestCreep) {
          this.projectiles.push({
            x: t.x,
            y: t.y,
            target: closestCreep,
            speed: 400,
            damage: 20
          });
          if (this.sfx) this.sfx.laser();
          t.cooldown = 0.4;
        }
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p.target || p.target.hp <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy) || 1;

      p.x += (dx / dist) * p.speed * dt;
      p.y += (dy / dist) * p.speed * dt;

      if (dist < 10) {
        p.target.hp -= p.damage;
        if (this.sfx) this.sfx.hit();
        this.projectiles.splice(i, 1);

        if (p.target.hp <= 0) {
          const idx = this.creeps.indexOf(p.target);
          if (idx !== -1) this.creeps.splice(idx, 1);
          this.gold += 15;
          this.score += 100;
          this.updateHUD();
        }
      }
    }

    // Creep movement down screen
    for (let i = this.creeps.length - 1; i >= 0; i--) {
      const c = this.creeps[i];
      c.y += c.speed * dt;

      if (c.y > this.canvas.height - 20) {
        this.lives--;
        this.creeps.splice(i, 1);
        if (this.lives <= 0) {
          this.triggerGameOver();
          return;
        }
      }
    }

    if (this.creeps.length === 0) {
      this.wave++;
      this.gold += 50;
      this.score += 300;
      this.updateHUD();
      this.spawnCreepWave();
    }
  }

  updateHUD() {
    const hudScore = document.getElementById('hud-score');
    if (hudScore) hudScore.textContent = this.score;
  }

  triggerGameOver() {
    this.isGameOver = true;
    if (this.sfx) this.sfx.gameOver();
  }

  render() {
    this.ctx.fillStyle = '#0a0d14';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Draw Hex Grid
    for (const tile of this.grid) {
      const pos = HexGridMath.axialToPixel(tile.q, tile.r, this.hexRadius);
      this.drawHex(centerX + pos.x, centerY + pos.y, this.hexRadius, tile.tower ? '#00ffcc' : 'rgba(0, 240, 255, 0.25)');
    }

    // Draw Creeps
    for (const c of this.creeps) {
      this.ctx.fillStyle = '#ff00aa';
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw Projectiles
    this.ctx.fillStyle = '#00ffff';
    for (const p of this.projectiles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Stats HUD
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Orbitron';
    this.ctx.fillText(`GOLD: $${this.gold}  |  LIVES: ${this.lives}  |  WAVE: ${this.wave}`, 20, 30);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '12px Outfit';
    this.ctx.fillText('Click grid tiles to place Plasma Defense Towers ($50)', 20, 50);

    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#ff00aa';
      this.ctx.font = '28px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('DEFENSE BREACHED', this.canvas.width / 2, this.canvas.height / 2 - 20);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px Outfit';
      this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.fillText('Press SPACE or ENTER to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
      this.ctx.textAlign = 'left';
    }
  }

  drawHex(x, y, radius, color) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const hx = x + radius * Math.cos(angle);
      const hy = y + radius * Math.sin(angle);
      if (i === 0) this.ctx.moveTo(hx, hy);
      else this.ctx.lineTo(hx, hy);
    }
    this.ctx.closePath();
    this.ctx.stroke();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HexTacticsGame;
}

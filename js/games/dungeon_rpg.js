/**
 * Aetheria Arcade - Aether Dungeon Action RPG Engine
 * Top-down action RPG featuring procedural dungeon floors, realtime player movement,
 * melee & magic attack skills, enemy spawner, loot inventory, and health stats.
 */

class DungeonRPGGame {
  constructor(canvas, synth, sfx) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.synth = synth;
    this.sfx = sfx;

    this.player = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      speed: 180,
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      xp: 0,
      score: 0,
      attackCooldown: 0
    };

    this.enemies = [];
    this.projectiles = [];
    this.floor = 1;
    this.isGameOver = false;

    this.keys = {};
  }

  init() {
    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height / 2;
    this.player.hp = 100;
    this.player.score = 0;
    this.enemies = [];
    this.projectiles = [];
    this.isGameOver = false;

    this.spawnEnemies(5);
    this.updateHUD();
  }

  spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
      this.enemies.push({
        x: Math.random() * (this.canvas.width - 100) + 50,
        y: Math.random() * (this.canvas.height - 100) + 50,
        hp: 30,
        maxHp: 30,
        speed: 70 + Math.random() * 30,
        color: '#ff3333'
      });
    }
  }

  handleKeyDown(key) {
    this.keys[key] = true;
    if (this.isGameOver && (key === 'Enter' || key === ' ')) {
      this.init();
    }
  }

  handleKeyUp(key) {
    this.keys[key] = false;
  }

  update(dt) {
    if (this.isGameOver) return;

    // Player input movement
    let moveX = 0;
    let moveY = 0;
    if (this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) moveX += 1;

    const len = Math.hypot(moveX, moveY) || 1;
    if (moveX !== 0 || moveY !== 0) {
      this.player.x += (moveX / len) * this.player.speed * dt;
      this.player.y += (moveY / len) * this.player.speed * dt;
    }

    // Keep player in bounds
    this.player.x = Math.max(16, Math.min(this.canvas.width - 16, this.player.x));
    this.player.y = Math.max(16, Math.min(this.canvas.height - 16, this.player.y));

    // Attack action (Space)
    if (this.keys[' '] && this.player.attackCooldown <= 0) {
      this.castFireball();
      this.player.attackCooldown = 0.25;
    }
    if (this.player.attackCooldown > 0) {
      this.player.attackCooldown -= dt;
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Projectile collision with enemies
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (Math.hypot(p.x - e.x, p.y - e.y) < 22) {
          e.hp -= p.damage;
          if (this.sfx) this.sfx.hit();
          this.projectiles.splice(i, 1);
          if (e.hp <= 0) {
            this.enemies.splice(j, 1);
            this.player.score += 150;
            this.updateHUD();
          }
          break;
        }
      }

      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Enemy AI movement & player collision
    for (const e of this.enemies) {
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;

      e.x += (dx / dist) * e.speed * dt;
      e.y += (dy / dist) * e.speed * dt;

      if (dist < 20) {
        this.player.hp -= 20 * dt;
        if (this.player.hp <= 0) {
          this.isGameOver = true;
          if (this.sfx) this.sfx.gameOver();
        }
      }
    }

    if (this.enemies.length === 0) {
      this.floor++;
      this.player.score += 500;
      this.updateHUD();
      this.spawnEnemies(5 + this.floor * 2);
    }
  }

  updateHUD() {
    const hudScore = document.getElementById('hud-score');
    if (hudScore) hudScore.textContent = this.player.score;
  }

  castFireball() {
    if (this.sfx) this.sfx.laser();
    this.projectiles.push({
      x: this.player.x,
      y: this.player.y,
      vx: 450,
      vy: 0,
      damage: 15,
      life: 1.5,
      color: '#ff9900'
    });
  }

  render() {
    this.ctx.fillStyle = '#0f0e17';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Floor title
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.font = '18px Orbitron';
    this.ctx.fillText(`AETHER DUNGEON - FLOOR ${this.floor}`, 20, 35);

    // Player rendering
    this.ctx.fillStyle = '#00ffcc';
    this.ctx.shadowColor = '#00ffcc';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, 14, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Enemies rendering
    for (const e of this.enemies) {
      this.ctx.fillStyle = e.color;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Projectiles rendering
    for (const p of this.projectiles) {
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // HUD HP Bar
    this.ctx.fillStyle = 'rgba(255,0,0,0.3)';
    this.ctx.fillRect(20, 50, 150, 12);
    this.ctx.fillStyle = '#ff3366';
    this.ctx.fillRect(20, 50, Math.max(0, (this.player.hp / this.player.maxHp) * 150), 12);

    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#ff00aa';
      this.ctx.font = '28px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('YOU DIED', this.canvas.width / 2, this.canvas.height / 2 - 20);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px Outfit';
      this.ctx.fillText(`DUNGEON SCORE: ${this.player.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.fillText('Press SPACE or ENTER to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
      this.ctx.textAlign = 'left';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DungeonRPGGame;
}

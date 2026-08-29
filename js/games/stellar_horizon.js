/**
 * Aetheria Arcade - Stellar Horizon Space Shooter Engine
 * High speed 60 FPS bullet-hell retro shooter featuring enemy formation waves,
 * particle laser cannons, enemy collision damage, game over overlay, and score HUD.
 */

class StellarHorizonGame {
  constructor(canvas, synth, sfx) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.synth = synth;
    this.sfx = sfx;

    this.ship = {
      x: canvas.width / 2,
      y: canvas.height - 60,
      width: 32,
      height: 32,
      speed: 350,
      hp: 100,
      maxHp: 100
    };

    this.bullets = [];
    this.enemies = [];
    this.stars = [];
    this.score = 0;
    this.isGameOver = false;
    this.fireCooldown = 0;

    this.keys = {};
    this.initStars();
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < 80; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: 1 + Math.random() * 3,
        size: 1 + Math.random() * 2
      });
    }
  }

  init() {
    this.ship.x = this.canvas.width / 2;
    this.ship.y = this.canvas.height - 60;
    this.ship.hp = 100;
    this.bullets = [];
    this.enemies = [];
    this.score = 0;
    this.isGameOver = false;
    this.fireCooldown = 0;

    this.spawnEnemyWave();
    this.updateHUD();
  }

  spawnEnemyWave() {
    for (let i = 0; i < 7; i++) {
      this.enemies.push({
        x: 50 + i * 85,
        y: -40 - Math.random() * 120,
        vx: (Math.random() - 0.5) * 60,
        vy: 70 + Math.random() * 50,
        hp: 20,
        color: '#ff00aa'
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
    // Starfield scrolling
    for (const star of this.stars) {
      star.y += star.speed;
      if (star.y > this.canvas.height) {
        star.y = 0;
        star.x = Math.random() * this.canvas.width;
      }
    }

    if (this.isGameOver) return;

    // Ship input movement
    if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) this.ship.x -= this.ship.speed * dt;
    if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) this.ship.x += this.ship.speed * dt;
    if (this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) this.ship.y -= this.ship.speed * dt;
    if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) this.ship.y += this.ship.speed * dt;

    this.ship.x = Math.max(20, Math.min(this.canvas.width - 20, this.ship.x));
    this.ship.y = Math.max(20, Math.min(this.canvas.height - 20, this.ship.y));

    // Shooting with cooldown
    if (this.fireCooldown > 0) this.fireCooldown -= dt;
    if (this.keys[' '] && this.fireCooldown <= 0) {
      this.fireBullet();
      this.fireCooldown = 0.15;
    }

    // Update player bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.y -= 550 * dt;

      // Enemy hit check
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (Math.hypot(b.x - e.x, b.y - e.y) < 22) {
          e.hp -= 10;
          if (this.sfx) this.sfx.hit();
          this.bullets.splice(i, 1);
          if (e.hp <= 0) {
            this.enemies.splice(j, 1);
            this.score += 200;
            this.updateHUD();
          }
          break;
        }
      }

      if (b.y < -10) {
        this.bullets.splice(i, 1);
      }
    }

    // Update enemies & check collision with player ship
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.y += e.vy * dt;
      e.x += e.vx * dt;

      if (e.x < 20 || e.x > this.canvas.width - 20) e.vx *= -1;

      // Ship collision
      if (Math.hypot(this.ship.x - e.x, this.ship.y - e.y) < 26) {
        this.ship.hp -= 35;
        if (this.sfx) this.sfx.hit();
        this.enemies.splice(i, 1);
        if (this.ship.hp <= 0) {
          this.triggerGameOver();
        }
        continue;
      }

      if (e.y > this.canvas.height + 50) {
        e.y = -40;
        e.x = Math.random() * this.canvas.width;
      }
    }

    if (this.enemies.length === 0) {
      this.score += 500;
      this.updateHUD();
      this.spawnEnemyWave();
    }
  }

  fireBullet() {
    if (this.sfx) this.sfx.laser();
    this.bullets.push({ x: this.ship.x - 8, y: this.ship.y - 15 });
    this.bullets.push({ x: this.ship.x + 8, y: this.ship.y - 15 });
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
    this.ctx.fillStyle = '#050608';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Render starfield
    this.ctx.fillStyle = '#ffffff';
    for (const star of this.stars) {
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    }

    // Ship rendering
    this.ctx.fillStyle = '#00ffff';
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 12;
    this.ctx.beginPath();
    this.ctx.moveTo(this.ship.x, this.ship.y - 18);
    this.ctx.lineTo(this.ship.x - 14, this.ship.y + 14);
    this.ctx.lineTo(this.ship.x + 14, this.ship.y + 14);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // Player bullets
    this.ctx.fillStyle = '#00ffcc';
    for (const b of this.bullets) {
      this.ctx.fillRect(b.x - 2, b.y, 4, 12);
    }

    // Enemies
    for (const e of this.enemies) {
      this.ctx.fillStyle = e.color;
      this.ctx.beginPath();
      this.ctx.arc(e.x, e.y, 16, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Ship HP Bar
    this.ctx.fillStyle = 'rgba(255,0,0,0.3)';
    this.ctx.fillRect(20, 20, 150, 10);
    this.ctx.fillStyle = '#00ffcc';
    this.ctx.fillRect(20, 20, Math.max(0, (this.ship.hp / this.ship.maxHp) * 150), 10);

    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#ff00aa';
      this.ctx.font = '28px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('SHIP DESTROYED', this.canvas.width / 2, this.canvas.height / 2 - 20);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px Outfit';
      this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.fillText('Press SPACE or ENTER to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
      this.ctx.textAlign = 'left';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StellarHorizonGame;
}

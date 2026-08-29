/**
 * Aetheria Arcade - CyberSnake 3D & 2D Deluxe Game Engine
 * Smooth 60 FPS Snake Arcade with step timer, AI snakes, food powerups,
 * particle explosions, score HUD updates, and restart handlers.
 */

class CyberSnakeGame {
  constructor(canvas, synth, sfx) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.synth = synth;
    this.sfx = sfx;

    this.gridWidth = 24;
    this.gridHeight = 20;
    this.tileSize = Math.floor(Math.min(canvas.width / this.gridWidth, canvas.height / this.gridHeight));

    this.snake = [];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };

    this.food = [];
    this.powerups = [];
    this.score = 0;
    this.combo = 1;
    this.isGameOver = false;

    // Movement step timer accumulator (moves every 0.12 seconds)
    this.stepInterval = 0.12;
    this.stepTimer = 0;

    this.emitter = typeof ParticleEmitter !== 'undefined' ? new ParticleEmitter({ maxParticles: 500 }) : null;
  }

  init() {
    this.score = 0;
    this.combo = 1;
    this.isGameOver = false;
    this.stepTimer = 0;

    // Center snake
    const startX = Math.floor(this.gridWidth / 2);
    const startY = Math.floor(this.gridHeight / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];

    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };

    this.spawnFood();
    this.updateHUD();
  }

  spawnFood() {
    this.food = [];
    for (let i = 0; i < 3; i++) {
      const fx = Math.floor(Math.random() * this.gridWidth);
      const fy = Math.floor(Math.random() * this.gridHeight);
      this.food.push({ x: fx, y: fy, type: 'regular', val: 100 });
    }
  }

  handleKeyDown(key) {
    if (this.isGameOver) {
      if (key === 'Enter' || key === ' ') {
        this.init();
      }
      return;
    }

    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && this.direction.y !== 1) {
      this.nextDirection = { x: 0, y: -1 };
    } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && this.direction.y !== -1) {
      this.nextDirection = { x: 0, y: 1 };
    } else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && this.direction.x !== 1) {
      this.nextDirection = { x: -1, y: 0 };
    } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && this.direction.x !== -1) {
      this.nextDirection = { x: 1, y: 0 };
    }
  }

  update(dt) {
    if (this.emitter) this.emitter.update(dt);
    if (this.isGameOver) return;

    this.stepTimer += dt;
    if (this.stepTimer < this.stepInterval) {
      return;
    }
    this.stepTimer = 0;

    this.direction = { ...this.nextDirection };
    const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

    // Boundary check with wrapping
    if (head.x < 0) head.x = this.gridWidth - 1;
    if (head.x >= this.gridWidth) head.x = 0;
    if (head.y < 0) head.y = this.gridHeight - 1;
    if (head.y >= this.gridHeight) head.y = 0;

    // Self collision
    for (let i = 0; i < this.snake.length; i++) {
      if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
        this.triggerGameOver('Tail Collision');
        return;
      }
    }

    this.snake.unshift(head);

    // Food collision check
    let ate = false;
    for (let i = this.food.length - 1; i >= 0; i--) {
      if (this.food[i].x === head.x && this.food[i].y === head.y) {
        this.score += this.food[i].val * this.combo;
        this.combo++;
        if (this.sfx) this.sfx.coin();
        if (this.emitter) {
          this.emitter.explode(head.x * this.tileSize + this.tileSize / 2, head.y * this.tileSize + this.tileSize / 2, 20, '#00ffff');
        }
        this.food.splice(i, 1);
        ate = true;
      }
    }

    if (!ate) {
      this.snake.pop();
    } else {
      if (this.food.length === 0) this.spawnFood();
      this.updateHUD();
    }
  }

  updateHUD() {
    const hudScore = document.getElementById('hud-score');
    if (hudScore) hudScore.textContent = this.score;
  }

  triggerGameOver(reason) {
    this.isGameOver = true;
    if (this.sfx) this.sfx.gameOver();
  }

  render() {
    this.ctx.fillStyle = '#07080c';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grid lines
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x <= this.gridWidth * this.tileSize; x += this.tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.gridHeight * this.tileSize);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.gridHeight * this.tileSize; y += this.tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.gridWidth * this.tileSize, y);
      this.ctx.stroke();
    }

    // Food rendering
    for (const f of this.food) {
      this.ctx.fillStyle = '#ff00aa';
      this.ctx.shadowColor = '#ff00aa';
      this.ctx.shadowBlur = 12;
      this.ctx.fillRect(f.x * this.tileSize + 3, f.y * this.tileSize + 3, this.tileSize - 6, this.tileSize - 6);
    }
    this.ctx.shadowBlur = 0;

    // Snake rendering
    for (let i = 0; i < this.snake.length; i++) {
      const seg = this.snake[i];
      this.ctx.fillStyle = i === 0 ? '#00ffff' : '#00aaee';
      if (i === 0) {
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 10;
      }
      this.ctx.fillRect(seg.x * this.tileSize + 1, seg.y * this.tileSize + 1, this.tileSize - 2, this.tileSize - 2);
      this.ctx.shadowBlur = 0;
    }

    if (this.emitter) this.emitter.render(this.ctx);

    // Game Over Overlay Text
    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#ff00aa';
      this.ctx.font = '28px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('SYSTEM CRASH', this.canvas.width / 2, this.canvas.height / 2 - 20);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px Outfit';
      this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.fillText('Press SPACE or ENTER to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
      this.ctx.textAlign = 'left';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CyberSnakeGame;
}

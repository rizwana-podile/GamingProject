/**
 * Aetheria Arcade - Synthwave CyberRacer 3D Engine
 * Pseudo-3D raycasted retro racing engine with perspective projection, traffic obstacle cars,
 * speed physics, game over collision checks, and score HUD updates.
 */

class CyberRacerGame {
  constructor(canvas, synth, sfx) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.synth = synth;
    this.sfx = sfx;

    this.playerX = 0; // -1.5 (left) to 1.5 (right)
    this.speed = 0;
    this.maxSpeed = 300;
    this.accel = 140;
    this.breaking = 200;
    this.decel = 50;

    this.distance = 0;
    this.score = 0;
    this.isGameOver = false;

    this.traffic = [];
    this.keys = {};
  }

  init() {
    this.playerX = 0;
    this.speed = 0;
    this.distance = 0;
    this.score = 0;
    this.isGameOver = false;
    this.traffic = [];

    this.spawnTraffic();
    this.updateHUD();
  }

  spawnTraffic() {
    for (let i = 0; i < 5; i++) {
      this.traffic.push({
        lane: (Math.random() - 0.5) * 2.4, // -1.2 to 1.2
        z: 300 + i * 250, // Distance ahead
        speed: 60 + Math.random() * 40,
        color: '#ffcc00'
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

    // Acceleration & Braking
    if (this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) {
      this.speed = Math.min(this.maxSpeed, this.speed + this.accel * dt);
    } else if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) {
      this.speed = Math.max(0, this.speed - this.breaking * dt);
    } else {
      this.speed = Math.max(0, this.speed - this.decel * dt);
    }

    // Steering
    if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) {
      this.playerX -= 1.8 * dt;
    }
    if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) {
      this.playerX += 1.8 * dt;
    }

    this.playerX = Math.max(-1.5, Math.min(1.5, this.playerX));
    this.distance += this.speed * dt;

    this.score = Math.floor(this.distance);
    this.updateHUD();

    // Update traffic obstacle positions
    for (const car of this.traffic) {
      car.z -= (this.speed - car.speed) * dt;

      // Collision check with player
      if (car.z < 40 && car.z > -20 && Math.abs(this.playerX - car.lane) < 0.5) {
        this.triggerGameOver();
        return;
      }

      if (car.z < -50) {
        car.z = 1000 + Math.random() * 300;
        car.lane = (Math.random() - 0.5) * 2.4;
      }
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
    const width = this.canvas.width;
    const height = this.canvas.height;
    const horizonY = height / 2;

    // Synthwave Sunset Sky
    const gradient = this.ctx.createLinearGradient(0, 0, 0, horizonY);
    gradient.addColorStop(0, '#0d0221');
    gradient.addColorStop(0.6, '#261447');
    gradient.addColorStop(1, '#ff3864');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, width, horizonY);

    // Sun disc
    this.ctx.fillStyle = '#ffcc00';
    this.ctx.beginPath();
    this.ctx.arc(width / 2, horizonY - 10, 45, 0, Math.PI * 2);
    this.ctx.fill();

    // Wireframe Road Ground
    this.ctx.fillStyle = '#090a0f';
    this.ctx.fillRect(0, horizonY, width, height / 2);

    // Dynamic Road Lines (Perspective Grid)
    this.ctx.strokeStyle = '#ff00aa';
    this.ctx.lineWidth = 2;
    for (let i = -5; i <= 5; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(width / 2, horizonY);
      this.ctx.lineTo(width / 2 + i * 140, height);
      this.ctx.stroke();
    }

    // Dynamic Horizontal Road Grid Lines (Offset by distance)
    const gridOffset = (this.distance % 50) / 50;
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    for (let j = 0; j < 10; j++) {
      const p = (j + gridOffset) / 10;
      const y = horizonY + p * p * (height / 2);
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Render Traffic Obstacle Cars
    for (const car of this.traffic) {
      if (car.z > 0 && car.z < 1200) {
        const scale = 1 / (car.z / 300 + 0.1);
        const screenX = width / 2 + car.lane * 120 * scale;
        const screenY = horizonY + (1 - 1 / scale) * (height / 2);
        const w = 40 * scale;
        const h = 20 * scale;

        this.ctx.fillStyle = car.color;
        this.ctx.fillRect(screenX - w / 2, screenY, w, h);
      }
    }

    // Player Cyber Car
    const carX = width / 2 + this.playerX * 120;
    const carY = height - 60;

    this.ctx.fillStyle = '#00ffff';
    this.ctx.shadowColor = '#00ffff';
    this.ctx.shadowBlur = 15;
    this.ctx.fillRect(carX - 25, carY, 50, 25);
    this.ctx.shadowBlur = 0;

    if (this.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#ff00aa';
      this.ctx.font = '28px Orbitron';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('CAR CRASHED', this.canvas.width / 2, this.canvas.height / 2 - 20);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '16px Outfit';
      this.ctx.fillText(`DISTANCE RACED: ${this.score}m`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.fillText('Press SPACE or ENTER to Restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
      this.ctx.textAlign = 'left';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CyberRacerGame;
}

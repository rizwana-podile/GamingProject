/* ==========================================================================
   CANVAS PARTICLE PHYSICS & VISUAL EFFECTS ENGINE
   Explosions, Glowing Trails, Power-up Rings & Ambient Dust Particles
   ========================================================================== */

class Particle {
  constructor(x, y, color, size, vx, vy, life, shape = 'circle') {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.maxSize = size;
    this.vx = vx;
    this.vy = vy;
    this.life = life; // Remaining lifetime in frames
    this.maxLife = life;
    this.shape = shape; // 'circle', 'spark', 'ring', 'square'
    this.alpha = 1;
    this.decay = 1 / life;
    this.gravity = 0.05;
    this.drag = 0.98;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.vy += this.gravity * 0.2;
    this.life--;
    this.alpha = Math.max(0, this.life / this.maxLife);
    if (this.shape === 'ring') {
      this.size += 1.5;
    } else {
      this.size = Math.max(0.5, this.maxSize * (this.life / this.maxLife));
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    if (this.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === 'square') {
      ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    } else if (this.shape === 'ring') {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.shape === 'spark') {
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
      ctx.stroke();
    }

    ctx.restore();
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.ambientParticles = [];
  }

  // Create explosion burst when eating food or picking up power-up
  burst(x, y, color, count = 16, shape = 'circle') {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() * 0.4 - 0.2);
      const speed = Math.random() * 4 + 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const size = Math.random() * 4 + 2;
      const life = Math.floor(Math.random() * 20 + 20);
      this.particles.push(new Particle(x, y, color, size, vx, vy, life, shape));
    }
    // Add expanding ring shockwave
    this.particles.push(new Particle(x, y, color, 4, 0, 0, 18, 'ring'));
  }

  // Create trail particles behind snake head
  createTrail(x, y, color) {
    const size = Math.random() * 3 + 2;
    const vx = (Math.random() - 0.5) * 0.8;
    const vy = (Math.random() - 0.5) * 0.8;
    const life = 14;
    this.particles.push(new Particle(x, y, color, size, vx, vy, life, 'circle'));
  }

  // Create crash debris explosion
  createCrashExplosion(x, y) {
    const colors = ['#ff0055', '#ff9900', '#00f3ff', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 1;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 5 + 2;
      const life = Math.floor(Math.random() * 30 + 25);
      const shape = Math.random() > 0.5 ? 'spark' : 'square';
      this.particles.push(new Particle(x, y, color, size, vx, vy, life, shape));
    }
  }

  // Floating background ambient particles
  initAmbient(width, height, count = 30) {
    this.ambientParticles = [];
    for (let i = 0; i < count; i++) {
      this.ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.2
      });
    }
  }

  updateAndDraw(ctx, width, height) {
    // 1. Draw & Update Ambient Particles
    ctx.save();
    this.ambientParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.fillStyle = `rgba(0, 243, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 2. Draw & Update Active Effect Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update();
      p.draw(ctx);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  clear() {
    this.particles = [];
  }
}

window.particleSystem = new ParticleSystem();

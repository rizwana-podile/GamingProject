/**
 * Aetheria Engine - High-Performance Particle Engine Module
 * Multi-type particle emitter, force fields, gravity wells, bloom color ramps,
 * trail rendering, and pooling architecture.
 */

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = 2;
    this.endSize = 0;
    this.life = 0;
    this.maxLife = 1.0;
    this.color = '#00f0ff';
    this.endColor = '#ff00aa';
    this.alpha = 1.0;
    this.shape = 'circle'; // 'circle', 'square', 'spark', 'ring'
    this.spin = 0;
    this.rotation = 0;
  }
}

class ParticleEmitter {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.rate = options.rate || 10; // particles per frame
    this.maxParticles = options.maxParticles || 1000;

    this.pool = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push(new Particle());
    }

    this.gravityX = options.gravityX || 0;
    this.gravityY = options.gravityY || 0;
    this.drag = options.drag || 0.98;

    this.forceFields = [];
  }

  spawnParticle(config = {}) {
    const p = this.pool.find(pt => !pt.active);
    if (!p) return null;

    p.active = true;
    p.x = config.x !== undefined ? config.x : this.x;
    p.y = config.y !== undefined ? config.y : this.y;

    const angle = config.angle !== undefined ? config.angle : Math.random() * Math.PI * 2;
    const speed = config.speed !== undefined ? config.speed : (1 + Math.random() * 3);

    p.vx = Math.cos(angle) * speed + (config.vx || 0);
    p.vy = Math.sin(angle) * speed + (config.vy || 0);
    p.size = config.size || (3 + Math.random() * 4);
    p.endSize = config.endSize !== undefined ? config.endSize : 0;
    p.maxLife = config.maxLife || (0.5 + Math.random() * 0.8);
    p.life = p.maxLife;
    p.color = config.color || '#00ffff';
    p.shape = config.shape || 'circle';
    p.spin = (Math.random() - 0.5) * 0.1;
    p.rotation = Math.random() * Math.PI * 2;

    return p;
  }

  explode(x, y, count = 30, color = '#ff3366', speedMultiplier = 1.0) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.2;
      const speed = (2 + Math.random() * 5) * speedMultiplier;
      this.spawnParticle({
        x: x,
        y: y,
        angle: angle,
        speed: speed,
        size: 3 + Math.random() * 5,
        color: color,
        maxLife: 0.4 + Math.random() * 0.6
      });
    }
  }

  addForceField(x, y, radius, strength) {
    this.forceFields.push({ x, y, radius, strength });
  }

  update(dt = 1 / 60) {
    for (const p of this.pool) {
      if (!p.active) continue;

      p.life -= dt;
      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      // Apply force fields
      for (const field of this.forceFields) {
        const dx = field.x - p.x;
        const dy = field.y - p.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        if (dist < field.radius) {
          const force = (1 - dist / field.radius) * field.strength;
          p.vx += (dx / dist) * force * dt;
          p.vy += (dy / dist) * force * dt;
        }
      }

      p.vx += this.gravityX * dt;
      p.vy += this.gravityY * dt;
      p.vx *= this.drag;
      p.vy *= this.drag;

      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
    }
  }

  render(ctx) {
    ctx.save();
    for (const p of this.pool) {
      if (!p.active) continue;

      const progress = 1 - (p.life / p.maxLife);
      const currentSize = p.size + (p.endSize - p.size) * progress;
      const alpha = 1 - progress;

      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, currentSize), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'square') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-currentSize / 2, -currentSize / 2, currentSize, currentSize);
        ctx.restore();
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.lineWidth = currentSize;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  clear() {
    for (const p of this.pool) {
      p.active = false;
    }
    this.forceFields = [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Particle, ParticleEmitter };
}

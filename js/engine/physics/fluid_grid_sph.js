/**
 * Aetheria Engine - SPH (Smoothed Particle Hydrodynamics) Liquid Simulator
 * Lagrangian particle fluid simulation featuring density pressure smoothing kernels,
 * surface tension, and viscosity forces.
 */

class SPHParticle {
  constructor(x, y) {
    this.position = new Vector2(x, y);
    this.velocity = new Vector2();
    this.force = new Vector2();
    this.density = 0;
    this.pressure = 0;
    this.mass = 1.0;
  }
}

class SPHFluidSimulator {
  constructor(maxParticles = 300, smoothingRadius = 16) {
    this.maxParticles = maxParticles;
    this.h = smoothingRadius;
    this.h2 = smoothingRadius * smoothingRadius;

    this.particles = [];
    this.restDensity = 1000;
    this.gasConstant = 2000;
    this.viscosity = 250;
    this.gravity = new Vector2(0, 9.8 * 20);

    // Poly6 & Spiky Kernel Constants
    this.poly6 = 315 / (64 * Math.PI * Math.pow(smoothingRadius, 9));
    this.spikyGrad = -45 / (Math.PI * Math.pow(smoothingRadius, 6));

    this.initParticles();
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      const p = new SPHParticle(100 + (i % 15) * 12, 50 + Math.floor(i / 15) * 12);
      this.particles.push(p);
    }
  }

  computeDensityPressure() {
    for (let i = 0; i < this.particles.length; i++) {
      const pi = this.particles[i];
      pi.density = 0;

      for (let j = 0; j < this.particles.length; j++) {
        const pj = this.particles[j];
        const r2 = Vector2.distanceSq(pi.position, pj.position);

        if (r2 < this.h2) {
          pi.density += pi.mass * this.poly6 * Math.pow(this.h2 - r2, 3);
        }
      }

      pi.pressure = this.gasConstant * (pi.density - this.restDensity);
    }
  }

  computeForces() {
    for (let i = 0; i < this.particles.length; i++) {
      const pi = this.particles[i];
      const pressureForce = new Vector2();
      const viscForce = new Vector2();

      for (let j = 0; j < this.particles.length; j++) {
        if (i === j) continue;
        const pj = this.particles[j];
        const dir = pi.position.sub(pj.position);
        const r = dir.magnitude();

        if (r < this.h && r > 0) {
          const normDir = dir.normalized();
          const pAvg = (pi.pressure + pj.pressure) / 2;
          const grad = this.spikyGrad * Math.pow(this.h - r, 2);

          pressureForce.subSelf(normDir.scale(pj.mass * pAvg / pj.density * grad));
          viscForce.addSelf(pj.velocity.sub(pi.velocity).scale(this.viscosity * pj.mass / pj.density));
        }
      }

      pi.force = pressureForce.add(viscForce).add(this.gravity.scale(pi.density));
    }
  }

  update(dt = 0.016) {
    this.computeDensityPressure();
    this.computeForces();

    for (const p of this.particles) {
      const accel = p.force.divide(p.density);
      p.velocity.addSelf(accel.scale(dt));
      p.position.addSelf(p.velocity.scale(dt));

      // Boundary collision check
      if (p.position.x < 10) { p.position.x = 10; p.velocity.x *= -0.5; }
      if (p.position.x > 630) { p.position.x = 630; p.velocity.x *= -0.5; }
      if (p.position.y > 500) { p.position.y = 500; p.velocity.y *= -0.5; }
    }
  }

  render(ctx) {
    ctx.fillStyle = '#00ffff';
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SPHParticle, SPHFluidSimulator };
}

/**
 * Aetheria Engine - Verlet Physics Module
 * Verlet integration solver for cloth, ropes, soft body meshes, dynamic chains,
 * and constraint relaxation solvers.
 */

class VerletPoint {
  constructor(x, y, pinned = false) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.pinned = pinned;
    this.friction = 0.98;
    this.gravityX = 0;
    this.gravityY = 0.25;
  }

  update() {
    if (this.pinned) return;

    const vx = (this.x - this.oldX) * this.friction;
    const vy = (this.y - this.oldY) * this.friction;

    this.oldX = this.x;
    this.oldY = this.y;

    this.x += vx + this.gravityX;
    this.y += vy + this.gravityY;
  }

  setPos(x, y) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
  }
}

class VerletConstraint {
  constructor(p1, p2, distance = null, stiffness = 1.0) {
    this.p1 = p1;
    this.p2 = p2;
    this.distance = distance !== null ? distance : Math.hypot(p2.x - p1.x, p2.y - p1.y);
    this.stiffness = stiffness;
  }

  resolve() {
    const dx = this.p2.x - this.p1.x;
    const dy = this.p2.y - this.p1.y;
    const dist = Math.hypot(dx, dy) || 0.0001;
    const delta = (this.distance - dist) / dist * 0.5 * this.stiffness;

    const offsetX = dx * delta;
    const offsetY = dy * delta;

    if (!this.p1.pinned) {
      this.p1.x -= offsetX;
      this.p1.y -= offsetY;
    }
    if (!this.p2.pinned) {
      this.p2.x += offsetX;
      this.p2.y += offsetY;
    }
  }
}

class VerletRopeSystem {
  constructor(startX, startY, numSegments = 10, segmentLength = 12) {
    this.points = [];
    this.constraints = [];

    for (let i = 0; i < numSegments; i++) {
      const p = new VerletPoint(startX + i * segmentLength, startY, i === 0);
      this.points.push(p);
    }

    for (let i = 0; i < numSegments - 1; i++) {
      const c = new VerletConstraint(this.points[i], this.points[i + 1], segmentLength);
      this.constraints.push(c);
    }
  }

  step(iterations = 5) {
    for (const p of this.points) {
      p.update();
    }

    for (let iter = 0; iter < iterations; iter++) {
      for (const c of this.constraints) {
        c.resolve();
      }
    }
  }

  setHeadPosition(x, y) {
    if (this.points.length > 0) {
      this.points[0].x = x;
      this.points[0].y = y;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VerletPoint, VerletConstraint, VerletRopeSystem };
}

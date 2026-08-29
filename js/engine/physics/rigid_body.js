/**
 * Aetheria Engine - Rigid Body 2D/3D Physics Simulator
 * Impulse-based rigid body simulator with mass, restitution, friction, forces,
 * and linear/angular velocity integration.
 */

class RigidBody2D {
  constructor(options = {}) {
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.mass = options.mass || 1.0;
    this.invMass = this.mass > 0 ? 1.0 / this.mass : 0;
    this.isStatic = options.isStatic || false;

    this.rotation = options.rotation || 0;
    this.angularVelocity = options.angularVelocity || 0;
    this.inertia = options.inertia || 1000;
    this.invInertia = this.inertia > 0 && !this.isStatic ? 1.0 / this.inertia : 0;

    this.restitution = options.restitution !== undefined ? options.restitution : 0.7; // Bounciness
    this.friction = options.friction !== undefined ? options.friction : 0.2;
    this.linearDamping = options.linearDamping !== undefined ? options.linearDamping : 0.99;
    this.angularDamping = options.angularDamping !== undefined ? options.angularDamping : 0.98;

    this.forceX = 0;
    this.forceY = 0;
    this.torque = 0;
  }

  applyForce(fx, fy) {
    if (this.isStatic) return;
    this.forceX += fx;
    this.forceY += fy;
  }

  applyImpulse(ix, iy) {
    if (this.isStatic) return;
    this.vx += ix * this.invMass;
    this.vy += iy * this.invMass;
  }

  applyTorque(t) {
    if (this.isStatic) return;
    this.torque += t;
  }

  update(dt = 1 / 60, gravityX = 0, gravityY = 9.8 * 20) {
    if (this.isStatic) return;

    // Apply gravity
    this.forceX += gravityX * this.mass;
    this.forceY += gravityY * this.mass;

    // Integrate acceleration to velocity
    this.vx += (this.forceX * this.invMass) * dt;
    this.vy += (this.forceY * this.invMass) * dt;
    this.angularVelocity += (this.torque * this.invInertia) * dt;

    // Apply damping
    this.vx *= this.linearDamping;
    this.vy *= this.linearDamping;
    this.angularVelocity *= this.angularDamping;

    // Integrate velocity to position
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.angularVelocity * dt;

    // Clear forces
    this.forceX = 0;
    this.forceY = 0;
    this.torque = 0;
  }

  static resolveCollision(bodyA, bodyB, normalX, normalY, penetration) {
    // Positional correction
    const percent = 0.8;
    const slop = 0.01;
    const correctionMagnitude = Math.max(penetration - slop, 0) / (bodyA.invMass + bodyB.invMass) * percent;

    if (!bodyA.isStatic) {
      bodyA.x -= normalX * correctionMagnitude * bodyA.invMass;
      bodyA.y -= normalY * correctionMagnitude * bodyA.invMass;
    }
    if (!bodyB.isStatic) {
      bodyB.x += normalX * correctionMagnitude * bodyB.invMass;
      bodyB.y += normalY * correctionMagnitude * bodyB.invMass;
    }

    // Relative velocity
    const rvx = bodyB.vx - bodyA.vx;
    const rvy = bodyB.vy - bodyA.vy;

    // Velocity along normal
    const velAlongNormal = rvx * normalX + rvy * normalY;

    // Do not resolve if velocities are separating
    if (velAlongNormal > 0) return;

    // Restitution
    const e = Math.min(bodyA.restitution, bodyB.restitution);

    // Calculate impulse scalar
    let j = -(1 + e) * velAlongNormal;
    j /= (bodyA.invMass + bodyB.invMass);

    // Apply impulse
    const impulseX = j * normalX;
    const impulseY = j * normalY;

    if (!bodyA.isStatic) {
      bodyA.vx -= impulseX * bodyA.invMass;
      bodyA.vy -= impulseY * bodyA.invMass;
    }
    if (!bodyB.isStatic) {
      bodyB.vx += impulseX * bodyB.invMass;
      bodyB.vy += impulseY * bodyB.invMass;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RigidBody2D;
}

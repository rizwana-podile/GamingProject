/**
 * Aetheria Engine - RigidBody 3D Physics Simulator
 * 3D rigid body simulator featuring inertia tensor matrices, linear & angular momentum,
 * impulse resolution, quaternions for rotation, gravity, and drag integration.
 */

class RigidBody3D {
  constructor(options = {}) {
    this.position = options.position || new Vector3();
    this.velocity = options.velocity || new Vector3();
    this.acceleration = new Vector3();

    this.orientation = options.orientation || Quaternion.identity();
    this.angularVelocity = options.angularVelocity || new Vector3();
    this.torque = new Vector3();

    this.mass = options.mass || 1.0;
    this.invMass = this.mass > 0 ? 1.0 / this.mass : 0;
    this.isStatic = options.isStatic || false;

    this.inertiaTensor = new Matrix4().identity();
    this.invInertiaTensor = new Matrix4().identity();

    this.linearDamping = options.linearDamping !== undefined ? options.linearDamping : 0.99;
    this.angularDamping = options.angularDamping !== undefined ? options.angularDamping : 0.98;
    this.restitution = options.restitution !== undefined ? options.restitution : 0.6;

    this.accumulatedForce = new Vector3();
  }

  applyForce(force) {
    if (this.isStatic) return;
    this.accumulatedForce.addSelf(force);
  }

  applyForceAtPoint(force, point) {
    if (this.isStatic) return;
    this.applyForce(force);
    const r = point.sub(this.position);
    const t = r.cross(force);
    this.torque.addSelf(t);
  }

  applyImpulse(impulse) {
    if (this.isStatic) return;
    this.velocity.addSelf(impulse.scale(this.invMass));
  }

  update(dt = 1 / 60, gravity = new Vector3(0, -9.8 * 10, 0)) {
    if (this.isStatic) return;

    // Apply gravity force
    this.accumulatedForce.addSelf(gravity.scale(this.mass));

    // Linear velocity integration
    this.acceleration = this.accumulatedForce.scale(this.invMass);
    this.velocity.addSelf(this.acceleration.scale(dt));
    this.velocity.scaleSelf(this.linearDamping);
    this.position.addSelf(this.velocity.scale(dt));

    // Angular velocity integration
    this.angularVelocity.addSelf(this.torque.scale(dt * this.invMass));
    this.angularVelocity.scaleSelf(this.angularDamping);

    // Integrate quaternion orientation
    const spin = new Quaternion(
      this.angularVelocity.x * 0.5 * dt,
      this.angularVelocity.y * 0.5 * dt,
      this.angularVelocity.z * 0.5 * dt,
      0
    );
    this.orientation = this.orientation.multiply(spin).normalized();

    // Clear accumulated forces
    this.accumulatedForce.set(0, 0, 0);
    this.torque.set(0, 0, 0);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RigidBody3D;
}

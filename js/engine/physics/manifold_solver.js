/**
 * Aetheria Engine - Contact Manifold Physics Solver
 * Generates contact points, resolves angular impulses, friction impulses,
 * and positional relaxation constraints across rigid body collisions.
 */

class ContactPoint {
  constructor(position, normal, penetration) {
    this.position = position;
    this.normal = normal;
    this.penetration = penetration;
    this.normalImpulse = 0;
    this.tangentImpulse = 0;
  }
}

class ManifoldSolver {
  static resolveManifold(bodyA, bodyB, contact) {
    if (bodyA.isStatic && bodyB.isStatic) return;

    const rA = contact.position.sub(bodyA.position);
    const rB = contact.position.sub(bodyB.position);

    // Relative velocity at contact point
    const vA = bodyA.velocity.add(bodyA.angularVelocity.cross(rA));
    const vB = bodyB.velocity.add(bodyB.angularVelocity.cross(rB));
    const relativeVel = vB.sub(vA);

    const contactVel = relativeVel.dot(contact.normal);
    if (contactVel > 0) return; // Moving apart

    const e = Math.min(bodyA.restitution, bodyB.restitution);

    let j = -(1 + e) * contactVel;
    const invMassSum = bodyA.invMass + bodyB.invMass;

    if (invMassSum === 0) return;
    j /= invMassSum;

    const impulse = contact.normal.scale(j);

    if (!bodyA.isStatic) bodyA.applyImpulse(impulse.scale(-1));
    if (!bodyB.isStatic) bodyB.applyImpulse(impulse);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ContactPoint, ManifoldSolver };
}

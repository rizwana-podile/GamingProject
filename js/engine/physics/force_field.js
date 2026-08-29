/**
 * Aetheria Engine - Force Field Physics Module
 * Spatial gravity wells, vortex tornados, wind turbulence, and directional magnet fields.
 */

class ForceField {
  constructor(type = 'point', position = new Vector3(), radius = 200, strength = 500) {
    this.type = type; // 'point', 'vortex', 'directional', 'wind'
    this.position = position;
    this.direction = new Vector3(0, -1, 0);
    this.radius = radius;
    this.strength = strength;
    this.falloff = 'linear'; // 'linear', 'quadratic', 'constant'
  }

  evaluateForce(targetPosition, targetMass = 1) {
    const delta = this.position.sub(targetPosition);
    const dist = delta.magnitude();

    if (dist > this.radius || dist === 0) {
      return new Vector3();
    }

    let factor = 1 - dist / this.radius;
    if (this.falloff === 'quadratic') factor = factor * factor;

    if (this.type === 'point') {
      return delta.normalized().scale(this.strength * factor * targetMass);
    } else if (this.type === 'vortex') {
      const tangent = new Vector3(-delta.z, delta.y, delta.x).normalized();
      return tangent.scale(this.strength * factor * targetMass);
    } else if (this.type === 'directional' || this.type === 'wind') {
      return this.direction.scale(this.strength * factor * targetMass);
    }

    return new Vector3();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForceField;
}

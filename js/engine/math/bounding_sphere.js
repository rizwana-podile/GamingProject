/**
 * Aetheria Engine - Bounding Sphere Math Module
 * Sphere bounding volume computation, minimum enclosing sphere, point containment,
 * and fast sphere-sphere / sphere-box intersection tests.
 */

class BoundingSphere {
  constructor(center = new Vector3(), radius = 0) {
    this.center = center;
    this.radius = radius;
  }

  setFromPoints(points) {
    if (points.length === 0) {
      this.center.set(0, 0, 0);
      this.radius = 0;
      return this;
    }

    // Compute center as average of points
    const sum = new Vector3();
    for (const p of points) {
      sum.addSelf(p);
    }
    this.center = sum.scale(1 / points.length);

    // Compute maximum distance from center
    let maxRadiusSq = 0;
    for (const p of points) {
      const distSq = Vector3.distanceSq(this.center, p);
      if (distSq > maxRadiusSq) {
        maxRadiusSq = distSq;
      }
    }
    this.radius = Math.sqrt(maxRadiusSq);
    return this;
  }

  containsPoint(p) {
    return Vector3.distanceSq(this.center, p) <= this.radius * this.radius;
  }

  intersectsSphere(sphere) {
    const radiusSum = this.radius + sphere.radius;
    return Vector3.distanceSq(this.center, sphere.center) <= radiusSum * radiusSum;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BoundingSphere;
}

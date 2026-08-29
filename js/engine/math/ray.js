/**
 * Aetheria Engine - Ray 3D Raycasting Module
 * 3D Ray origin & direction representation with ray-plane, ray-sphere,
 * ray-box (AABB), and triangle mesh intersection solvers.
 */

class Ray {
  constructor(origin = new Vector3(), direction = new Vector3(0, 0, -1)) {
    this.origin = origin;
    this.direction = direction.normalized();
  }

  at(t) {
    return this.origin.add(this.direction.scale(t));
  }

  intersectPlane(plane) {
    const denominator = plane.normal.dot(this.direction);
    if (Math.abs(denominator) < 0.00001) return null;

    const t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;
    return t >= 0 ? t : null;
  }

  intersectSphere(sphereCenter, radius) {
    const oc = this.origin.sub(sphereCenter);
    const a = this.direction.dot(this.direction);
    const b = 2.0 * oc.dot(this.direction);
    const c = oc.dot(oc) - radius * radius;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) return null;

    const t = (-b - Math.sqrt(discriminant)) / (2.0 * a);
    return t >= 0 ? t : null;
  }

  intersectBox(boxMin, boxMax) {
    let tmin = (boxMin.x - this.origin.x) / (this.direction.x || 0.00001);
    let tmax = (boxMax.x - this.origin.x) / (this.direction.x || 0.00001);
    if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

    let tymin = (boxMin.y - this.origin.y) / (this.direction.y || 0.00001);
    let tymax = (boxMax.y - this.origin.y) / (this.direction.y || 0.00001);
    if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

    if (tmin > tymax || tymin > tmax) return null;
    if (tymin > tmin) tmin = tymin;
    if (tymax < tmax) tmax = tymax;

    let tzmin = (boxMin.z - this.origin.z) / (this.direction.z || 0.00001);
    let tzmax = (boxMax.z - this.origin.z) / (this.direction.z || 0.00001);
    if (tzmin > tzmax) [tzmin, tzmax] = [tzmax, tzmin];

    if (tmin > tzmax || tzmin > tmax) return null;
    if (tzmin > tmin) tmin = tzmin;

    return tmin >= 0 ? tmin : null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Ray;
}

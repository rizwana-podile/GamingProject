/**
 * Aetheria Engine - 3D Plane Geometry Module
 * Plane representation defined by normal vector and constant distance from origin,
 * frustum plane extraction, half-space classification, and point projection.
 */

class Plane {
  constructor(normal = new Vector3(0, 1, 0), constant = 0) {
    this.normal = normal.normalized();
    this.constant = constant;
  }

  static fromNormalAndCoplanarPoint(normal, point) {
    const norm = normal.normalized();
    const constant = -norm.dot(point);
    return new Plane(norm, constant);
  }

  distanceToPoint(point) {
    return this.normal.dot(point) + this.constant;
  }

  projectPoint(point) {
    const dist = this.distanceToPoint(point);
    return point.sub(this.normal.scale(dist));
  }

  intersectsBox(box) {
    const min = box.min;
    const max = box.max;

    const p = new Vector3(
      this.normal.x >= 0 ? max.x : min.x,
      this.normal.y >= 0 ? max.y : min.y,
      this.normal.z >= 0 ? max.z : min.z
    );

    return this.distanceToPoint(p) >= 0;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Plane;
}

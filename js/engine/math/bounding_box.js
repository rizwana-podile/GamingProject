/**
 * Aetheria Engine - Bounding Box (AABB & OBB) 3D Module
 * Axis-Aligned Bounding Box (AABB) computation, expansion, union,
 * point containment, and box-box intersection testing.
 */

class BoundingBox {
  constructor(min = new Vector3(Infinity, Infinity, Infinity), max = new Vector3(-Infinity, -Infinity, -Infinity)) {
    this.min = min;
    this.max = max;
  }

  setFromPoints(points) {
    this.makeEmpty();
    for (const p of points) {
      this.expandByPoint(p);
    }
    return this;
  }

  makeEmpty() {
    this.min.set(Infinity, Infinity, Infinity);
    this.max.set(-Infinity, -Infinity, -Infinity);
    return this;
  }

  expandByPoint(p) {
    this.min.x = Math.min(this.min.x, p.x);
    this.min.y = Math.min(this.min.y, p.y);
    this.min.z = Math.min(this.min.z, p.z);

    this.max.x = Math.max(this.max.x, p.x);
    this.max.y = Math.max(this.max.y, p.y);
    this.max.z = Math.max(this.max.z, p.z);
    return this;
  }

  containsPoint(p) {
    return (
      p.x >= this.min.x && p.x <= this.max.x &&
      p.y >= this.min.y && p.y <= this.max.y &&
      p.z >= this.min.z && p.z <= this.max.z
    );
  }

  intersectsBox(box) {
    return !(
      box.max.x < this.min.x || box.min.x > this.max.x ||
      box.max.y < this.min.y || box.min.y > this.max.y ||
      box.max.z < this.min.z || box.min.z > this.max.z
    );
  }

  getCenter() {
    return this.min.add(this.max).scale(0.5);
  }

  getSize() {
    return this.max.sub(this.min);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BoundingBox;
}

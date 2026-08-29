/**
 * Aetheria Engine - Vector4 Math Module
 * High performance 4D vector class for homogeneous coordinates, WebGL attribute arrays,
 * color transformations, and 4D spatial operations.
 */

class Vector4 {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
    this.z = Number(z) || 0;
    this.w = Number(w) || 1;
  }

  static zero() {
    return new Vector4(0, 0, 0, 0);
  }

  static one() {
    return new Vector4(1, 1, 1, 1);
  }

  static lerp(v1, v2, t) {
    const clampedT = Math.max(0, Math.min(1, t));
    return new Vector4(
      v1.x + (v2.x - v1.x) * clampedT,
      v1.y + (v2.y - v1.y) * clampedT,
      v1.z + (v2.z - v1.z) * clampedT,
      v1.w + (v2.w - v1.w) * clampedT
    );
  }

  static distance(v1, v2) {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    const dz = v2.z - v1.z;
    const dw = v2.w - v1.w;
    return Math.hypot(dx, dy, dz, dw);
  }

  clone() {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
    return this;
  }

  set(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  add(v) {
    return new Vector4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
  }

  sub(v) {
    return new Vector4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
  }

  scale(s) {
    return new Vector4(this.x * s, this.y * s, this.z * s, this.w * s);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  magnitude() {
    return Math.hypot(this.x, this.y, this.z, this.w);
  }

  normalized() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector4(0, 0, 0, 0);
    return new Vector4(this.x / mag, this.y / mag, this.z / mag, this.w / mag);
  }

  toArray() {
    return [this.x, this.y, this.z, this.w];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Vector4;
}

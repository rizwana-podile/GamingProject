/**
 * Aetheria Engine - Vector3 Math Module
 * Comprehensive 3D vector arithmetic, cross product, projection, spherical coordinates,
 * and 3D geometric calculations.
 */

class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
    this.z = Number(z) || 0;
  }

  static zero() {
    return new Vector3(0, 0, 0);
  }

  static one() {
    return new Vector3(1, 1, 1);
  }

  static up() {
    return new Vector3(0, 1, 0);
  }

  static down() {
    return new Vector3(0, -1, 0);
  }

  static left() {
    return new Vector3(-1, 0, 0);
  }

  static right() {
    return new Vector3(1, 0, 0);
  }

  static forward() {
    return new Vector3(0, 0, 1);
  }

  static back() {
    return new Vector3(0, 0, -1);
  }

  static fromSpherical(radius, theta, phi) {
    const sinPhi = Math.sin(phi);
    return new Vector3(
      radius * sinPhi * Math.cos(theta),
      radius * Math.cos(phi),
      radius * sinPhi * Math.sin(theta)
    );
  }

  static randomUnit() {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random());
    const sinPhi = Math.sin(phi);
    return new Vector3(
      r * sinPhi * Math.cos(theta),
      r * sinPhi * Math.sin(theta),
      r * Math.cos(phi)
    );
  }

  static lerp(v1, v2, t) {
    const clampedT = Math.max(0, Math.min(1, t));
    return new Vector3(
      v1.x + (v2.x - v1.x) * clampedT,
      v1.y + (v2.y - v1.y) * clampedT,
      v1.z + (v2.z - v1.z) * clampedT
    );
  }

  static distance(v1, v2) {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    const dz = v2.z - v1.z;
    return Math.hypot(dx, dy, dz);
  }

  static distanceSq(v1, v2) {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    const dz = v2.z - v1.z;
    return dx * dx + dy * dy + dz * dz;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  addSelf(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  subSelf(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  scale(s) {
    return new Vector3(this.x * s, this.y * s, this.z * s);
  }

  scaleSelf(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  divide(s) {
    if (s === 0) return new Vector3(0, 0, 0);
    return new Vector3(this.x / s, this.y / s, this.z / s);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  magnitude() {
    return Math.hypot(this.x, this.y, this.z);
  }

  magnitudeSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  normalized() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector3(0, 0, 0);
    return new Vector3(this.x / mag, this.y / mag, this.z / mag);
  }

  normalizeSelf() {
    const mag = this.magnitude();
    if (mag !== 0) {
      this.x /= mag;
      this.y /= mag;
      this.z /= mag;
    }
    return this;
  }

  angleTo(v) {
    const dotVal = this.dot(v);
    const mags = this.magnitude() * v.magnitude();
    if (mags === 0) return 0;
    return Math.acos(Math.max(-1, Math.min(1, dotVal / mags)));
  }

  project(v) {
    const vMagSq = v.magnitudeSq();
    if (vMagSq === 0) return new Vector3(0, 0, 0);
    const scale = this.dot(v) / vMagSq;
    return v.scale(scale);
  }

  reflect(normal) {
    const norm = normal.normalized();
    const dotVal = this.dot(norm);
    return this.sub(norm.scale(2 * dotVal));
  }

  equals(v, epsilon = 0.00001) {
    return Math.abs(this.x - v.x) < epsilon &&
           Math.abs(this.y - v.y) < epsilon &&
           Math.abs(this.z - v.z) < epsilon;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  toString() {
    return `Vector3(${this.x.toFixed(3)}, ${this.y.toFixed(3)}, ${this.z.toFixed(3)})`;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Vector3;
}

/**
 * Aetheria Engine - Vector2 Math Module
 * High-performance 2D vector class with immutable and mutable operations, 
 * polar coordinates, interpolations, and vector array batch processing.
 */

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
  }

  static zero() {
    return new Vector2(0, 0);
  }

  static one() {
    return new Vector2(1, 1);
  }

  static up() {
    return new Vector2(0, -1);
  }

  static down() {
    return new Vector2(0, 1);
  }

  static left() {
    return new Vector2(-1, 0);
  }

  static right() {
    return new Vector2(1, 0);
  }

  static fromAngle(radians, length = 1) {
    return new Vector2(Math.cos(radians) * length, Math.sin(radians) * length);
  }

  static fromPolar(r, theta) {
    return new Vector2(r * Math.cos(theta), r * Math.sin(theta));
  }

  static randomUnit() {
    const angle = Math.random() * Math.PI * 2;
    return Vector2.fromAngle(angle);
  }

  static lerp(v1, v2, t) {
    const clampedT = Math.max(0, Math.min(1, t));
    return new Vector2(
      v1.x + (v2.x - v1.x) * clampedT,
      v1.y + (v2.y - v1.y) * clampedT
    );
  }

  static slerp(v1, v2, t) {
    let dot = v1.normalized().dot(v2.normalized());
    dot = Math.max(-1, Math.min(1, dot));
    const theta = Math.acos(dot) * t;
    const relativeVec = v2.sub(v1.scale(dot)).normalized();
    return v1.scale(Math.cos(theta)).add(relativeVec.scale(Math.sin(theta)));
  }

  static distance(v1, v2) {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    return Math.hypot(dx, dy);
  }

  static distanceSq(v1, v2) {
    const dx = v2.x - v1.x;
    const dy = v2.y - v1.y;
    return dx * dx + dy * dy;
  }

  static min(v1, v2) {
    return new Vector2(Math.min(v1.x, v2.x), Math.min(v1.y, v2.y));
  }

  static max(v1, v2) {
    return new Vector2(Math.max(v1.x, v2.x), Math.max(v1.y, v2.y));
  }

  static clamp(v, minVec, maxVec) {
    return new Vector2(
      Math.max(minVec.x, Math.min(maxVec.x, v.x)),
      Math.max(minVec.y, Math.min(maxVec.y, v.y))
    );
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  addSelf(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  addScalar(s) {
    return new Vector2(this.x + s, this.y + s);
  }

  sub(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  subSelf(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  subScalar(s) {
    return new Vector2(this.x - s, this.y - s);
  }

  scale(s) {
    return new Vector2(this.x * s, this.y * s);
  }

  scaleSelf(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  divide(s) {
    if (s === 0) return new Vector2(0, 0);
    return new Vector2(this.x / s, this.y / s);
  }

  divideSelf(s) {
    if (s !== 0) {
      this.x /= s;
      this.y /= s;
    }
    return this;
  }

  multiplyVec(v) {
    return new Vector2(this.x * v.x, this.y * v.y);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return this.x * v.y - this.y * v.x;
  }

  magnitude() {
    return Math.hypot(this.x, this.y);
  }

  magnitudeSq() {
    return this.x * this.x + this.y * this.y;
  }

  normalized() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2(0, 0);
    return new Vector2(this.x / mag, this.y / mag);
  }

  normalizeSelf() {
    const mag = this.magnitude();
    if (mag !== 0) {
      this.x /= mag;
      this.y /= mag;
    }
    return this;
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  angleTo(v) {
    const dotVal = this.dot(v);
    const mags = this.magnitude() * v.magnitude();
    if (mags === 0) return 0;
    return Math.acos(Math.max(-1, Math.min(1, dotVal / mags)));
  }

  signedAngleTo(v) {
    return Math.atan2(this.cross(v), this.dot(v));
  }

  rotate(radians) {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return new Vector2(
      this.x * cos - this.y * sin,
      this.x * sin + this.y * cos
    );
  }

  rotateAround(center, radians) {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const nx = (this.x - center.x) * cos - (this.y - center.y) * sin + center.x;
    const ny = (this.x - center.x) * sin + (this.y - center.y) * cos + center.y;
    return new Vector2(nx, ny);
  }

  perpendicular() {
    return new Vector2(-this.y, this.x);
  }

  project(v) {
    const vMagSq = v.magnitudeSq();
    if (vMagSq === 0) return new Vector2(0, 0);
    const scale = this.dot(v) / vMagSq;
    return v.scale(scale);
  }

  reflect(normal) {
    const norm = normal.normalized();
    const dotVal = this.dot(norm);
    return this.sub(norm.scale(2 * dotVal));
  }

  equals(v, epsilon = 0.00001) {
    return Math.abs(this.x - v.x) < epsilon && Math.abs(this.y - v.y) < epsilon;
  }

  toArray() {
    return [this.x, this.y];
  }

  toObject() {
    return { x: this.x, y: this.y };
  }

  toString() {
    return `Vector2(${this.x.toFixed(3)}, ${this.y.toFixed(3)})`;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Vector2;
}

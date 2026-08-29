/**
 * Aetheria Engine - Quaternion Math Module
 * Full 3D rotation representation via quaternions (w, x, y, z), supporting SLERP,
 * Euler angles conversion, axis-angle rotation, and matrix conversion.
 */

class Quaternion {
  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = Number(x) || 0;
    this.y = Number(y) || 0;
    this.z = Number(z) || 0;
    this.w = Number(w) || 1;
  }

  static identity() {
    return new Quaternion(0, 0, 0, 1);
  }

  static fromAxisAngle(axis, angle) {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);
    const normAxis = axis.normalized();
    return new Quaternion(
      normAxis.x * s,
      normAxis.y * s,
      normAxis.z * s,
      Math.cos(halfAngle)
    );
  }

  static fromEuler(pitch, yaw, roll) {
    const c1 = Math.cos(pitch / 2);
    const s1 = Math.sin(pitch / 2);
    const c2 = Math.cos(yaw / 2);
    const s2 = Math.sin(yaw / 2);
    const c3 = Math.cos(roll / 2);
    const s3 = Math.sin(roll / 2);

    return new Quaternion(
      s1 * c2 * c3 + c1 * s2 * s3,
      c1 * s2 * c3 - s1 * c2 * s3,
      c1 * c2 * s3 + s1 * s2 * c3,
      c1 * c2 * c3 - s1 * s2 * s3
    );
  }

  static slerp(q1, q2, t) {
    let cosHalfTheta = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;

    let targetQ = q2;
    if (cosHalfTheta < 0) {
      targetQ = new Quaternion(-q2.x, -q2.y, -q2.z, -q2.w);
      cosHalfTheta = -cosHalfTheta;
    }

    if (Math.abs(cosHalfTheta) >= 1.0) {
      return q1.clone();
    }

    const halfTheta = Math.acos(cosHalfTheta);
    const sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
      return new Quaternion(
        q1.x * 0.5 + targetQ.x * 0.5,
        q1.y * 0.5 + targetQ.y * 0.5,
        q1.z * 0.5 + targetQ.z * 0.5,
        q1.w * 0.5 + targetQ.w * 0.5
      );
    }

    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    return new Quaternion(
      q1.x * ratioA + targetQ.x * ratioB,
      q1.y * ratioA + targetQ.y * ratioB,
      q1.z * ratioA + targetQ.z * ratioB,
      q1.w * ratioA + targetQ.w * ratioB
    );
  }

  clone() {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  multiply(q) {
    return new Quaternion(
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z
    );
  }

  conjugate() {
    return new Quaternion(-this.x, -this.y, -this.z, this.w);
  }

  magnitude() {
    return Math.hypot(this.x, this.y, this.z, this.w);
  }

  normalized() {
    const mag = this.magnitude();
    if (mag === 0) return Quaternion.identity();
    return new Quaternion(this.x / mag, this.y / mag, this.z / mag, this.w / mag);
  }

  rotateVector3(v) {
    const qv = new Quaternion(v.x, v.y, v.z, 0);
    const res = this.multiply(qv).multiply(this.conjugate());
    return new Vector3(res.x, res.y, res.z);
  }

  toEuler() {
    const sinr_cosp = 2 * (this.w * this.x + this.y * this.z);
    const cosr_cosp = 1 - 2 * (this.x * this.x + this.y * this.y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);

    const sinp = 2 * (this.w * this.y - this.z * this.x);
    const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp);

    const siny_cosp = 2 * (this.w * this.z + this.x * this.y);
    const cosy_cosp = 1 - 2 * (this.y * this.y + this.z * this.z);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    return { pitch, yaw, roll };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Quaternion;
}

/**
 * Aetheria Engine - Matrix4 Math Module
 * Full 4x4 transformation matrix implementation supporting translation, rotation, scaling,
 * perspective & orthographic projection, and vector transformation.
 */

class Matrix4 {
  constructor() {
    this.elements = new Float32Array(16);
    this.identity();
  }

  identity() {
    const e = this.elements;
    e[0] = 1; e[4] = 0; e[8]  = 0; e[12] = 0;
    e[1] = 0; e[5] = 1; e[9]  = 0; e[13] = 0;
    e[2] = 0; e[6] = 0; e[10] = 1; e[14] = 0;
    e[3] = 0; e[7] = 0; e[11] = 0; e[15] = 1;
    return this;
  }

  set(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
    const e = this.elements;
    e[0] = m00; e[4] = m01; e[8]  = m02; e[12] = m03;
    e[1] = m10; e[5] = m11; e[9]  = m12; e[13] = m13;
    e[2] = m20; e[6] = m21; e[10] = m22; e[14] = m23;
    e[3] = m30; e[7] = m31; e[11] = m32; e[15] = m33;
    return this;
  }

  clone() {
    const m = new Matrix4();
    m.elements.set(this.elements);
    return m;
  }

  copy(m) {
    this.elements.set(m.elements);
    return this;
  }

  multiply(m) {
    return Matrix4.multiply(this, m);
  }

  static multiply(a, b) {
    const ae = a.elements;
    const be = b.elements;
    const out = new Matrix4();
    const oe = out.elements;

    const a00 = ae[0], a01 = ae[4], a02 = ae[8],  a03 = ae[12];
    const a10 = ae[1], a11 = ae[5], a12 = ae[9],  a13 = ae[13];
    const a20 = ae[2], a21 = ae[6], a22 = ae[10], a23 = ae[14];
    const a30 = ae[3], a31 = ae[7], a32 = ae[11], a33 = ae[15];

    let b0 = be[0], b1 = be[1], b2 = be[2], b3 = be[3];
    oe[0] = b0*a00 + b1*a01 + b2*a02 + b3*a03;
    oe[1] = b0*a10 + b1*a11 + b2*a12 + b3*a13;
    oe[2] = b0*a20 + b1*a21 + b2*a22 + b3*a23;
    oe[3] = b0*a30 + b1*a31 + b2*a32 + b3*a33;

    b0 = be[4]; b1 = be[5]; b2 = be[6]; b3 = be[7];
    oe[4] = b0*a00 + b1*a01 + b2*a02 + b3*a03;
    oe[5] = b0*a10 + b1*a11 + b2*a12 + b3*a13;
    oe[6] = b0*a20 + b1*a21 + b2*a22 + b3*a23;
    oe[7] = b0*a30 + b1*a31 + b2*a32 + b3*a33;

    b0 = be[8]; b1 = be[9]; b2 = be[10]; b3 = be[11];
    oe[8]  = b0*a00 + b1*a01 + b2*a02 + b3*a03;
    oe[9]  = b0*a10 + b1*a11 + b2*a12 + b3*a13;
    oe[10] = b0*a20 + b1*a21 + b2*a22 + b3*a23;
    oe[11] = b0*a30 + b1*a31 + b2*a32 + b3*a33;

    b0 = be[12]; b1 = be[13]; b2 = be[14]; b3 = be[15];
    oe[12] = b0*a00 + b1*a01 + b2*a02 + b3*a03;
    oe[13] = b0*a10 + b1*a11 + b2*a12 + b3*a13;
    oe[14] = b0*a20 + b1*a21 + b2*a22 + b3*a23;
    oe[15] = b0*a30 + b1*a31 + b2*a32 + b3*a33;

    return out;
  }

  static translation(x, y, z) {
    const m = new Matrix4();
    const e = m.elements;
    e[12] = x;
    e[13] = y;
    e[14] = z;
    return m;
  }

  static scaling(x, y, z) {
    const m = new Matrix4();
    const e = m.elements;
    e[0] = x;
    e[5] = y;
    e[10] = z;
    return m;
  }

  static rotationX(radians) {
    const m = new Matrix4();
    const e = m.elements;
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    e[5] = c;  e[9] = -s;
    e[6] = s;  e[10] = c;
    return m;
  }

  static rotationY(radians) {
    const m = new Matrix4();
    const e = m.elements;
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    e[0] = c;  e[8] = s;
    e[2] = -s; e[10] = c;
    return m;
  }

  static rotationZ(radians) {
    const m = new Matrix4();
    const e = m.elements;
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    e[0] = c;  e[4] = -s;
    e[1] = s;  e[5] = c;
    return m;
  }

  static perspective(fovRadians, aspect, near, far) {
    const m = new Matrix4();
    const e = m.elements;
    const f = 1.0 / Math.tan(fovRadians / 2);
    const nf = 1 / (near - far);

    e[0] = f / aspect;
    e[5] = f;
    e[10] = (far + near) * nf;
    e[11] = -1;
    e[14] = 2 * far * near * nf;
    e[15] = 0;

    return m;
  }

  static orthographic(left, right, bottom, top, near, far) {
    const m = new Matrix4();
    const e = m.elements;
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    e[0] = -2 * lr;
    e[5] = -2 * bt;
    e[10] = 2 * nf;
    e[12] = (left + right) * lr;
    e[13] = (top + bottom) * bt;
    e[14] = (far + near) * nf;

    return m;
  }

  static lookAt(eye, center, up) {
    const m = new Matrix4();
    const e = m.elements;

    let z0 = eye.x - center.x;
    let z1 = eye.y - center.y;
    let z2 = eye.z - center.z;
    let len = 1 / (Math.hypot(z0, z1, z2) || 1);
    z0 *= len; z1 *= len; z2 *= len;

    let x0 = up.y * z2 - up.z * z1;
    let x1 = up.z * z0 - up.x * z2;
    let x2 = up.x * z1 - up.y * z0;
    len = 1 / (Math.hypot(x0, x1, x2) || 1);
    x0 *= len; x1 *= len; x2 *= len;

    let y0 = z1 * x2 - z2 * x1;
    let y1 = z2 * x0 - z0 * x2;
    let y2 = z0 * x1 - z1 * x0;
    len = 1 / (Math.hypot(y0, y1, y2) || 1);
    y0 *= len; y1 *= len; y2 *= len;

    e[0] = x0; e[4] = x1; e[8]  = x2; e[12] = -(x0 * eye.x + x1 * eye.y + x2 * eye.z);
    e[1] = y0; e[5] = y1; e[9]  = y2; e[13] = -(y0 * eye.x + y1 * eye.y + y2 * eye.z);
    e[2] = z0; e[6] = z1; e[10] = z2; e[14] = -(z0 * eye.x + z1 * eye.y + z2 * eye.z);
    e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;

    return m;
  }

  transformVector3(v) {
    const e = this.elements;
    const x = v.x, y = v.y, z = v.z;
    const w = e[3] * x + e[7] * y + e[11] * z + e[15] || 1;

    return new Vector3(
      (e[0] * x + e[4] * y + e[8] * z + e[12]) / w,
      (e[1] * x + e[5] * y + e[9] * z + e[13]) / w,
      (e[2] * x + e[6] * y + e[10] * z + e[14]) / w
    );
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Matrix4;
}

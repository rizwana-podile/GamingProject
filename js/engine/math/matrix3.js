/**
 * Aetheria Engine - Matrix3 Math Module
 * 3x3 Transformation Matrix implementation supporting 2D transformations,
 * normal matrix computation for 3D lighting, determinant, and inversion.
 */

class Matrix3 {
  constructor() {
    this.elements = new Float32Array(9);
    this.identity();
  }

  identity() {
    const e = this.elements;
    e[0] = 1; e[3] = 0; e[6] = 0;
    e[1] = 0; e[4] = 1; e[7] = 0;
    e[2] = 0; e[5] = 0; e[8] = 1;
    return this;
  }

  set(m00, m01, m02, m10, m11, m12, m20, m21, m22) {
    const e = this.elements;
    e[0] = m00; e[3] = m01; e[6] = m02;
    e[1] = m10; e[4] = m11; e[7] = m12;
    e[2] = m20; e[5] = m21; e[8] = m22;
    return this;
  }

  clone() {
    const m = new Matrix3();
    m.elements.set(this.elements);
    return m;
  }

  multiply(m) {
    const ae = this.elements;
    const be = m.elements;
    const out = new Matrix3();
    const oe = out.elements;

    const a00 = ae[0], a01 = ae[3], a02 = ae[6];
    const a10 = ae[1], a11 = ae[4], a12 = ae[7];
    const a20 = ae[2], a21 = ae[5], a22 = ae[8];

    let b0 = be[0], b1 = be[1], b2 = be[2];
    oe[0] = b0 * a00 + b1 * a01 + b2 * a02;
    oe[1] = b0 * a10 + b1 * a11 + b2 * a12;
    oe[2] = b0 * a20 + b1 * a21 + b2 * a22;

    b0 = be[3]; b1 = be[4]; b2 = be[5];
    oe[3] = b0 * a00 + b1 * a01 + b2 * a02;
    oe[4] = b0 * a10 + b1 * a11 + b2 * a12;
    oe[5] = b0 * a20 + b1 * a21 + b2 * a22;

    b0 = be[6]; b1 = be[7]; b2 = be[8];
    oe[6] = b0 * a00 + b1 * a01 + b2 * a02;
    oe[7] = b0 * a10 + b1 * a11 + b2 * a12;
    oe[8] = b0 * a20 + b1 * a21 + b2 * a22;

    return out;
  }

  static translation(x, y) {
    const m = new Matrix3();
    const e = m.elements;
    e[6] = x;
    e[7] = y;
    return m;
  }

  static rotation(radians) {
    const m = new Matrix3();
    const e = m.elements;
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    e[0] = c;  e[3] = -s;
    e[1] = s;  e[4] = c;
    return m;
  }

  static scaling(x, y) {
    const m = new Matrix3();
    const e = m.elements;
    e[0] = x;
    e[4] = y;
    return m;
  }

  determinant() {
    const e = this.elements;
    return (
      e[0] * (e[4] * e[8] - e[7] * e[5]) -
      e[3] * (e[1] * e[8] - e[7] * e[2]) +
      e[6] * (e[1] * e[5] - e[4] * e[2])
    );
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Matrix3;
}

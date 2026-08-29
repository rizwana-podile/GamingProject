/**
 * Aetheria Engine - Frustum View Volume Module
 * 6-Plane camera view frustum extraction from view-projection matrix,
 * frustum culling for bounding boxes, spheres, and meshes.
 */

class Frustum {
  constructor() {
    this.planes = [
      new Plane(), new Plane(), new Plane(),
      new Plane(), new Plane(), new Plane()
    ];
  }

  setFromProjectionMatrix(m) {
    const me = m.elements;
    const me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
    const me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
    const me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
    const me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];

    // Left plane
    this.planes[0].normal.set(me3 + me0, me7 + me4, me11 + me8).normalizeSelf();
    this.planes[0].constant = me15 + me12;

    // Right plane
    this.planes[1].normal.set(me3 - me0, me7 - me4, me11 - me8).normalizeSelf();
    this.planes[1].constant = me15 - me12;

    // Bottom plane
    this.planes[2].normal.set(me3 + me1, me7 + me5, me11 + me9).normalizeSelf();
    this.planes[2].constant = me15 + me13;

    // Top plane
    this.planes[3].normal.set(me3 - me1, me7 - me5, me11 - me9).normalizeSelf();
    this.planes[3].constant = me15 - me13;

    // Near plane
    this.planes[4].normal.set(me3 + me2, me7 + me6, me11 + me10).normalizeSelf();
    this.planes[4].constant = me15 + me14;

    // Far plane
    this.planes[5].normal.set(me3 - me2, me7 - me6, me11 - me10).normalizeSelf();
    this.planes[5].constant = me15 - me14;

    return this;
  }

  intersectsSphere(sphere) {
    for (let i = 0; i < 6; i++) {
      const distance = this.planes[i].distanceToPoint(sphere.center);
      if (distance < -sphere.radius) {
        return false;
      }
    }
    return true;
  }

  intersectsBox(box) {
    for (let i = 0; i < 6; i++) {
      if (!this.planes[i].intersectsBox(box)) {
        return false;
      }
    }
    return true;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Frustum;
}

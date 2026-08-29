/**
 * Aetheria Engine - EPA (Expanding Polytope Algorithm) Penetration Depth Solver
 * Computes exact contact normal and penetration depth for GJK convex 3D collisions.
 */

class EPACollision {
  static getPenetrationDepth(shapeA, shapeB, simplex) {
    const polytope = [...simplex];
    const faces = [
      [0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]
    ];

    let minFace = null;
    let minDistance = Infinity;
    let minNormal = null;

    for (let iter = 0; iter < 32; iter++) {
      minDistance = Infinity;

      for (const face of faces) {
        const a = polytope[face[0]];
        const b = polytope[face[1]];
        const c = polytope[face[2]];

        const ab = b.sub(a);
        const ac = c.sub(a);
        let normal = ab.cross(ac).normalized();
        let distance = normal.dot(a);

        if (distance < 0) {
          normal = normal.scale(-1);
          distance = -distance;
        }

        if (distance < minDistance) {
          minDistance = distance;
          minNormal = normal;
          minFace = face;
        }
      }

      if (!minNormal) break;

      const p = GJKCollision.support(shapeA, shapeB, minNormal);
      const d = p.dot(minNormal);

      if (d - minDistance < 0.001) {
        return {
          depth: minDistance,
          normal: minNormal
        };
      }

      polytope.push(p);
    }

    return {
      depth: minDistance || 0,
      normal: minNormal || new Vector3(0, 1, 0)
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EPACollision;
}

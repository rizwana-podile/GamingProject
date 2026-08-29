/**
 * Aetheria Engine - Separating Axis Theorem (SAT) Collision Module
 * Exact collision detection & Minimum Translation Vector (MTV) calculation
 * for arbitrary convex polygons, rotated boxes, and circles.
 */

class SATCollision {
  static checkPolygonPolygon(polyA, polyB) {
    let overlap = Infinity;
    let smallestAxis = null;

    const axesA = SATCollision.getAxes(polyA);
    const axesB = SATCollision.getAxes(polyB);
    const axes = [...axesA, ...axesB];

    for (const axis of axes) {
      const projA = SATCollision.projectPolygon(polyA, axis);
      const projB = SATCollision.projectPolygon(polyB, axis);

      if (!SATCollision.overlaps(projA, projB)) {
        return { collided: false, mtv: null };
      }

      const o = SATCollision.getOverlap(projA, projB);
      if (o < overlap) {
        overlap = o;
        smallestAxis = axis;
      }
    }

    return {
      collided: true,
      mtv: {
        x: smallestAxis.x * overlap,
        y: smallestAxis.y * overlap,
        overlap: overlap
      }
    };
  }

  static checkCirclePolygon(circle, polygon) {
    let closestPoint = polygon[0];
    let minDistanceSq = Infinity;

    for (let i = 0; i < polygon.length; i++) {
      const p = polygon[i];
      const distSq = (p.x - circle.x) ** 2 + (p.y - circle.y) ** 2;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestPoint = p;
      }
    }

    const axis = {
      x: closestPoint.x - circle.x,
      y: closestPoint.y - circle.y
    };
    const len = Math.hypot(axis.x, axis.y) || 1;
    axis.x /= len;
    axis.y /= len;

    const axes = [...SATCollision.getAxes(polygon), axis];
    let overlap = Infinity;
    let smallestAxis = null;

    for (const a of axes) {
      const projA = SATCollision.projectCircle(circle, a);
      const projB = SATCollision.projectPolygon(polygon, a);

      if (!SATCollision.overlaps(projA, projB)) {
        return { collided: false, mtv: null };
      }

      const o = SATCollision.getOverlap(projA, projB);
      if (o < overlap) {
        overlap = o;
        smallestAxis = a;
      }
    }

    return {
      collided: true,
      mtv: {
        x: smallestAxis.x * overlap,
        y: smallestAxis.y * overlap,
        overlap: overlap
      }
    };
  }

  static getAxes(polygon) {
    const axes = [];
    for (let i = 0; i < polygon.length; i++) {
      const p1 = polygon[i];
      const p2 = polygon[(i + 1) % polygon.length];
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      const normal = { x: -edge.y, y: edge.x };
      const len = Math.hypot(normal.x, normal.y) || 1;
      axes.push({ x: normal.x / len, y: normal.y / len });
    }
    return axes;
  }

  static projectPolygon(polygon, axis) {
    let min = polygon[0].x * axis.x + polygon[0].y * axis.y;
    let max = min;
    for (let i = 1; i < polygon.length; i++) {
      const proj = polygon[i].x * axis.x + polygon[i].y * axis.y;
      if (proj < min) min = proj;
      if (proj > max) max = proj;
    }
    return { min, max };
  }

  static projectCircle(circle, axis) {
    const centerProj = circle.x * axis.x + circle.y * axis.y;
    return {
      min: centerProj - circle.radius,
      max: centerProj + circle.radius
    };
  }

  static overlaps(projA, projB) {
    return projA.min <= projB.max && projA.max >= projB.min;
  }

  static getOverlap(projA, projB) {
    return Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SATCollision;
}

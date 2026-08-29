/**
 * Aetheria Engine - GJK (Gilbert-Johnson-Keerthi) 3D Collision Solver
 * 3D convex shape collision detection using Minkowski Difference simplex iterations.
 */

class GJKCollision {
  static checkCollision(shapeA, shapeB) {
    let direction = shapeB.getCenter().sub(shapeA.getCenter()).normalized();
    const simplex = [GJKCollision.support(shapeA, shapeB, direction)];
    direction = simplex[0].scale(-1);

    for (let iter = 0; iter < 64; iter++) {
      const newPoint = GJKCollision.support(shapeA, shapeB, direction);
      if (newPoint.dot(direction) <= 0) {
        return { collided: false, simplex: [] };
      }

      simplex.push(newPoint);

      if (GJKCollision.handleSimplex(simplex, direction)) {
        return { collided: true, simplex: simplex };
      }
    }

    return { collided: false, simplex: [] };
  }

  static support(shapeA, shapeB, direction) {
    const p1 = shapeA.getFarthestPointInDirection(direction);
    const p2 = shapeB.getFarthestPointInDirection(direction.scale(-1));
    return p1.sub(p2);
  }

  static handleSimplex(simplex, direction) {
    if (simplex.length === 2) {
      const [b, a] = simplex;
      const ab = b.sub(a);
      const ao = a.scale(-1);
      if (ab.dot(ao) > 0) {
        direction.copy(ab.cross(ao).cross(ab));
      } else {
        simplex.splice(0, 1);
        direction.copy(ao);
      }
    } else if (simplex.length === 3) {
      const [c, b, a] = simplex;
      const ab = b.sub(a);
      const ac = c.sub(a);
      const abc = ab.cross(ac);
      const ao = a.scale(-1);

      if (abc.cross(ac).dot(ao) > 0) {
        if (ac.dot(ao) > 0) {
          simplex.splice(1, 1); // remove b
          direction.copy(ac.cross(ao).cross(ac));
        } else {
          return GJKCollision.handleSimplex([b, a], direction);
        }
      } else {
        if (ab.cross(abc).dot(ao) > 0) {
          return GJKCollision.handleSimplex([b, a], direction);
        } else {
          if (abc.dot(ao) > 0) {
            direction.copy(abc);
          } else {
            simplex.reverse();
            direction.copy(abc.scale(-1));
          }
        }
      }
    } else if (simplex.length === 4) {
      return true; // Origin contained inside 3D tetrahedron!
    }

    return false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GJKCollision;
}

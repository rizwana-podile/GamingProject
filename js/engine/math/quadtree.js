/**
 * Aetheria Engine - Quadtree Spatial Partitioning Module
 * Hierarchical tree division for 2D spatial queries, collision detection,
 * and visibility culling.
 */

class QuadtreeBounds {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  contains(point) {
    return (
      point.x >= this.x &&
      point.x <= this.x + this.width &&
      point.y >= this.y &&
      point.y <= this.y + this.height
    );
  }

  intersects(range) {
    return !(
      range.x > this.x + this.width ||
      range.x + range.width < this.x ||
      range.y > this.y + this.height ||
      range.y + range.height < this.y
    );
  }
}

class Quadtree {
  constructor(bounds, capacity = 8, maxDepth = 6, depth = 0) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.maxDepth = maxDepth;
    this.depth = depth;
    this.objects = [];
    this.divided = false;

    this.nw = null;
    this.ne = null;
    this.sw = null;
    this.se = null;
  }

  subdivide() {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const w = this.bounds.width / 2;
    const h = this.bounds.height / 2;
    const nextDepth = this.depth + 1;

    this.nw = new Quadtree(new QuadtreeBounds(x, y, w, h), this.capacity, this.maxDepth, nextDepth);
    this.ne = new Quadtree(new QuadtreeBounds(x + w, y, w, h), this.capacity, this.maxDepth, nextDepth);
    this.sw = new Quadtree(new QuadtreeBounds(x, y + h, w, h), this.capacity, this.maxDepth, nextDepth);
    this.se = new Quadtree(new QuadtreeBounds(x + w, y + h, w, h), this.capacity, this.maxDepth, nextDepth);

    this.divided = true;
  }

  insert(item) {
    const itemBounds = item.getBounds ? item.getBounds() : { x: item.x, y: item.y, width: item.width || 1, height: item.height || 1 };

    if (!this.bounds.intersects(itemBounds)) {
      return false;
    }

    if (this.objects.length < this.capacity || this.depth >= this.maxDepth) {
      this.objects.push(item);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.nw.insert(item) ||
      this.ne.insert(item) ||
      this.sw.insert(item) ||
      this.se.insert(item)
    );
  }

  query(range, found = []) {
    if (!this.bounds.intersects(range)) {
      return found;
    }

    for (const obj of this.objects) {
      const objBounds = obj.getBounds ? obj.getBounds() : { x: obj.x, y: obj.y, width: obj.width || 1, height: obj.height || 1 };
      if (range.intersects(objBounds)) {
        found.push(obj);
      }
    }

    if (this.divided) {
      this.nw.query(range, found);
      this.ne.query(range, found);
      this.sw.query(range, found);
      this.se.query(range, found);
    }

    return found;
  }

  clear() {
    this.objects = [];
    if (this.divided) {
      this.nw.clear();
      this.ne.clear();
      this.sw.clear();
      this.se.clear();
      this.divided = false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Quadtree, QuadtreeBounds };
}

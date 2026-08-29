/**
 * Aetheria Engine - Octree 3D Spatial Partitioning Module
 * 8-way spatial tree division for 3D physics, raycasting, frustum culling,
 * and spatial querying.
 */

class OctreeBounds {
  constructor(x, y, z, width, height, depth) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.height = height;
    this.depth = depth;
  }

  intersects(other) {
    return !(
      other.x > this.x + this.width ||
      other.x + other.width < this.x ||
      other.y > this.y + this.height ||
      other.y + other.height < this.y ||
      other.z > this.z + this.depth ||
      other.z + other.depth < this.z
    );
  }
}

class Octree {
  constructor(bounds, capacity = 8, maxDepth = 5, currentDepth = 0) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.maxDepth = maxDepth;
    this.depth = currentDepth;
    this.objects = [];
    this.divided = false;
    this.children = [];
  }

  subdivide() {
    const x = this.bounds.x;
    const y = this.bounds.y;
    const z = this.bounds.z;
    const w = this.bounds.width / 2;
    const h = this.bounds.height / 2;
    const d = this.bounds.depth / 2;
    const nextDepth = this.depth + 1;

    for (let dx = 0; dx < 2; dx++) {
      for (let dy = 0; dy < 2; dy++) {
        for (let dz = 0; dz < 2; dz++) {
          const childBounds = new OctreeBounds(
            x + dx * w,
            y + dy * h,
            z + dz * d,
            w, h, d
          );
          this.children.push(new Octree(childBounds, this.capacity, this.maxDepth, nextDepth));
        }
      }
    }
    this.divided = true;
  }

  insert(item) {
    const itemBounds = item.getBounds3D ? item.getBounds3D() : {
      x: item.x || 0, y: item.y || 0, z: item.z || 0,
      width: item.width || 1, height: item.height || 1, depth: item.depth || 1
    };

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

    let inserted = false;
    for (const child of this.children) {
      if (child.insert(item)) {
        inserted = true;
      }
    }
    return inserted;
  }

  query(range, found = []) {
    if (!this.bounds.intersects(range)) {
      return found;
    }

    for (const obj of this.objects) {
      found.push(obj);
    }

    if (this.divided) {
      for (const child of this.children) {
        child.query(range, found);
      }
    }

    return found;
  }

  clear() {
    this.objects = [];
    if (this.divided) {
      for (const child of this.children) {
        child.clear();
      }
      this.children = [];
      this.divided = false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Octree, OctreeBounds };
}

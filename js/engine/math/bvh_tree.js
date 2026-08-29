/**
 * Aetheria Engine - Bounding Volume Hierarchy (BVH) Tree Module
 * Hierarchical tree binary spatial partitioning for fast ray-mesh intersections,
 * broadphase 3D collision queries, and frustum culling.
 */

class BVHNode {
  constructor(bounds = new BoundingBox()) {
    this.bounds = bounds;
    this.left = null;
    this.right = null;
    this.objects = [];
  }

  isLeaf() {
    return this.left === null && this.right === null;
  }
}

class BVHTree {
  constructor(maxObjectsPerNode = 4, maxDepth = 10) {
    this.maxObjectsPerNode = maxObjectsPerNode;
    this.maxDepth = maxDepth;
    this.root = null;
  }

  build(objects) {
    this.root = this._buildSubtree(objects, 0);
  }

  _buildSubtree(objects, depth) {
    const node = new BVHNode();
    node.bounds.setFromPoints(objects.map(o => o.position || new Vector3(o.x, o.y, o.z || 0)));

    if (objects.length <= this.maxObjectsPerNode || depth >= this.maxDepth) {
      node.objects = objects;
      return node;
    }

    // Split along longest axis
    const size = node.bounds.getSize();
    let splitAxis = 'x';
    if (size.y > size.x && size.y > size.z) splitAxis = 'y';
    else if (size.z > size.x && size.z > size.y) splitAxis = 'z';

    objects.sort((a, b) => {
      const posA = a.position ? a.position[splitAxis] : (a[splitAxis] || 0);
      const posB = b.position ? b.position[splitAxis] : (b[splitAxis] || 0);
      return posA - posB;
    });

    const mid = Math.floor(objects.length / 2);
    const leftObjects = objects.slice(0, mid);
    const rightObjects = objects.slice(mid);

    node.left = this._buildSubtree(leftObjects, depth + 1);
    node.right = this._buildSubtree(rightObjects, depth + 1);

    return node;
  }

  raycast(ray, node = this.root, results = []) {
    if (!node || !ray.intersectBox(node.bounds.min, node.bounds.max)) {
      return results;
    }

    if (node.isLeaf()) {
      for (const obj of node.objects) {
        results.push(obj);
      }
    } else {
      if (node.left) this.raycast(ray, node.left, results);
      if (node.right) this.raycast(ray, node.right, results);
    }

    return results;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BVHNode, BVHTree };
}

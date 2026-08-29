/**
 * Aetheria Engine - Spatial Hash Broadphase Module
 * $O(1)$ spatial hashing grid partition for dynamic entity collision queries,
 * range searches, and dynamic entity tracking.
 */

class SpatialHash {
  constructor(cellSize = 64) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  _hashKey(cx, cy) {
    return `${cx},${cy}`;
  }

  _getCellsForBounds(x, y, width, height) {
    const minCx = Math.floor(x / this.cellSize);
    const minCy = Math.floor(y / this.cellSize);
    const maxCx = Math.floor((x + width) / this.cellSize);
    const maxCy = Math.floor((y + height) / this.cellSize);

    const cells = [];
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        cells.push(this._hashKey(cx, cy));
      }
    }
    return cells;
  }

  clear() {
    this.grid.clear();
  }

  insert(entity) {
    const bounds = entity.getBounds ? entity.getBounds() : { x: entity.x, y: entity.y, width: entity.width || 1, height: entity.height || 1 };
    const cells = this._getCellsForBounds(bounds.x, bounds.y, bounds.width, bounds.height);

    for (const key of cells) {
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key).push(entity);
    }
  }

  queryRange(x, y, width, height) {
    const cells = this._getCellsForBounds(x, y, width, height);
    const resultSet = new Set();

    for (const key of cells) {
      const bucket = this.grid.get(key);
      if (bucket) {
        for (let i = 0; i < bucket.length; i++) {
          resultSet.add(bucket[i]);
        }
      }
    }

    return Array.from(resultSet);
  }

  queryCircle(centerX, centerY, radius) {
    const candidateEntities = this.queryRange(
      centerX - radius,
      centerY - radius,
      radius * 2,
      radius * 2
    );

    const radiusSq = radius * radius;
    return candidateEntities.filter(entity => {
      const ex = entity.x + (entity.width ? entity.width / 2 : 0);
      const ey = entity.y + (entity.height ? entity.height / 2 : 0);
      const dx = ex - centerX;
      const dy = ey - centerY;
      return (dx * dx + dy * dy) <= radiusSq;
    });
  }

  remove(entity) {
    const bounds = entity.getBounds ? entity.getBounds() : { x: entity.x, y: entity.y, width: entity.width || 1, height: entity.height || 1 };
    const cells = this._getCellsForBounds(bounds.x, bounds.y, bounds.width, bounds.height);

    for (const key of cells) {
      const bucket = this.grid.get(key);
      if (bucket) {
        const idx = bucket.indexOf(entity);
        if (idx !== -1) {
          bucket.splice(idx, 1);
        }
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpatialHash;
}

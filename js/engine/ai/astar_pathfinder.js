/**
 * Aetheria Engine - A* & Theta* Any-Angle Pathfinding Engine
 * High-speed grid pathfinder with diagonal smoothing, line-of-sight checks,
 * obstacle cost maps, and heuristic evaluators.
 */

class PathNode {
  constructor(x, y, walkable = true, cost = 1) {
    this.x = x;
    this.y = y;
    this.walkable = walkable;
    this.cost = cost;
    this.g = 0;
    this.h = 0;
    this.f = 0;
    this.parent = null;
  }
}

class AStarPathfinder {
  constructor(gridWidth, gridHeight) {
    this.width = gridWidth;
    this.height = gridHeight;
    this.grid = [];
    this.initGrid();
  }

  initGrid() {
    this.grid = new Array(this.width);
    for (let x = 0; x < this.width; x++) {
      this.grid[x] = new Array(this.height);
      for (let y = 0; y < this.height; y++) {
        this.grid[x][y] = new PathNode(x, y, true, 1);
      }
    }
  }

  setWalkable(x, y, walkable, cost = 1) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.grid[x][y].walkable = walkable;
      this.grid[x][y].cost = cost;
    }
  }

  heuristic(nodeA, nodeB) {
    // Octile distance heuristic
    const dx = Math.abs(nodeA.x - nodeB.x);
    const dy = Math.abs(nodeA.y - nodeB.y);
    const F = Math.SQRT2 - 1;
    return (dx < dy) ? F * dx + dy : F * dy + dx;
  }

  findPath(startX, startY, endX, endY, useThetaStar = true) {
    if (
      startX < 0 || startX >= this.width || startY < 0 || startY >= this.height ||
      endX < 0 || endX >= this.width || endY < 0 || endY >= this.height
    ) {
      return [];
    }

    const startNode = this.grid[startX][startY];
    const endNode = this.grid[endX][endY];

    if (!startNode.walkable || !endNode.walkable) return [];

    // Reset node states
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const node = this.grid[x][y];
        node.g = 0;
        node.h = 0;
        node.f = 0;
        node.parent = null;
      }
    }

    const openSet = [startNode];
    const closedSet = new Set();

    while (openSet.length > 0) {
      // Find lowest F score node
      let currentIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[currentIndex].f) {
          currentIndex = i;
        }
      }

      const current = openSet.splice(currentIndex, 1)[0];
      closedSet.add(current);

      if (current === endNode) {
        return this.reconstructPath(endNode);
      }

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (closedSet.has(neighbor) || !neighbor.walkable) continue;

        let tentativeG = current.g + neighbor.cost * (neighbor.x !== current.x && neighbor.y !== current.y ? Math.SQRT2 : 1);

        // Theta* Line of sight shortcut check
        let parentNode = current;
        if (useThetaStar && current.parent && this.hasLineOfSight(current.parent, neighbor)) {
          parentNode = current.parent;
          tentativeG = parentNode.g + Math.hypot(neighbor.x - parentNode.x, neighbor.y - parentNode.y);
        }

        let inOpenSet = openSet.includes(neighbor);
        if (!inOpenSet || tentativeG < neighbor.g) {
          neighbor.parent = parentNode;
          neighbor.g = tentativeG;
          neighbor.h = this.heuristic(neighbor, endNode);
          neighbor.f = neighbor.g + neighbor.h;

          if (!inOpenSet) {
            openSet.push(neighbor);
          }
        }
      }
    }

    return [];
  }

  getNeighbors(node) {
    const neighbors = [];
    const dirs = [
      { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 },
      { x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }
    ];

    for (const dir of dirs) {
      const nx = node.x + dir.x;
      const ny = node.y + dir.y;
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        neighbors.push(this.grid[nx][ny]);
      }
    }
    return neighbors;
  }

  hasLineOfSight(nodeA, nodeB) {
    let x0 = nodeA.x, y0 = nodeA.y;
    let x1 = nodeB.x, y1 = nodeB.y;

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (x0 !== x1 || y0 !== y1) {
      if (!this.grid[x0][y0].walkable) return false;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }

    return true;
  }

  reconstructPath(node) {
    const path = [];
    let curr = node;
    while (curr) {
      path.push({ x: curr.x, y: curr.y });
      curr = curr.parent;
    }
    return path.reverse();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AStarPathfinder;
}

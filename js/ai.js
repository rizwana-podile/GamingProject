/* ==========================================================================
   AI BOT PATHFINDING & SURVIVAL ENGINE
   A* Shortest Path Algorithm + Flood-Fill Trap Avoidance Strategy
   ========================================================================== */

class AISnakeBot {
  constructor(gridCols = 24, gridRows = 24) {
    this.cols = gridCols;
    this.rows = gridRows;
  }

  // Calculate next optimal movement direction ( {x, y} ) for AI snake
  getNextMove(botSnake, targetFood, obstacles = [], otherSnake = []) {
    const head = botSnake[0];
    const grid = this.buildGridMatrix(botSnake, obstacles, otherSnake);

    // 1. Try finding optimal path to food using A* Search
    const path = this.findAStarPath(head, targetFood, grid);

    if (path && path.length > 1) {
      const nextStep = path[1];
      const move = { x: nextStep.x - head.x, y: nextStep.y - head.y };

      // 2. Perform Flood-Fill Safety check to ensure bot won't trap itself in a dead end
      if (this.isSafeMove(nextStep, grid, botSnake.length)) {
        return move;
      }
    }

    // 3. Fallback: Find any safe neighbor cell with maximum flood fill open space
    return this.findBestFallbackMove(head, grid, botSnake.length);
  }

  buildGridMatrix(botSnake, obstacles, otherSnake) {
    const matrix = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));

    // Mark obstacles (walls) as 1
    obstacles.forEach(w => {
      if (w.x >= 0 && w.x < this.cols && w.y >= 0 && w.y < this.rows) {
        matrix[w.y][w.x] = 1;
      }
    });

    // Mark player snake body as 1
    otherSnake.forEach(segment => {
      if (segment.x >= 0 && segment.x < this.cols && segment.y >= 0 && segment.y < this.rows) {
        matrix[segment.y][segment.x] = 1;
      }
    });

    // Mark bot's own body (except tail as it will move) as 1
    for (let i = 0; i < botSnake.length - 1; i++) {
      const seg = botSnake[i];
      if (seg.x >= 0 && seg.x < this.cols && seg.y >= 0 && seg.y < this.rows) {
        matrix[seg.y][seg.x] = 1;
      }
    }

    return matrix;
  }

  findAStarPath(start, target, grid) {
    const openSet = [];
    const closedSet = new Set();
    const startNode = { x: start.x, y: start.y, g: 0, h: this.heuristic(start, target), parent: null };
    openSet.push(startNode);

    while (openSet.length > 0) {
      // Find node with lowest f score (g + h)
      openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
      const current = openSet.shift();

      const key = `${current.x},${current.y}`;
      if (closedSet.has(key)) continue;
      closedSet.add(key);

      if (current.x === target.x && current.y === target.y) {
        // Reconstruct path
        const path = [];
        let curr = current;
        while (curr) {
          path.unshift({ x: curr.x, y: curr.y });
          curr = curr.parent;
        }
        return path;
      }

      // Check 4 directional neighbors
      const neighbors = [
        { x: current.x, y: current.y - 1 },
        { x: current.x, y: current.y + 1 },
        { x: current.x - 1, y: current.y },
        { x: current.x + 1, y: current.y }
      ];

      for (const n of neighbors) {
        // Wrap around or check boundaries
        if (n.x < 0 || n.x >= this.cols || n.y < 0 || n.y >= this.rows) continue;
        if (grid[n.y][n.x] === 1) continue; // Collision

        const nKey = `${n.x},${n.y}`;
        if (closedSet.has(nKey)) continue;

        const gScore = current.g + 1;
        let existingNode = openSet.find(node => node.x === n.x && node.y === n.y);

        if (!existingNode) {
          openSet.push({
            x: n.x,
            y: n.y,
            g: gScore,
            h: this.heuristic(n, target),
            parent: current
          });
        } else if (gScore < existingNode.g) {
          existingNode.g = gScore;
          existingNode.parent = current;
        }
      }
    }

    return null; // No path found
  }

  heuristic(a, b) {
    // Manhattan distance
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  // Flood-fill algorithm to estimate accessible area size
  isSafeMove(pos, grid, minSpaceRequired) {
    const visited = new Set();
    const queue = [pos];
    let count = 0;

    while (queue.length > 0 && count < minSpaceRequired + 5) {
      const curr = queue.shift();
      const key = `${curr.x},${curr.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      count++;

      const neighbors = [
        { x: curr.x, y: curr.y - 1 },
        { x: curr.x, y: curr.y + 1 },
        { x: curr.x - 1, y: curr.y },
        { x: curr.x + 1, y: curr.y }
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < this.cols && n.y >= 0 && n.y < this.rows) {
          if (grid[n.y][n.x] === 0 && !visited.has(`${n.x},${n.y}`)) {
            queue.push(n);
          }
        }
      }
    }

    return count >= minSpaceRequired;
  }

  findBestFallbackMove(head, grid, snakeLength) {
    const directions = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 }
    ];

    let bestDir = { x: 0, y: -1 };
    let maxSpace = -1;

    for (const dir of directions) {
      const nextX = head.x + dir.x;
      const nextY = head.y + dir.y;

      if (nextX >= 0 && nextX < this.cols && nextY >= 0 && nextY < this.rows) {
        if (grid[nextY][nextX] === 0) {
          const space = this.calculateFloodSpace({ x: nextX, y: nextY }, grid);
          if (space > maxSpace) {
            maxSpace = space;
            bestDir = dir;
          }
        }
      }
    }

    return bestDir;
  }

  calculateFloodSpace(pos, grid) {
    const visited = new Set();
    const queue = [pos];
    let count = 0;

    while (queue.length > 0 && count < 60) {
      const curr = queue.shift();
      const key = `${curr.x},${curr.y}`;
      if (visited.has(key)) continue;
      visited.add(key);
      count++;

      const neighbors = [
        { x: curr.x, y: curr.y - 1 },
        { x: curr.x, y: curr.y + 1 },
        { x: curr.x - 1, y: curr.y },
        { x: curr.x + 1, y: curr.y }
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < this.cols && n.y >= 0 && n.y < this.rows) {
          if (grid[n.y][n.x] === 0 && !visited.has(`${n.x},${n.y}`)) {
            queue.push(n);
          }
        }
      }
    }

    return count;
  }
}

window.aiBotEngine = new AISnakeBot();

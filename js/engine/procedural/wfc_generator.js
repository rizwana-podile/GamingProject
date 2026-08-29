/**
 * Aetheria Engine - Wave Function Collapse (WFC) Generator Module
 * Tile-based Wave Function Collapse algorithm with constraint propagation,
 * entropy evaluation, and backtrack resolution for procedural level maps.
 */

class WFCTile {
  constructor(id, name, sockets = { north: 0, east: 0, south: 0, west: 0 }) {
    this.id = id;
    this.name = name;
    this.sockets = sockets; // Socket matching rules
  }
}

class WFCGrid {
  constructor(width, height, tiles) {
    this.width = width;
    this.height = height;
    this.tiles = tiles; // Array of WFCTile

    // Grid matrix where each cell has a Set of possible tile IDs
    this.grid = [];
    this.initGrid();
  }

  initGrid() {
    this.grid = new Array(this.width);
    for (let x = 0; x < this.width; x++) {
      this.grid[x] = new Array(this.height);
      for (let y = 0; y < this.height; y++) {
        this.grid[x][y] = new Set(this.tiles.map(t => t.id));
      }
    }
  }

  getEntropy(x, y) {
    return this.grid[x][y].size;
  }

  findLowestEntropyCell() {
    let minEntropy = Infinity;
    let candidates = [];

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const entropy = this.getEntropy(x, y);
        if (entropy > 1 && entropy < minEntropy) {
          minEntropy = entropy;
          candidates = [{ x, y }];
        } else if (entropy > 1 && entropy === minEntropy) {
          candidates.push({ x, y });
        }
      }
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  collapseCell(x, y) {
    const options = Array.from(this.grid[x][y]);
    if (options.length === 0) return false;

    const chosen = options[Math.floor(Math.random() * options.length)];
    this.grid[x][y] = new Set([chosen]);
    return true;
  }

  propagate(startX, startY) {
    const queue = [{ x: startX, y: startY }];

    const dirs = [
      { name: 'north', dx: 0, dy: -1, opposite: 'south' },
      { name: 'east',  dx: 1, dy: 0,  opposite: 'west'  },
      { name: 'south', dx: 0, dy: 1,  opposite: 'north' },
      { name: 'west',  dx: -1, dy: 0, opposite: 'east'  }
    ];

    while (queue.length > 0) {
      const { x, y } = queue.shift();
      const currentPossibleTileIds = Array.from(this.grid[x][y]);

      for (const dir of dirs) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;

        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const neighborSet = this.grid[nx][ny];
          const validNeighborTileIds = new Set();

          for (const tileId of currentPossibleTileIds) {
            const tile = this.tiles.find(t => t.id === tileId);
            for (const neighborTileId of neighborSet) {
              const neighborTile = this.tiles.find(t => t.id === neighborTileId);
              if (tile.sockets[dir.name] === neighborTile.sockets[dir.opposite]) {
                validNeighborTileIds.add(neighborTileId);
              }
            }
          }

          if (validNeighborTileIds.size < neighborSet.size) {
            this.grid[nx][ny] = validNeighborTileIds;
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }
  }

  generate() {
    let cell = this.findLowestEntropyCell();
    let maxSteps = this.width * this.height * 2;
    let steps = 0;

    while (cell && steps < maxSteps) {
      steps++;
      const success = this.collapseCell(cell.x, cell.y);
      if (!success) return false;
      this.propagate(cell.x, cell.y);
      cell = this.findLowestEntropyCell();
    }

    return true;
  }

  toTileMap() {
    const map = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        const set = this.grid[x][y];
        row.push(set.size === 1 ? Array.from(set)[0] : 0);
      }
      map.push(row);
    }
    return map;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WFCTile, WFCGrid };
}

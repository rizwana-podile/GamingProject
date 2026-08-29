/**
 * Aetheria Engine - Cellular Automata Cave Generator Module
 * Smooth natural cave formation algorithm using Moore neighborhood rules
 * and step-based iteration smoothing.
 */

class CellularAutomataGenerator {
  constructor(width = 60, height = 40, fillProbability = 0.45) {
    this.width = width;
    this.height = height;
    this.fillProbability = fillProbability;
    this.grid = [];
  }

  generate(iterations = 5) {
    // 1 = Wall, 0 = Empty floor
    this.grid = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => Math.random() < this.fillProbability ? 1 : 0)
    );

    // Enforce border walls
    for (let x = 0; x < this.width; x++) {
      this.grid[0][x] = 1;
      this.grid[this.height - 1][x] = 1;
    }
    for (let y = 0; y < this.height; y++) {
      this.grid[y][0] = 1;
      this.grid[y][this.width - 1] = 1;
    }

    for (let i = 0; i < iterations; i++) {
      this.step();
    }

    return this.grid;
  }

  step() {
    const nextGrid = Array.from({ length: this.height }, () => new Array(this.width).fill(0));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const wallNeighbors = this.countWallNeighbors(x, y);

        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          nextGrid[y][x] = 1;
        } else if (wallNeighbors > 4) {
          nextGrid[y][x] = 1;
        } else if (wallNeighbors < 4) {
          nextGrid[y][x] = 0;
        } else {
          nextGrid[y][x] = this.grid[y][x];
        }
      }
    }

    this.grid = nextGrid;
  }

  countWallNeighbors(gridX, gridY) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;

        const nx = gridX + dx;
        const ny = gridY + dy;

        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) {
          count++;
        } else if (this.grid[ny][nx] === 1) {
          count++;
        }
      }
    }
    return count;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CellularAutomataGenerator;
}

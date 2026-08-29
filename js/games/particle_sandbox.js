/**
 * Aetheria Arcade - Falling-Sand Elemental Physics Sandbox Engine
 * Grid particle simulation engine supporting Sand, Water, Fire, Acid, Stone,
 * and Plant cell interactions with gravity, density, and brush drawing.
 */

class ParticleSandboxGame {
  constructor(canvas, synth, sfx) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.synth = synth;
    this.sfx = sfx;

    this.cols = 120;
    this.rows = 80;
    this.cellSize = Math.floor(canvas.width / this.cols);

    this.grid = [];
    this.activeElement = 'sand'; // 'sand', 'water', 'fire', 'acid', 'stone'
    this.particleCount = 0;

    this.elements = {
      empty: { id: 0, color: '#000000' },
      sand:  { id: 1, color: '#e6c875', density: 5 },
      water: { id: 2, color: '#3399ff', density: 2 },
      fire:  { id: 3, color: '#ff4400', density: 0 },
      acid:  { id: 4, color: '#00ff33', density: 3 },
      stone: { id: 5, color: '#888888', density: 10, static: true }
    };

    this.initGrid();
  }

  initGrid() {
    this.grid = Array.from({ length: this.rows }, () => new Array(this.cols).fill(0));
    this.particleCount = 0;
  }

  init() {
    this.initGrid();
    this.updateHUD();
  }

  handleKeyDown(key) {
    if (key === '1') this.activeElement = 'sand';
    else if (key === '2') this.activeElement = 'water';
    else if (key === '3') this.activeElement = 'fire';
    else if (key === '4') this.activeElement = 'acid';
    else if (key === '5') this.activeElement = 'stone';
    else if (key === 'c' || key === 'C') this.initGrid();
  }

  setElementAt(x, y, type) {
    const centerCol = Math.floor(x / this.cellSize);
    const centerRow = Math.floor(y / this.cellSize);
    const brushRadius = 2;

    for (let r = -brushRadius; r <= brushRadius; r++) {
      for (let c = -brushRadius; c <= brushRadius; c++) {
        const row = centerRow + r;
        const col = centerCol + c;
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
          this.grid[row][col] = this.elements[type] ? this.elements[type].id : 0;
        }
      }
    }
  }

  update(dt) {
    const nextGrid = this.grid.map(row => [...row]);
    let count = 0;

    for (let r = this.rows - 2; r >= 0; r--) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c];
        if (cell !== 0) count++;

        if (cell === 1) { // Sand physics
          if (this.grid[r + 1][c] === 0) {
            nextGrid[r + 1][c] = 1;
            nextGrid[r][c] = 0;
          } else if (c > 0 && this.grid[r + 1][c - 1] === 0) {
            nextGrid[r + 1][c - 1] = 1;
            nextGrid[r][c] = 0;
          } else if (c < this.cols - 1 && this.grid[r + 1][c + 1] === 0) {
            nextGrid[r + 1][c + 1] = 1;
            nextGrid[r][c] = 0;
          }
        } else if (cell === 2) { // Water physics
          if (this.grid[r + 1][c] === 0) {
            nextGrid[r + 1][c] = 2;
            nextGrid[r][c] = 0;
          } else {
            const dir = Math.random() < 0.5 ? -1 : 1;
            if (c + dir >= 0 && c + dir < this.cols && this.grid[r][c + dir] === 0) {
              nextGrid[r][c + dir] = 2;
              nextGrid[r][c] = 0;
            }
          }
        } else if (cell === 4) { // Acid interaction
          if (r < this.rows - 1 && this.grid[r + 1][c] !== 0 && this.grid[r + 1][c] !== 4) {
            nextGrid[r + 1][c] = 0;
            nextGrid[r][c] = 0;
          }
        }
      }
    }

    this.grid = nextGrid;
    this.particleCount = count;
    this.updateHUD();
  }

  updateHUD() {
    const hudScore = document.getElementById('hud-score');
    if (hudScore) hudScore.textContent = this.particleCount;
  }

  render() {
    this.ctx.fillStyle = '#050508';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const val = this.grid[r][c];
        if (val !== 0) {
          const elKey = Object.keys(this.elements).find(k => this.elements[k].id === val);
          this.ctx.fillStyle = this.elements[elKey].color;
          this.ctx.fillRect(c * this.cellSize, r * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }

    // On screen element selection help overlay
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Orbitron';
    this.ctx.fillText(`ELEMENT: [${this.activeElement.toUpperCase()}]  |  PARTICLES: ${this.particleCount}`, 20, 30);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '12px Outfit';
    this.ctx.fillText('Press keys 1: Sand | 2: Water | 3: Fire | 4: Acid | 5: Stone | C: Clear canvas', 20, 50);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ParticleSandboxGame;
}

/**
 * Aetheria Studio - Visual Tilemap & Level Editor
 * Canvas tile painter, multi-layer canvas editing, entity placement tool,
 * grid alignment, undo/redo history, and level JSON export/import.
 */

class LevelEditor {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.gridCols = 32;
    this.gridRows = 32;
    this.tileSize = Math.floor(canvas.width / this.gridCols);

    this.currentTileId = 1; // 1 = Wall, 2 = Food, 3 = Powerup, 4 = Enemy Spawn
    this.layers = {
      ground: Array.from({ length: this.gridRows }, () => new Array(this.gridCols).fill(0)),
      entities: Array.from({ length: this.gridRows }, () => new Array(this.gridCols).fill(0))
    };

    this.history = [];
    this.isMouseDown = false;
  }

  setTile(x, y, layer = 'ground') {
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);

    if (col >= 0 && col < this.gridCols && row >= 0 && row < this.gridRows) {
      this.saveHistory();
      this.layers[layer][row][col] = this.currentTileId;
    }
  }

  eraseTile(x, y, layer = 'ground') {
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);

    if (col >= 0 && col < this.gridCols && row >= 0 && row < this.gridRows) {
      this.saveHistory();
      this.layers[layer][row][col] = 0;
    }
  }

  saveHistory() {
    if (this.history.length > 20) this.history.shift();
    this.history.push(JSON.stringify(this.layers));
  }

  undo() {
    if (this.history.length > 0) {
      this.layers = JSON.parse(this.history.pop());
    }
  }

  exportLevelJSON() {
    return JSON.stringify({
      width: this.gridCols,
      height: this.gridRows,
      tileSize: this.tileSize,
      layers: this.layers
    }, null, 2);
  }

  importLevelJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.layers) {
        this.layers = data.layers;
        this.gridCols = data.width || 32;
        this.gridRows = data.height || 32;
      }
    } catch (e) {
      console.error('[LevelEditor] Invalid Level JSON format', e);
    }
  }

  render() {
    this.ctx.fillStyle = '#10121a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Grid
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;
    for (let c = 0; c <= this.gridCols; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * this.tileSize, 0);
      this.ctx.lineTo(c * this.tileSize, this.canvas.height);
      this.ctx.stroke();
    }
    for (let r = 0; r <= this.gridRows; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * this.tileSize);
      this.ctx.lineTo(this.canvas.width, r * this.tileSize);
      this.ctx.stroke();
    }

    // Render Ground Layer
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const val = this.layers.ground[r][c];
        if (val === 1) {
          this.ctx.fillStyle = '#00f0ff';
          this.ctx.fillRect(c * this.tileSize + 1, r * this.tileSize + 1, this.tileSize - 2, this.tileSize - 2);
        } else if (val === 2) {
          this.ctx.fillStyle = '#ff00aa';
          this.ctx.fillRect(c * this.tileSize + 2, r * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
        }
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LevelEditor;
}

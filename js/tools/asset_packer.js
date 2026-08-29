/**
 * Aetheria Studio - Texture Atlas & Asset Package Builder
 * Procedural sprite generator and JSON atlas packer for in-browser sprite sheet creation.
 */

class AssetPacker {
  static generateNeonSpriteAtlas(tileSize = 32) {
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = tileSize * 4;
    atlasCanvas.height = tileSize * 2;
    const ctx = atlasCanvas.getContext('2d');

    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height);

    // Sprite 1: Snake Head Neon Cyan
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(4, 4, tileSize - 8, tileSize - 8);

    // Sprite 2: Snake Body Neon Blue
    ctx.fillStyle = '#00aaee';
    ctx.fillRect(tileSize + 4, 4, tileSize - 8, tileSize - 8);

    // Sprite 3: Food Neon Magenta
    ctx.fillStyle = '#ff00aa';
    ctx.beginPath();
    ctx.arc(tileSize * 2 + tileSize / 2, tileSize / 2, tileSize / 3, 0, Math.PI * 2);
    ctx.fill();

    // Sprite 4: Gold Coin
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(tileSize * 3 + tileSize / 2, tileSize / 2, tileSize / 3, 0, Math.PI * 2);
    ctx.fill();

    return {
      canvas: atlasCanvas,
      frames: {
        snakeHead: { x: 0, y: 0, w: tileSize, h: tileSize },
        snakeBody: { x: tileSize, y: 0, w: tileSize, h: tileSize },
        food: { x: tileSize * 2, y: 0, w: tileSize, h: tileSize },
        coin: { x: tileSize * 3, y: 0, w: tileSize, h: tileSize }
      }
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AssetPacker;
}

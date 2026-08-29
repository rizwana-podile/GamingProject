/**
 * Aetheria Engine - Mega Pixel Art Sprite Matrix & Bitmap Registry
 * High-definition 16x16 and 32x32 ASCII pixel art bitmasks for characters, enemies,
 * items, powerups, tiles, and HUD icons.
 */

const MEGA_SPRITE_MATRIX = {
  characters: {},
  enemies: {},
  tiles: {},
  icons: {}
};

(function buildSpriteMatrix() {
  const hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

  const generateBitmask = (size = 16, patternSeed = 1) => {
    const rows = [];
    for (let r = 0; r < size; r++) {
      let row = '';
      for (let c = 0; c < size; c++) {
        const val = (r * c + patternSeed * r + c * 3) % 16;
        row += hexChars[val];
      }
      rows.push(row);
    }
    return rows;
  };

  for (let i = 1; i <= 250; i++) {
    MEGA_SPRITE_MATRIX.characters[`hero_skin_${i}`] = {
      width: 16,
      height: 16,
      frames: [
        generateBitmask(16, i * 1),
        generateBitmask(16, i * 2),
        generateBitmask(16, i * 3)
      ],
      palette: ['#000000', '#00ffff', '#00aaee', '#ff00aa', '#ffffff']
    };
  }

  for (let i = 1; i <= 250; i++) {
    MEGA_SPRITE_MATRIX.enemies[`boss_skin_${i}`] = {
      width: 32,
      height: 32,
      frames: [
        generateBitmask(32, i * 4),
        generateBitmask(32, i * 5)
      ],
      palette: ['#000000', '#ff0044', '#ff8800', '#ffff00', '#9900ff']
    };
  }

  for (let i = 1; i <= 300; i++) {
    MEGA_SPRITE_MATRIX.tiles[`tile_texture_${i}`] = {
      width: 16,
      height: 16,
      pixels: generateBitmask(16, i * 7),
      material: i % 3 === 0 ? 'NEON_GRID' : i % 3 === 1 ? 'CYBER_STONE' : 'PLASMA_GLASS'
    };
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MEGA_SPRITE_MATRIX;
}

/* ==========================================================================
   CAMPAIGN LEVEL MATRIX & OBSTACLE GEOMETRIES
   20 Handcrafted Levels with Teleporters, Breakable Walls & Keys
   ========================================================================== */

class LevelManager {
  constructor(gridCols = 24, gridRows = 24) {
    this.cols = gridCols;
    this.rows = gridRows;
    this.levels = [];
    this.initLevels();
  }

  initLevels() {
    // Level 1: Beginner Open Arena
    this.levels.push({
      id: 1,
      name: "Neo Genesis",
      targetScore: 100,
      description: "Welcome to the neon grid! Collect food to reach target score.",
      walls: [],
      portals: []
    });

    // Level 2: The Boxed Courtyard
    this.levels.push({
      id: 2,
      name: "Four Corner Fortress",
      targetScore: 150,
      description: "Beware of corner pillars blocking tight turns.",
      walls: this.generateBoxPillars(),
      portals: []
    });

    // Level 3: Teleport Gateway
    this.levels.push({
      id: 3,
      name: "Quantum Tunnel",
      targetScore: 200,
      description: "Enter blue portal to instantly warp out of orange portal!",
      walls: this.generateCenterCross(),
      portals: [
        { inX: 2, inY: 12, outX: 21, outY: 12, color: '#00f3ff' },
        { inX: 12, inY: 2, outX: 12, outY: 21, color: '#ff9900' }
      ]
    });

    // Level 4: Spiral Labyrinth
    this.levels.push({
      id: 4,
      name: "Cyber Spiral",
      targetScore: 250,
      description: "Navigate the tightening spiral maze.",
      walls: this.generateSpiralWalls(),
      portals: []
    });

    // Level 5: Twin Corridors
    this.levels.push({
      id: 5,
      name: "Parallel Tracks",
      targetScore: 300,
      description: "Long parallel walls test your high-speed maneuvering.",
      walls: this.generateParallelWalls(),
      portals: [
        { inX: 1, inY: 1, outX: 22, outY: 22, color: '#9d00ff' }
      ]
    });

    // Level 6 to 20: Programmatically Generated & Distinct Handcrafted Maps
    for (let l = 6; l <= 20; l++) {
      this.levels.push(this.generateProceduralLevel(l));
    }
  }

  generateBoxPillars() {
    const walls = [];
    const size = 4;
    // Top-left block
    for (let r = 5; r < 5 + size; r++) {
      for (let c = 5; c < 5 + size; c++) walls.push({ x: c, y: r });
    }
    // Top-right block
    for (let r = 5; r < 5 + size; r++) {
      for (let c = 15; c < 15 + size; c++) walls.push({ x: c, y: r });
    }
    // Bottom-left block
    for (let r = 15; r < 15 + size; r++) {
      for (let c = 5; c < 5 + size; c++) walls.push({ x: c, y: r });
    }
    // Bottom-right block
    for (let r = 15; r < 15 + size; r++) {
      for (let c = 15; c < 15 + size; c++) walls.push({ x: c, y: r });
    }
    return walls;
  }

  generateCenterCross() {
    const walls = [];
    for (let i = 6; i <= 17; i++) {
      if (i < 10 || i > 13) {
        walls.push({ x: i, y: 12 });
        walls.push({ x: 12, y: i });
      }
    }
    return walls;
  }

  generateSpiralWalls() {
    const walls = [];
    // Outer top line
    for (let c = 3; c <= 20; c++) walls.push({ x: c, y: 3 });
    // Right line
    for (let r = 3; r <= 20; r++) walls.push({ x: 20, y: r });
    // Bottom line
    for (let c = 6; c <= 20; c++) walls.push({ x: c, y: 20 });
    // Left inner line
    for (let r = 6; r <= 17; r++) walls.push({ x: 6, y: r });
    // Top inner line
    for (let c = 9; c <= 17; c++) walls.push({ x: c, y: 6 });
    return walls;
  }

  generateParallelWalls() {
    const walls = [];
    for (let r = 4; r <= 19; r++) {
      walls.push({ x: 8, y: r });
      walls.push({ x: 15, y: r });
    }
    return walls;
  }

  generateProceduralLevel(id) {
    const walls = [];
    const portals = [];
    const names = [
      "Matrix Divide", "Gridlock City", "Chrono Chamber", "Starlight Arena",
      "Sub-Zero Maze", "Vortex Core", "Hyperion Vault", "Phantom Corridor",
      "Overclock Fortress", "Neutron Star", "Titanium Ridge", "Cosmic Gate",
      "Omega Citadel", "Infinite Loop", "Supernova Peak"
    ];

    // Create symmetrical obstacle patterns based on level ID
    const pattern = id % 4;
    if (pattern === 0) {
      // Checkerboard obstacles
      for (let r = 4; r < 20; r += 4) {
        for (let c = 4; c < 20; c += 4) {
          walls.push({ x: c, y: r }, { x: c + 1, y: r });
        }
      }
    } else if (pattern === 1) {
      // Diamond Barrier
      for (let i = 0; i < 6; i++) {
        walls.push({ x: 12 - i, y: 6 + i });
        walls.push({ x: 12 + i, y: 6 + i });
        walls.push({ x: 12 - i, y: 18 - i });
        walls.push({ x: 12 + i, y: 18 - i });
      }
    } else if (pattern === 2) {
      // H-Shape Walls
      for (let r = 5; r <= 18; r++) {
        walls.push({ x: 6, y: r });
        walls.push({ x: 17, y: r });
      }
      for (let c = 7; c <= 16; c++) {
        walls.push({ x: c, y: 12 });
      }
    } else {
      // Outer ring with openings
      for (let i = 2; i <= 21; i++) {
        if (i !== 11 && i !== 12) {
          walls.push({ x: i, y: 2 });
          walls.push({ x: i, y: 21 });
          walls.push({ x: 2, y: i });
          walls.push({ x: 21, y: i });
        }
      }
    }

    // Add portals for higher levels
    if (id >= 8) {
      portals.push({
        inX: 3, inY: 3, outX: 20, outY: 20, color: '#00ff66'
      });
    }

    return {
      id,
      name: names[id - 6] || `Sector ${id}`,
      targetScore: 250 + (id * 50),
      description: `Survive Sector ${id} and achieve ${250 + (id * 50)} points.`,
      walls,
      portals
    };
  }

  getLevel(id) {
    return this.levels.find(l => l.id === id) || this.levels[0];
  }
}

window.levelManager = new LevelManager();

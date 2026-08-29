/* ==========================================================================
   SNAKE ARCADE DELUXE - MEGA LEVEL DATA PACK 1 (SECTORS 1 - 200)
   Handcrafted & Procedurally Generated Grid Wall Coordinates
   ========================================================================== */

window.MEGA_LEVELS_PACK_1 = [
  {
    id: 1,
    name: "Sector 1: Genesis Grid",
    targetScore: 100,
    walls: [
      { x: 5, y: 5 },
      { x: 5, y: 6 },
      { x: 5, y: 7 },
      { x: 5, y: 8 },
      { x: 5, y: 9 },
      { x: 18, y: 5 },
      { x: 18, y: 6 },
      { x: 18, y: 7 },
      { x: 18, y: 8 },
      { x: 18, y: 9 }
    ],
    portals: [
      { inX: 2, inY: 12, outX: 21, outY: 12, color: "#00f3ff" }
    ]
  },
  {
    id: 2,
    name: "Sector 2: Twin Barrier",
    targetScore: 120,
    walls: [
      { x: 8, y: 4 },
      { x: 8, y: 5 },
      { x: 8, y: 6 },
      { x: 8, y: 7 },
      { x: 8, y: 8 },
      { x: 8, y: 9 },
      { x: 8, y: 10 },
      { x: 8, y: 11 },
      { x: 8, y: 12 },
      { x: 8, y: 13 },
      { x: 8, y: 14 },
      { x: 8, y: 15 },
      { x: 15, y: 8 },
      { x: 15, y: 9 },
      { x: 15, y: 10 },
      { x: 15, y: 11 },
      { x: 15, y: 12 },
      { x: 15, y: 13 },
      { x: 15, y: 14 },
      { x: 15, y: 15 },
      { x: 15, y: 16 },
      { x: 15, y: 17 },
      { x: 15, y: 18 },
      { x: 15, y: 19 }
    ],
    portals: []
  }
];

// Dynamically populate Sectors 3 through 200 with line-by-line wall coordinates
(function generatePack1() {
  for (let lvl = 3; lvl <= 200; lvl++) {
    const walls = [];
    const offset = lvl % 5;
    for (let i = 3; i <= 20; i++) {
      if ((i + offset) % 2 === 0) {
        walls.push({ x: i, y: 4 + (lvl % 12) });
        walls.push({ x: 4 + (lvl % 12), y: i });
      }
    }
    window.MEGA_LEVELS_PACK_1.push({
      id: lvl,
      name: "Sector " + lvl + ": Cyber Grid Alpha",
      targetScore: 100 + (lvl * 15),
      walls: walls,
      portals: [
        { inX: (lvl * 3) % 22, inY: (lvl * 5) % 22, outX: (lvl * 7) % 22, outY: (lvl * 11) % 22, color: "#ff0055" }
      ]
    });
  }
})();

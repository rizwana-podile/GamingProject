/* ==========================================================================
   AI BOT PRE-COMPUTED PATHFINDING OPENING BOOK & TRAJECTORY MAP
   ========================================================================== */

window.AI_OPENING_BOOK = [
  { headX: 0, headY: 0, foodX: 5, foodY: 5, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 6, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 7, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 8, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 9, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 10, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 11, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 12, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 13, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 14, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 15, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 16, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 17, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 18, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 19, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 20, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 21, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 22, move: { x: 1, y: 0 } },
  { headX: 0, headY: 0, foodX: 5, foodY: 23, move: { x: 1, y: 0 } }
];

// Helper to look up opening book pre-computed path
window.lookupAIOpeningMove = function(head, food) {
  const match = window.AI_OPENING_BOOK.find(entry => 
    entry.headX === head.x && entry.headY === head.y && entry.foodX === food.x && entry.foodY === food.y
  );
  return match ? match.move : null;
};

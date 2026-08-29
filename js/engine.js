/* ==========================================================================
   CORE 60 FPS SNAKE ARCADE GAME ENGINE & STATE MACHINE
   Grid Logic, Collision Matrix, Power-ups, Portals & Combo System
   ========================================================================== */

class SnakeGameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Grid Dimensions
    this.cols = 24;
    this.rows = 24;
    this.cellSize = 24;

    // Game States: 'IDLE', 'RUNNING', 'PAUSED', 'GAMEOVER', 'LEVEL_WIN'
    this.state = 'IDLE';
    this.mode = 'classic'; // 'classic', 'campaign', 'ai_battle', 'speedrun'

    // Engine Speed & Timing
    this.baseSpeed = 110; // ms per tick
    this.currentSpeed = this.baseSpeed;
    this.lastTickTime = 0;
    this.animFrameId = null;

    // Player Snake Definition
    this.snake = [];
    this.direction = { x: 1, y: 0 }; // Moving right initially
    this.nextDirection = { x: 1, y: 0 };
    this.turnQueue = [];

    // AI Opponent Snake Definition (for AI Battle Mode)
    this.aiSnake = [];
    this.aiDirection = { x: -1, y: 0 };

    // Game Entities
    this.food = { x: 0, y: 0, type: 'regular', color: '#ff0055' };
    this.activePowerups = []; // { type, durationLeft }
    this.floatingItems = []; // Active power-up on grid
    this.obstacles = []; // Wall segments {x, y}
    this.portals = []; // Portal pairs

    // Scoring & Telemetry
    this.score = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.multiplier = 1;
    this.levelId = 1;
    this.timeRemaining = 60; // For speedrun mode

    // Skins & Aesthetics
    this.skinColors = {
      head: '#00f3ff',
      body: '#00aaef',
      glow: 'rgba(0, 243, 255, 0.6)'
    };

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const availableWidth = Math.min(parent.clientWidth - 32, 600);
    const availableHeight = Math.min(parent.clientHeight - 32, 600);
    const minDim = Math.max(300, Math.min(availableWidth, availableHeight));

    this.canvas.width = minDim;
    this.canvas.height = minDim;
    this.cellSize = Math.floor(minDim / this.cols);
  }

  // Start / Initialize New Game Session
  startNewGame(mode = 'classic', levelId = 1) {
    this.mode = mode;
    this.levelId = levelId;
    this.score = 0;
    this.combo = 0;
    this.multiplier = 1;
    this.turnQueue = [];
    this.activePowerups = [];
    this.floatingItems = [];
    this.timeRemaining = mode === 'speedrun' ? 45 : 0;

    // Reset Player Snake (Center of Grid)
    const startX = Math.floor(this.cols / 4);
    const startY = Math.floor(this.rows / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };

    // Setup AI Opponent if in AI Battle Mode
    if (this.mode === 'ai_battle') {
      const aiX = Math.floor((this.cols * 3) / 4);
      const aiY = Math.floor(this.rows / 2);
      this.aiSnake = [
        { x: aiX, y: aiY },
        { x: aiX + 1, y: aiY },
        { x: aiX + 2, y: aiY }
      ];
      this.aiDirection = { x: -1, y: 0 };
    } else {
      this.aiSnake = [];
    }

    // Load Obstacles & Portals from Level Manager if Campaign
    if (this.mode === 'campaign') {
      const lvl = window.levelManager.getLevel(levelId);
      this.obstacles = lvl.walls || [];
      this.portals = lvl.portals || [];
    } else {
      this.obstacles = [];
      this.portals = [];
    }

    this.spawnFood();
    this.state = 'RUNNING';
    this.lastTickTime = performance.now();

    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.gameLoop(performance.now());
  }

  // Handle Keyboard Direction Input
  setDirection(dirX, dirY) {
    if (this.state !== 'RUNNING') return;

    // Prevent 180-degree instant self-reversal
    const lastDir = this.turnQueue.length > 0 ? this.turnQueue[this.turnQueue.length - 1] : this.direction;
    if (lastDir.x + dirX === 0 && lastDir.y + dirY === 0) return;

    if (this.turnQueue.length < 2) {
      this.turnQueue.push({ x: dirX, y: dirY });
    }
  }

  // Core Animation Loop (60 FPS)
  gameLoop(timestamp) {
    if (this.state !== 'RUNNING' && this.state !== 'PAUSED') return;

    const delta = timestamp - this.lastTickTime;

    if (this.state === 'RUNNING' && delta >= this.getEffectiveSpeed()) {
      this.lastTickTime = timestamp;
      this.tick();
    }

    this.render();
    this.animFrameId = requestAnimationFrame(t => this.gameLoop(t));
  }

  getEffectiveSpeed() {
    let speed = this.baseSpeed;
    if (this.hasPowerup('speed')) speed *= 0.6; // 40% Faster
    if (this.hasPowerup('freeze')) speed *= 1.4; // Slow motion
    return speed;
  }

  hasPowerup(type) {
    return this.activePowerups.some(p => p.type === type && p.duration > 0);
  }

  // Engine Physics Tick
  tick() {
    // Process Turn Queue
    if (this.turnQueue.length > 0) {
      this.direction = this.turnQueue.shift();
    }

    // Move Player Snake
    const head = { ...this.snake[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;

    // Portal Warping Logic
    this.checkPortals(head);

    // Grid Boundaries Wrapping (if not Ghost mode)
    if (!this.hasPowerup('ghost')) {
      if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
        return this.triggerGameOver('Crashed into outer grid wall!');
      }
    } else {
      // Screen Wrap
      if (head.x < 0) head.x = this.cols - 1;
      if (head.x >= this.cols) head.x = 0;
      if (head.y < 0) head.y = this.rows - 1;
      if (head.y >= this.rows) head.y = 0;
    }

    // Check Wall Obstacle Collisions
    if (!this.hasPowerup('ghost')) {
      if (this.obstacles.some(w => w.x === head.x && w.y === head.y)) {
        return this.triggerGameOver('Crashed into wall obstacle!');
      }
    }

    // Check Self Collision
    if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      return this.triggerGameOver('Bit your own tail!');
    }

    // Add new head
    this.snake.unshift(head);

    // Check Food Collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.onEatFood();
    } else {
      this.snake.pop(); // Remove tail if no food eaten
    }

    // Check Power-up Collectibles Collision
    for (let i = this.floatingItems.length - 1; i >= 0; i--) {
      const pItem = this.floatingItems[i];
      if (head.x === pItem.x && head.y === pItem.y) {
        this.activatePowerup(pItem.type);
        this.floatingItems.splice(i, 1);
        if (window.soundManager) window.soundManager.playPowerup();
      }
    }

    // Tick Active Power-up Durations
    this.activePowerups.forEach(p => p.duration--);
    this.activePowerups = this.activePowerups.filter(p => p.duration > 0);

    // AI Bot Movement & Collision (if AI Battle Mode)
    if (this.mode === 'ai_battle' && this.aiSnake.length > 0) {
      this.tickAI();
    }

    // Update Particle Engine FX
    const headPxX = head.x * this.cellSize + this.cellSize / 2;
    const headPxY = head.y * this.cellSize + this.cellSize / 2;
    if (window.particleSystem) {
      window.particleSystem.createTrail(headPxX, headPxY, this.skinColors.head);
    }
  }

  checkPortals(head) {
    for (const portal of this.portals) {
      if (head.x === portal.inX && head.y === portal.inY) {
        head.x = portal.outX;
        head.y = portal.outY;
        if (window.soundManager) window.soundManager.playPortal();
        break;
      }
    }
  }

  onEatFood() {
    let basePts = 10;
    if (this.food.type === 'golden') basePts = 50;

    this.score += basePts * this.multiplier;
    this.combo++;

    if (window.soundManager) {
      if (this.food.type === 'golden') window.soundManager.playGoldenApple();
      else window.soundManager.playEat();
    }

    if (window.particleSystem) {
      const foodPxX = this.food.x * this.cellSize + this.cellSize / 2;
      const foodPxY = this.food.y * this.cellSize + this.cellSize / 2;
      window.particleSystem.burst(foodPxX, foodPxY, this.food.color, 18);
    }

    if (window.storageEngine) {
      window.storageEngine.incrementStat('totalFoodEaten');
    }

    // Random Powerup Spawning Chance (20%)
    if (Math.random() < 0.20 && this.floatingItems.length < 2) {
      this.spawnPowerup();
    }

    // Campaign Level Win Condition Check
    if (this.mode === 'campaign') {
      const lvl = window.levelManager.getLevel(this.levelId);
      if (this.score >= lvl.targetScore) {
        return this.triggerLevelWin();
      }
    }

    this.spawnFood();
  }

  spawnFood() {
    let valid = false;
    let newX, newY;
    while (!valid) {
      newX = Math.floor(Math.random() * this.cols);
      newY = Math.floor(Math.random() * this.rows);

      // Check collision with player, obstacles, portals, AI
      const onSnake = this.snake.some(s => s.x === newX && s.y === newY);
      const onObstacle = this.obstacles.some(w => w.x === newX && w.y === newY);
      const onAI = this.aiSnake.some(s => s.x === newX && s.y === newY);

      if (!onSnake && !onObstacle && !onAI) {
        valid = true;
      }
    }

    const isGolden = Math.random() < 0.15;
    this.food = {
      x: newX,
      y: newY,
      type: isGolden ? 'golden' : 'regular',
      color: isGolden ? '#ffb700' : '#ff0055'
    };
  }

  spawnPowerup() {
    const types = ['speed', 'freeze', 'ghost', 'magnet', 'multiplier'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    let valid = false;
    let pX, pY;

    while (!valid) {
      pX = Math.floor(Math.random() * this.cols);
      pY = Math.floor(Math.random() * this.rows);
      if (!this.snake.some(s => s.x === pX && s.y === pY) && !this.obstacles.some(w => w.x === pX && w.y === pY)) {
        valid = true;
      }
    }

    this.floatingItems.push({ x: pX, y: pY, type: chosenType });
  }

  activatePowerup(type) {
    this.activePowerups.push({ type, duration: 40 }); // 40 ticks (~4.5s)
    if (type === 'multiplier') this.multiplier = 2;
    if (window.storageEngine) window.storageEngine.incrementStat('totalPowerupsPicked');
  }

  tickAI() {
    if (!window.aiBotEngine) return;

    const move = window.aiBotEngine.getNextMove(this.aiSnake, this.food, this.obstacles, this.snake);
    this.aiDirection = move;

    const aiHead = { ...this.aiSnake[0] };
    aiHead.x += this.aiDirection.x;
    aiHead.y += this.aiDirection.y;

    // Check AI Death
    const crashedObstacle = this.obstacles.some(w => w.x === aiHead.x && w.y === aiHead.y);
    const crashedPlayer = this.snake.some(s => s.x === aiHead.x && s.y === aiHead.y);
    const crashedSelf = this.aiSnake.some(s => s.x === aiHead.x && s.y === aiHead.y);

    if (crashedObstacle || crashedPlayer || crashedSelf) {
      // AI Crashed! Player Wins AI Battle!
      if (window.storageEngine) {
        window.storageEngine.incrementStat('aiBattlesWon');
      }
      this.triggerLevelWin("Defeated AI Rival Snake!");
      return;
    }

    this.aiSnake.unshift(aiHead);

    if (aiHead.x === this.food.x && aiHead.y === this.food.y) {
      this.spawnFood();
    } else {
      this.aiSnake.pop();
    }
  }

  triggerGameOver(reason) {
    this.state = 'GAMEOVER';
    if (window.soundManager) window.soundManager.playCrash();
    if (window.storageEngine) {
      window.storageEngine.updateHighScore(this.score);
      window.storageEngine.incrementStat('totalGamesPlayed');
    }
    if (window.appUI) {
      window.appUI.showGameOverModal(reason, this.score);
    }
  }

  triggerLevelWin(customTitle) {
    this.state = 'LEVEL_WIN';
    if (window.soundManager) window.soundManager.playLevelComplete();
    if (window.storageEngine) {
      if (this.levelId >= window.storageEngine.data.campaignLevelUnlocked) {
        window.storageEngine.data.campaignLevelUnlocked = this.levelId + 1;
        window.storageEngine.save();
      }
    }
    if (window.appUI) {
      window.appUI.showLevelWinModal(customTitle || `Level ${this.levelId} Cleared!`, this.score);
    }
  }

  // Render Frame
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Grid Lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    this.ctx.lineWidth = 1;
    for (let c = 0; c <= this.cols; c++) {
      this.ctx.beginPath();
      this.ctx.moveTo(c * this.cellSize, 0);
      this.ctx.lineTo(c * this.cellSize, this.canvas.height);
      this.ctx.stroke();
    }
    for (let r = 0; r <= this.rows; r++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, r * this.cellSize);
      this.ctx.lineTo(this.canvas.width, r * this.cellSize);
      this.ctx.stroke();
    }

    // 2. Draw Obstacles (Walls)
    this.ctx.fillStyle = '#ff0055';
    this.ctx.shadowColor = '#ff0055';
    this.ctx.shadowBlur = 12;
    this.obstacles.forEach(w => {
      this.ctx.fillRect(w.x * this.cellSize + 1, w.y * this.cellSize + 1, this.cellSize - 2, this.cellSize - 2);
    });

    // 3. Draw Portals
    this.portals.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 16;
      this.ctx.beginPath();
      this.ctx.arc(p.inX * this.cellSize + this.cellSize / 2, p.inY * this.cellSize + this.cellSize / 2, this.cellSize / 2.2, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 4. Draw Food
    const foodPxX = this.food.x * this.cellSize + this.cellSize / 2;
    const foodPxY = this.food.y * this.cellSize + this.cellSize / 2;
    this.ctx.fillStyle = this.food.color;
    this.ctx.shadowColor = this.food.color;
    this.ctx.shadowBlur = 18;
    this.ctx.beginPath();
    this.ctx.arc(foodPxX, foodPxY, this.cellSize / 2.4, 0, Math.PI * 2);
    this.ctx.fill();

    // 5. Draw Floating Power-ups
    this.floatingItems.forEach(p => {
      this.ctx.fillStyle = '#00f3ff';
      this.ctx.shadowColor = '#00f3ff';
      this.ctx.shadowBlur = 14;
      this.ctx.fillRect(p.x * this.cellSize + 3, p.y * this.cellSize + 3, this.cellSize - 6, this.cellSize - 6);
    });

    // 6. Draw AI Opponent Snake (if present)
    if (this.aiSnake.length > 0) {
      this.ctx.fillStyle = '#ff0055';
      this.ctx.shadowColor = '#ff0055';
      this.ctx.shadowBlur = 12;
      this.aiSnake.forEach((seg, i) => {
        this.ctx.fillRect(seg.x * this.cellSize + 1, seg.y * this.cellSize + 1, this.cellSize - 2, this.cellSize - 2);
      });
    }

    // 7. Draw Player Snake
    this.snake.forEach((seg, idx) => {
      const isHead = idx === 0;
      this.ctx.fillStyle = isHead ? this.skinColors.head : this.skinColors.body;
      this.ctx.shadowColor = this.skinColors.head;
      this.ctx.shadowBlur = isHead ? 16 : 8;

      const px = seg.x * this.cellSize;
      const py = seg.y * this.cellSize;
      const r = isHead ? 8 : 4;

      // Rounded rectangle for snake segments
      this.ctx.beginPath();
      this.ctx.roundRect(px + 1, py + 1, this.cellSize - 2, this.cellSize - 2, r);
      this.ctx.fill();
    });

    // 8. Particle Overlay
    if (window.particleSystem) {
      window.particleSystem.updateAndDraw(this.ctx, this.canvas.width, this.canvas.height);
    }
  }
}

window.snakeEngine = null; // Instantiated in app.js

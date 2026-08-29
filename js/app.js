/* ==========================================================================
   APP UI CONTROLLER & EVENT LISTENERS
   UI Management, Keyboard/Touch Controls, Level Editor & Modal System
   ========================================================================== */

class AppUI {
  constructor() {
    this.engine = new SnakeGameEngine('game-canvas');
    window.snakeEngine = this.engine;

    // Level Editor Painting State
    this.editorGrid = Array(24).fill(null).map(() => Array(24).fill(0));
    this.activeTool = 'wall';

    this.bindEvents();
    this.initLevelGrid();
    this.updateHUD();
    this.showOverlay('start-overlay');
  }

  bindEvents() {
    // 1. Keyboard Navigation Controls
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': case 'k':
          this.engine.setDirection(0, -1);
          break;
        case 'ArrowDown': case 's': case 'S': case 'j':
          this.engine.setDirection(0, 1);
          break;
        case 'ArrowLeft': case 'a': case 'A': case 'h':
          this.engine.setDirection(-1, 0);
          break;
        case 'ArrowRight': case 'd': case 'D': case 'l':
          this.engine.setDirection(1, 0);
          break;
        case 'p': case 'P':
          this.togglePause();
          break;
      }
    });

    // 2. Mobile Touch Swipe Gesture Detection
    let touchStartX = 0;
    let touchStartY = 0;
    const canvas = document.getElementById('game-canvas');

    canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) this.engine.setDirection(1, 0);
        else if (dx < -30) this.engine.setDirection(-1, 0);
      } else {
        if (dy > 30) this.engine.setDirection(0, 1);
        else if (dy < -30) this.engine.setDirection(0, -1);
      }
    }, { passive: true });

    // 3. Virtual D-Pad Button Handlers
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.dir;
        if (dir === 'up') this.engine.setDirection(0, -1);
        if (dir === 'down') this.engine.setDirection(0, 1);
        if (dir === 'left') this.engine.setDirection(-1, 0);
        if (dir === 'right') this.engine.setDirection(1, 0);
        if (window.soundManager) window.soundManager.playClick();
      });
    });

    // 4. Header Control Buttons
    document.getElementById('btn-play-classic')?.addEventListener('click', () => {
      this.hideAllOverlays();
      this.engine.startNewGame('classic');
      if (window.soundManager) window.soundManager.playClick();
    });

    document.getElementById('btn-campaign')?.addEventListener('click', () => {
      this.openModal('modal-campaign');
      if (window.soundManager) window.soundManager.playClick();
    });

    document.getElementById('btn-ai-battle')?.addEventListener('click', () => {
      this.hideAllOverlays();
      this.closeAllModals();
      this.engine.startNewGame('ai_battle');
      if (window.soundManager) window.soundManager.playClick();
    });

    document.getElementById('btn-level-editor')?.addEventListener('click', () => {
      this.openModal('modal-editor');
      this.initEditorGrid();
      if (window.soundManager) window.soundManager.playClick();
    });

    document.getElementById('btn-achievements')?.addEventListener('click', () => {
      this.openModal('modal-achievements');
      this.renderAchievements();
      if (window.soundManager) window.soundManager.playClick();
    });

    document.getElementById('btn-settings')?.addEventListener('click', () => {
      this.openModal('modal-settings');
      if (window.soundManager) window.soundManager.playClick();
    });

    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Sound Mute Toggle Button
    const btnMute = document.getElementById('btn-toggle-sound');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        const isMuted = window.soundManager.muted;
        window.soundManager.setMuted(!isMuted);
        btnMute.innerHTML = !isMuted ? '🔇' : '🔊';
      });
    }

    // Theme Switcher Selector
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        document.documentElement.setAttribute('data-theme', e.target.value);
        if (window.storageEngine) {
          window.storageEngine.data.theme = e.target.value;
          window.storageEngine.save();
        }
      });
    }

    // HUD Update Interval Loop
    setInterval(() => this.updateHUD(), 100);
  }

  updateHUD() {
    const scoreEl = document.getElementById('hud-score');
    const highScoreEl = document.getElementById('hud-highscore');
    const comboEl = document.getElementById('hud-combo');

    if (scoreEl) scoreEl.textContent = this.engine.score;
    if (highScoreEl && window.storageEngine) highScoreEl.textContent = window.storageEngine.data.highScore;
    if (comboEl) comboEl.textContent = `x${this.engine.multiplier}`;
  }

  initLevelGrid() {
    const container = document.getElementById('level-grid-container');
    if (!container || !window.levelManager) return;

    container.innerHTML = '';
    const unlockedLevel = window.storageEngine ? window.storageEngine.data.campaignLevelUnlocked : 1;

    window.levelManager.levels.forEach(lvl => {
      const card = document.createElement('div');
      const isLocked = lvl.id > unlockedLevel;
      card.className = `level-card ${isLocked ? 'locked' : ''}`;

      card.innerHTML = `
        <div class="level-number">SECTOR ${lvl.id}</div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:4px;">${lvl.name}</div>
        <div class="level-stars">${isLocked ? '🔒' : '⭐⭐⭐'}</div>
      `;

      if (!isLocked) {
        card.addEventListener('click', () => {
          this.closeAllModals();
          this.hideAllOverlays();
          this.engine.startNewGame('campaign', lvl.id);
          if (window.soundManager) window.soundManager.playClick();
        });
      }

      container.appendChild(card);
    });
  }

  renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container || !window.storageEngine) return;

    container.innerHTML = '';
    window.storageEngine.data.achievements.forEach(ach => {
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.display = 'flex';
      card.style.alignItems = 'center';
      card.style.gap = '14px';
      card.style.opacity = ach.unlocked ? '1' : '0.4';

      card.innerHTML = `
        <div style="font-size:2rem;">${ach.icon}</div>
        <div>
          <div class="font-heading" style="font-size:0.9rem; color:${ach.unlocked ? 'var(--accent-gold)' : 'var(--text-muted)'}">${ach.title}</div>
          <div style="font-size:0.8rem; color:var(--text-secondary);">${ach.desc}</div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Level Editor Grid Painter
  initEditorGrid() {
    const canvas = document.getElementById('editor-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const cols = 20;
    const rows = 20;
    const size = Math.floor(canvas.width / cols);

    const drawEditor = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.strokeStyle = 'rgba(255,255,255,0.08)';
          ctx.strokeRect(c * size, r * size, size, size);
          if (this.editorGrid[r][c] === 1) {
            ctx.fillStyle = '#ff0055';
            ctx.fillRect(c * size + 1, r * size + 1, size - 2, size - 2);
          }
        }
      }
    };

    let isDrawing = false;
    canvas.onmousedown = (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const c = Math.floor((e.clientX - rect.left) / size);
      const r = Math.floor((e.clientY - rect.top) / size);
      if (c >= 0 && c < cols && r >= 0 && r < rows) {
        this.editorGrid[r][c] = this.editorGrid[r][c] === 1 ? 0 : 1;
        drawEditor();
      }
    };

    canvas.onmousemove = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const c = Math.floor((e.clientX - rect.left) / size);
      const r = Math.floor((e.clientY - rect.top) / size);
      if (c >= 0 && c < cols && r >= 0 && r < rows) {
        this.editorGrid[r][c] = 1;
        drawEditor();
      }
    };

    window.onmouseup = () => isDrawing = false;
    drawEditor();
  }

  showToast(title, desc, icon = '🏆') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  showOverlay(overlayId) {
    document.querySelectorAll('.game-overlay').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(overlayId);
    if (target) target.classList.remove('hidden');
  }

  hideAllOverlays() {
    document.querySelectorAll('.game-overlay').forEach(el => el.classList.add('hidden'));
  }

  showGameOverModal(reason, score) {
    const el = document.getElementById('game-over-reason');
    const scoreEl = document.getElementById('game-over-score');
    if (el) el.textContent = reason;
    if (scoreEl) scoreEl.textContent = score;
    this.showOverlay('gameover-overlay');
  }

  showLevelWinModal(title, score) {
    const titleEl = document.getElementById('win-title');
    const scoreEl = document.getElementById('win-score');
    if (titleEl) titleEl.textContent = title;
    if (scoreEl) scoreEl.textContent = score;
    this.showOverlay('levelwin-overlay');
  }

  openModal(modalId) {
    const target = document.getElementById(modalId);
    if (target) target.classList.add('active');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
  }

  togglePause() {
    if (this.engine.state === 'RUNNING') {
      this.engine.state = 'PAUSED';
      this.showOverlay('pause-overlay');
    } else if (this.engine.state === 'PAUSED') {
      this.engine.state = 'RUNNING';
      this.hideAllOverlays();
      this.engine.gameLoop(performance.now());
    }
  }
}

// Initialize Application when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.appUI = new AppUI();
});

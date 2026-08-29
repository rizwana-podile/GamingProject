/**
 * Aetheria Engine - UI Manager Module
 * Manages user interface overlays, game selector cards, audio toggles,
 * mouse canvas interactions for sandbox/tactics, and global input routing.
 */

class UIManager {
  constructor(arcadeHub) {
    this.hub = arcadeHub;
    this.isMouseDown = false;
  }

  initUI() {
    this.bindButtons();
    this.bindKeyboardGlobal();
    this.bindMouseCanvas();
  }

  bindButtons() {
    const btnPlayClassic = document.getElementById('btn-play-classic');
    if (btnPlayClassic) {
      btnPlayClassic.addEventListener('click', () => {
        this.hideAllOverlays();
        if (this.hub) this.hub.loadGame(this.hub.activeGameKey || 'cybersnake');
      });
    }

    const btnToggleSound = document.getElementById('btn-toggle-sound');
    if (btnToggleSound) {
      btnToggleSound.addEventListener('click', () => {
        if (this.hub && this.hub.synth) {
          const isMuted = this.hub.synth.toggleMute();
          btnToggleSound.textContent = isMuted ? '🔇' : '🔊';
        }
      });
    }

    // Selector buttons for all 6 arcade games
    const selectButtons = document.querySelectorAll('.btn-select-game');
    selectButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gameKey = e.currentTarget.dataset.game;
        if (gameKey && this.hub) {
          this.hideAllOverlays();
          this.hub.loadGame(gameKey);
        }
      });
    });
  }

  bindKeyboardGlobal() {
    window.addEventListener('keydown', (e) => {
      if (this.hub && this.hub.activeGame && typeof this.hub.activeGame.handleKeyDown === 'function') {
        this.hub.activeGame.handleKeyDown(e.key);
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (this.hub && this.hub.activeGame && typeof this.hub.activeGame.handleKeyUp === 'function') {
        this.hub.activeGame.handleKeyUp(e.key);
      }
    });
  }

  bindMouseCanvas() {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;

    const handleMouse = (e) => {
      if (!this.hub || !this.hub.activeGame) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);

      if (typeof this.hub.activeGame.setElementAt === 'function') {
        this.hub.activeGame.setElementAt(x, y, this.hub.activeGame.activeElement || 'sand');
      } else if (typeof this.hub.activeGame.placeTower === 'function' && e.type === 'click') {
        const q = Math.floor((x - canvas.width / 2) / 40);
        const r = Math.floor((y - canvas.height / 2) / 40);
        this.hub.activeGame.placeTower(q, r);
      }
    };

    canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      handleMouse(e);
    });
    canvas.addEventListener('mousemove', (e) => {
      if (this.isMouseDown) handleMouse(e);
    });
    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });
  }

  togglePause() {
    if (!this.hub) return;
    this.hub.isPaused = !this.hub.isPaused;
    const pauseOverlay = document.getElementById('pause-overlay');
    if (pauseOverlay) {
      if (this.hub.isPaused) {
        pauseOverlay.classList.remove('hidden');
      } else {
        pauseOverlay.classList.add('hidden');
      }
    }
  }

  hideAllOverlays() {
    const overlays = document.querySelectorAll('.game-overlay');
    overlays.forEach(ov => ov.classList.add('hidden'));
  }

  showOverlay(overlayId) {
    this.hideAllOverlays();
    const ov = document.getElementById(overlayId);
    if (ov) ov.classList.remove('hidden');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}

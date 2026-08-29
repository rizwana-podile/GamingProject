/**
 * Aetheria Engine - Master App Orchestrator
 * Bootstraps audio synthesis, arcade hub, UI manager, background particle canvas,
 * and full-stack API connections on document load.
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('⚡ Initializing Aetheria Engine & Multi-Game Arcade Ecosystem...');

  const mainCanvas = document.getElementById('game-canvas');
  if (!mainCanvas) return;

  // Initialize WebAudio Synthesizer & SFX
  const synth = typeof WebAudioSynth !== 'undefined' ? new WebAudioSynth() : null;
  const sfx = typeof SoundEffects !== 'undefined' ? new SoundEffects(synth) : null;

  // Initialize Arcade Hub
  const arcadeHub = typeof ArcadeHub !== 'undefined' ? new ArcadeHub(mainCanvas, synth, sfx) : null;

  // Initialize UI Manager
  const uiManager = typeof UIManager !== 'undefined' ? new UIManager(arcadeHub) : null;
  if (uiManager) {
    uiManager.initUI();
    window.appUI = uiManager;
  }

  // Load default game title
  if (arcadeHub) {
    arcadeHub.loadGame('cybersnake');
  }

  console.log('🚀 Aetheria Engine ready. Arcade systems online!');
});

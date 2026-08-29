/**
 * Aetheria Engine - Procedural Sound Effects Preset Module
 * Instant dynamic sound generators for retro arcade sounds, lasers, explosions,
 * powerups, coins, engine hums, hit reactions, and game over sweeps.
 */

class SoundEffects {
  constructor(synth) {
    this.synth = synth;
  }

  laser() {
    if (!this.synth) return;
    this.synth.playSweep(880, 110, 'sawtooth', 0.15);
  }

  explosion() {
    if (!this.synth) return;
    this.synth.playNoise(0.4, 400);
    this.synth.playSweep(150, 20, 'square', 0.35);
  }

  coin() {
    if (!this.synth) return;
    this.synth.playTone(987.77, 'sine', 0.08, 0.005, 0.05); // B5
    setTimeout(() => {
      this.synth.playTone(1318.51, 'sine', 0.12, 0.005, 0.08); // E6
    }, 80);
  }

  powerup() {
    if (!this.synth) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.synth.playTone(freq, 'triangle', 0.1, 0.005, 0.05);
      }, idx * 60);
    });
  }

  hit() {
    if (!this.synth) return;
    this.synth.playNoise(0.1, 800);
    this.synth.playTone(120, 'sawtooth', 0.1, 0.005, 0.05);
  }

  jump() {
    if (!this.synth) return;
    this.synth.playSweep(150, 600, 'square', 0.18);
  }

  gameOver() {
    if (!this.synth) return;
    const notes = [440, 415.30, 392.00, 349.23];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.synth.playTone(freq, 'sawtooth', 0.25, 0.01, 0.1);
      }, idx * 150);
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundEffects;
}

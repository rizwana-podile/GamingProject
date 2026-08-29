/* ==========================================================================
   WEB AUDIO API PROCEDURAL SOUND SYNTHESIZER
   Pure JS Audio Engine for Retro Arcade SFX & Dynamic Chimes
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.35;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported in this browser environment.', e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muteState) {
    this.muted = muteState;
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  // Play a synthesized tone with frequency ramp & envelope
  playTone(freqStart, freqEnd, type, duration, volMultiplier = 1) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
    if (freqEnd && freqEnd !== freqStart) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), this.ctx.currentTime + duration);
    }

    const peakVol = this.masterVolume * volMultiplier;
    gain.gain.setValueAtTime(peakVol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // 1. Eat Food Sound (Crisp Arcade Blip)
  playEat() {
    this.playTone(300, 600, 'sine', 0.08, 0.8);
  }

  // 2. Power-up Collect (Ascending Major Arpeggio)
  playPowerup() {
    if (this.muted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq * 1.05, 'triangle', 0.12, 0.9);
      }, idx * 45);
    });
  }

  // 3. Golden Apple Chime (Sparkling High Frequency)
  playGoldenApple() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, freq, 'sine', 0.15, 0.7);
      }, idx * 40);
    });
  }

  // 4. Snake Crash / Game Over (White Noise Explosion Burst)
  playCrash() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Descending Sawtooth + Low Pitch Noise
    this.playTone(220, 40, 'sawtooth', 0.45, 1.2);

    // White Noise Burst
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(this.masterVolume * 0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start();
  }

  // 5. Portal Teleport (Wobbly Frequency Modulated Sound)
  playPortal() {
    this.playTone(300, 900, 'sawtooth', 0.18, 0.6);
    setTimeout(() => this.playTone(900, 400, 'sine', 0.15, 0.6), 90);
  }

  // 6. Level Complete Fanfare
  playLevelComplete() {
    if (this.muted) return;
    const fanfare = [
      { f: 523.25, d: 0.1 }, { f: 659.25, d: 0.1 }, { f: 783.99, d: 0.1 },
      { f: 1046.50, d: 0.35 }
    ];
    fanfare.forEach((n, idx) => {
      setTimeout(() => {
        this.playTone(n.f, n.f * 1.02, 'triangle', n.d, 1.0);
      }, idx * 110);
    });
  }

  // 7. Button Click Feedback
  playClick() {
    this.playTone(800, 400, 'sine', 0.04, 0.3);
  }
}

// Global Sound Singleton instance
window.soundManager = new SoundEngine();

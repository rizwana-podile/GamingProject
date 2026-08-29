/**
 * Aetheria Engine - 4-Channel Retro Chiptune Tracker & Music Sequencer
 * Multi-channel pattern playback engine (Lead, Bass, Arpeggio, Drums/Noise)
 * for dynamic game background music loops.
 */

class ChiptuneTracker {
  constructor(synth) {
    this.synth = synth;
    this.bpm = 125;
    this.isPlaying = false;
    this.currentStep = 0;
    this.timerId = null;

    // Standard frequencies for notes C3 to B5
    this.notes = {
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
    };

    // 16-step patterns for 4 channels
    this.patterns = {
      cyberpunk: {
        lead: ['A4', null, 'C5', null, 'E5', null, 'D5', null, 'A4', null, 'G4', null, 'A4', null, 'C5', null],
        bass: ['A3', 'A3', 'A3', 'A3', 'F3', 'F3', 'G3', 'G3', 'A3', 'A3', 'A3', 'A3', 'F3', 'F3', 'E3', 'E3'],
        arp:  ['C4', 'E4', 'A4', 'E4', 'C4', 'F4', 'A4', 'F4', 'C4', 'E4', 'A4', 'E4', 'B3', 'E4', 'G#4', 'E4'],
        drums:['K', null, 'S', null, 'K', null, 'S', 'K', 'K', null, 'S', null, 'K', 'K', 'S', null]
      }
    };
  }

  start(patternName = 'cyberpunk') {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;

    const interval = (60 / this.bpm / 4) * 1000;
    this.timerId = setInterval(() => {
      this._stepPattern(patternName);
      this.currentStep = (this.currentStep + 1) % 16;
    }, interval);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  _stepPattern(patternName) {
    if (!this.synth || this.synth.isMuted) return;

    const pattern = this.patterns[patternName];
    if (!pattern) return;

    const step = this.currentStep;

    // Lead Channel
    if (pattern.lead[step]) {
      const freq = this.notes[pattern.lead[step]];
      if (freq) this.synth.playTone(freq, 'sawtooth', 0.1, 0.005, 0.05);
    }

    // Bass Channel
    if (pattern.bass[step]) {
      const freq = this.notes[pattern.bass[step]];
      if (freq) this.synth.playTone(freq, 'square', 0.12, 0.01, 0.08);
    }

    // Arp Channel
    if (pattern.arp[step]) {
      const freq = this.notes[pattern.arp[step]];
      if (freq) this.synth.playTone(freq, 'triangle', 0.06, 0.002, 0.03);
    }

    // Drums Channel
    if (pattern.drums[step] === 'K') {
      this.synth.playSweep(120, 20, 'sine', 0.08);
    } else if (pattern.drums[step] === 'S') {
      this.synth.playNoise(0.08, 1200);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChiptuneTracker;
}

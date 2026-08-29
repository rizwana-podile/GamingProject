/**
 * Aetheria Engine - Spatial 3D Audio Panning Module
 * 3D Audio PannerNode wrapper for positional audio emitters in 2D and 3D game spaces.
 */

class SpatialAudio {
  constructor(synth) {
    this.synth = synth;
    this.listenerX = 0;
    this.listenerY = 0;
    this.listenerZ = 0;
  }

  setListenerPosition(x, y, z = 0) {
    this.listenerX = x;
    this.listenerY = y;
    this.listenerZ = z;

    if (this.synth && this.synth.ctx && this.synth.ctx.listener) {
      const listener = this.synth.ctx.listener;
      if (listener.positionX) {
        listener.positionX.setValueAtTime(x, this.synth.ctx.currentTime);
        listener.positionY.setValueAtTime(y, this.synth.ctx.currentTime);
        listener.positionZ.setValueAtTime(z, this.synth.ctx.currentTime);
      } else {
        listener.setPosition(x, y, z);
      }
    }
  }

  playPositionalTone(x, y, freq, duration = 0.2, type = 'sine') {
    if (!this.synth || !this.synth.ctx || this.synth.isMuted) return;

    const ctx = this.synth.ctx;
    const now = ctx.currentTime;

    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 100;
    panner.maxDistance = 1000;
    panner.rolloffFactor = 1;

    if (panner.positionX) {
      panner.positionX.setValueAtTime(x, now);
      panner.positionY.setValueAtTime(y, now);
      panner.positionZ.setValueAtTime(0, now);
    } else {
      panner.setPosition(x, y, 0);
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(panner);
    panner.connect(this.synth.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpatialAudio;
}

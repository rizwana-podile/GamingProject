/**
 * Aetheria Engine - Fast Trigonometry Lookup Table Module
 * Pre-calculated sine and cosine lookup tables for 360-degree & 4096-step angle resolution,
 * eliminating runtime Math.sin / Math.cos overhead in high-density particle systems.
 */

class TrigonometryLookup {
  constructor(steps = 4096) {
    this.steps = steps;
    this.sinTable = new Float32Array(steps);
    this.cosTable = new Float32Array(steps);
    this.radToStepFactor = steps / (Math.PI * 2);

    this.initTables();
  }

  initTables() {
    for (let i = 0; i < this.steps; i++) {
      const angle = (i / this.steps) * Math.PI * 2;
      this.sinTable[i] = Math.sin(angle);
      this.cosTable[i] = Math.cos(angle);
    }
  }

  sin(radians) {
    let index = Math.floor(radians * this.radToStepFactor) % this.steps;
    if (index < 0) index += this.steps;
    return this.sinTable[index];
  }

  cos(radians) {
    let index = Math.floor(radians * this.radToStepFactor) % this.steps;
    if (index < 0) index += this.steps;
    return this.cosTable[index];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrigonometryLookup;
}

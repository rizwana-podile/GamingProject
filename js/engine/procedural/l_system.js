/**
 * Aetheria Engine - L-System Fractal Vegetation Generator
 * Lindenmayer string substitution engine for procedural trees, plants, and crystalline visual structures.
 */

class LSystemGenerator {
  constructor(axiom = 'F', rules = { 'F': 'FF+[+F-F-F]-[-F+F+F]' }) {
    this.axiom = axiom;
    this.rules = rules;
  }

  generate(iterations = 3) {
    let current = this.axiom;
    for (let i = 0; i < iterations; i++) {
      let next = '';
      for (let char of current) {
        next += this.rules[char] || char;
      }
      current = next;
    }
    return current;
  }

  renderToCanvas(ctx, lString, startX, startY, length = 10, angle = Math.PI / 6) {
    ctx.save();
    ctx.translate(startX, startY);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;

    const stack = [];

    for (let char of lString) {
      if (char === 'F') {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -length);
        ctx.stroke();
        ctx.translate(0, -length);
      } else if (char === '+') {
        ctx.rotate(angle);
      } else if (char === '-') {
        ctx.rotate(-angle);
      } else if (char === '[') {
        stack.push({
          matrix: ctx.getTransform()
        });
      } else if (char === ']') {
        if (stack.length > 0) {
          const state = stack.pop();
          ctx.setTransform(state.matrix);
        }
      }
    }

    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = LSystemGenerator;
}

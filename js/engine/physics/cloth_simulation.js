/**
 * Aetheria Engine - 2D Cloth Simulation Physics Module
 * Mass-spring constraint mesh solver for banners, capes, flags, and soft curtains.
 */

class ClothNode {
  constructor(x, y, pinned = false) {
    this.position = new Vector2(x, y);
    this.oldPosition = new Vector2(x, y);
    this.pinned = pinned;
    this.mass = 1.0;
  }

  update(dt, gravity = new Vector2(0, 9.8 * 15)) {
    if (this.pinned) return;

    const velocity = this.position.sub(this.oldPosition).scale(0.98);
    this.oldPosition.copy(this.position);

    this.position.addSelf(velocity);
    this.position.addSelf(gravity.scale(dt * dt));
  }
}

class ClothLink {
  constructor(nodeA, nodeB, stiffness = 1.0) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.restLength = Vector2.distance(nodeA.position, nodeB.position);
    this.stiffness = stiffness;
  }

  resolve() {
    const delta = this.nodeB.position.sub(this.nodeA.position);
    const currentLength = delta.magnitude() || 0.0001;
    const difference = (currentLength - this.restLength) / currentLength;
    const correction = delta.scale(0.5 * difference * this.stiffness);

    if (!this.nodeA.pinned) this.nodeA.position.addSelf(correction);
    if (!this.nodeB.pinned) this.nodeB.position.subSelf(correction);
  }
}

class ClothMesh {
  constructor(cols = 15, rows = 12, spacing = 20) {
    this.cols = cols;
    this.rows = rows;
    this.spacing = spacing;

    this.nodes = [];
    this.links = [];

    this.initMesh();
  }

  initMesh() {
    this.nodes = [];
    this.links = [];

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const pinned = r === 0 && (c === 0 || c === Math.floor(this.cols / 2) || c === this.cols - 1);
        const node = new ClothNode(100 + c * this.spacing, 50 + r * this.spacing, pinned);
        this.nodes.push(node);
      }
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        if (c < this.cols - 1) {
          this.links.push(new ClothLink(this.nodes[idx], this.nodes[idx + 1]));
        }
        if (r < this.rows - 1) {
          this.links.push(new ClothLink(this.nodes[idx], this.nodes[idx + this.cols]));
        }
      }
    }
  }

  update(dt, iterations = 4) {
    for (const node of this.nodes) {
      node.update(dt);
    }
    for (let iter = 0; iter < iterations; iter++) {
      for (const link of this.links) {
        link.resolve();
      }
    }
  }

  render(ctx) {
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1;
    for (const link of this.links) {
      ctx.beginPath();
      ctx.moveTo(link.nodeA.position.x, link.nodeA.position.y);
      ctx.lineTo(link.nodeB.position.x, link.nodeB.position.y);
      ctx.stroke();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ClothNode, ClothLink, ClothMesh };
}

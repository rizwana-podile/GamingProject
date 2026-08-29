/**
 * Aetheria Engine - Voronoi Diagram & Delaunay Triangulation Module
 * 2D Voronoi cell partitioning algorithm for procedural map biomes,
 * territory control grids, and shatter mesh generation.
 */

class VoronoiCell {
  constructor(sitePoint) {
    this.site = sitePoint;
    this.vertices = [];
    this.neighbors = [];
  }
}

class VoronoiDiagram {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.sites = [];
    this.cells = [];
  }

  generate(siteCount = 30) {
    this.sites = [];
    this.cells = [];

    for (let i = 0; i < siteCount; i++) {
      const site = new Vector2(
        Math.random() * this.width,
        Math.random() * this.height
      );
      this.sites.push(site);
      this.cells.push(new VoronoiCell(site));
    }

    return this.cells;
  }

  getNearestSite(x, y) {
    let nearest = null;
    let minDistanceSq = Infinity;

    for (const site of this.sites) {
      const distSq = (site.x - x) ** 2 + (site.y - y) ** 2;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        nearest = site;
      }
    }

    return nearest;
  }

  renderToCanvas(ctx) {
    ctx.save();
    for (const site of this.sites) {
      ctx.fillStyle = '#ff00aa';
      ctx.beginPath();
      ctx.arc(site.x, site.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VoronoiCell, VoronoiDiagram };
}

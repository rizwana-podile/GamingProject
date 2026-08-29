/**
 * Aetheria Engine - Eulerian Fluid Dynamics Grid Module
 * Grid-based velocity & density advection, diffusion, pressure projection,
 * and fluid rendering.
 */

class FluidGrid {
  constructor(size = 40, dt = 0.1, diffusion = 0.0001, viscosity = 0.0001) {
    this.size = size;
    this.dt = dt;
    this.diff = diffusion;
    this.visc = viscosity;

    const N = size;
    this.s = new Float32Array((N + 2) * (N + 2));
    this.density = new Float32Array((N + 2) * (N + 2));

    this.Vx = new Float32Array((N + 2) * (N + 2));
    this.Vy = new Float32Array((N + 2) * (N + 2));

    this.Vx0 = new Float32Array((N + 2) * (N + 2));
    this.Vy0 = new Float32Array((N + 2) * (N + 2));
  }

  IX(x, y) {
    return x + y * (this.size + 2);
  }

  addDensity(x, y, amount) {
    const N = this.size;
    if (x >= 1 && x <= N && y >= 1 && y <= N) {
      this.density[this.IX(x, y)] += amount;
    }
  }

  addVelocity(x, y, amountX, amountY) {
    const N = this.size;
    if (x >= 1 && x <= N && y >= 1 && y <= N) {
      const index = this.IX(x, y);
      this.Vx[index] += amountX;
      this.Vy[index] += amountY;
    }
  }

  step() {
    const N = this.size;
    const visc = this.visc;
    const diff = this.diff;
    const dt = this.dt;

    this.diffuse(1, this.Vx0, this.Vx, visc, dt, N);
    this.diffuse(2, this.Vy0, this.Vy, visc, dt, N);

    this.project(this.Vx0, this.Vy0, this.Vx, this.Vy, N);

    this.advect(1, this.Vx, this.Vx0, this.Vx0, this.Vy0, dt, N);
    this.advect(2, this.Vy, this.Vy0, this.Vx0, this.Vy0, dt, N);

    this.project(this.Vx, this.Vy, this.Vx0, this.Vy0, N);

    this.diffuse(0, this.s, this.density, diff, dt, N);
    this.advect(0, this.density, this.s, this.Vx, this.Vy, dt, N);
  }

  diffuse(b, x, x0, diff, dt, N) {
    const a = dt * diff * (N - 2) * (N - 2);
    this.lin_solve(b, x, x0, a, 1 + 6 * a, N);
  }

  lin_solve(b, x, x0, a, c, N) {
    const cRecip = 1.0 / c;
    for (let k = 0; k < 4; k++) {
      for (let j = 1; j <= N; j++) {
        for (let i = 1; i <= N; i++) {
          x[this.IX(i, j)] =
            (x0[this.IX(i, j)] +
              a *
                (x[this.IX(i + 1, j)] +
                  x[this.IX(i - 1, j)] +
                  x[this.IX(i, j + 1)] +
                  x[this.IX(i, j - 1)])) *
            cRecip;
        }
      }
      this.set_bnd(b, x, N);
    }
  }

  project(velocX, velocY, p, div, N) {
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        div[this.IX(i, j)] =
          (-0.5 *
            (velocX[this.IX(i + 1, j)] -
              velocX[this.IX(i - 1, j)] +
              velocY[this.IX(i, j + 1)] -
              velocY[this.IX(i, j - 1)])) /
          N;
        p[this.IX(i, j)] = 0;
      }
    }
    this.set_bnd(0, div, N);
    this.set_bnd(0, p, N);
    this.lin_solve(0, p, div, 1, 6, N);

    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        velocX[this.IX(i, j)] -=
          0.5 * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]) * N;
        velocY[this.IX(i, j)] -=
          0.5 * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]) * N;
      }
    }
    this.set_bnd(1, velocX, N);
    this.set_bnd(2, velocY, N);
  }

  advect(b, d, d0, velocX, velocY, dt, N) {
    let i0, i1, j0, j1;

    const dtx = dt * (N - 2);
    const dty = dt * (N - 2);

    let s0, s1, t0, t1;
    let tmp1, tmp2, x, y;

    const Nfloat = N;

    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        tmp1 = dtx * velocX[this.IX(i, j)];
        tmp2 = dty * velocY[this.IX(i, j)];
        x = i - tmp1;
        y = j - tmp2;

        if (x < 0.5) x = 0.5;
        if (x > Nfloat + 0.5) x = Nfloat + 0.5;
        i0 = Math.floor(x);
        i1 = i0 + 1.0;
        if (y < 0.5) y = 0.5;
        if (y > Nfloat + 0.5) y = Nfloat + 0.5;
        j0 = Math.floor(y);
        j1 = j0 + 1.0;

        s1 = x - i0;
        s0 = 1.0 - s1;
        t1 = y - j0;
        t0 = 1.0 - t1;

        const i0i = Math.floor(i0);
        const i1i = Math.floor(i1);
        const j0i = Math.floor(j0);
        const j1i = Math.floor(j1);

        d[this.IX(i, j)] =
          s0 * (t0 * d0[this.IX(i0i, j0i)] + t1 * d0[this.IX(i0i, j1i)]) +
          s1 * (t0 * d0[this.IX(i1i, j0i)] + t1 * d0[this.IX(i1i, j1i)]);
      }
    }
    this.set_bnd(b, d, N);
  }

  set_bnd(b, x, N) {
    for (let i = 1; i <= N; i++) {
      x[this.IX(i, 0)] = b === 2 ? -x[this.IX(i, 1)] : x[this.IX(i, 1)];
      x[this.IX(i, N + 1)] = b === 2 ? -x[this.IX(i, N)] : x[this.IX(i, N)];
    }
    for (let j = 1; j <= N; j++) {
      x[this.IX(0, j)] = b === 1 ? -x[this.IX(1, j)] : x[this.IX(1, j)];
      x[this.IX(N + 1, j)] = b === 1 ? -x[this.IX(N, j)] : x[this.IX(N, j)];
    }

    x[this.IX(0, 0)] = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)]);
    x[this.IX(0, N + 1)] = 0.5 * (x[this.IX(1, N + 1)] + x[this.IX(0, N)]);
    x[this.IX(N + 1, 0)] = 0.5 * (x[this.IX(N, 0)] + x[this.IX(N + 1, 1)]);
    x[this.IX(N + 1, N + 1)] = 0.5 * (x[this.IX(N, N + 1)] + x[this.IX(N + 1, N)]);
  }

  render(ctx, cellWidth, cellHeight) {
    const N = this.size;
    for (let j = 1; j <= N; j++) {
      for (let i = 1; i <= N; i++) {
        const d = this.density[this.IX(i, j)];
        if (d > 0.01) {
          ctx.fillStyle = `rgba(0, 240, 255, ${Math.min(1, d)})`;
          ctx.fillRect((i - 1) * cellWidth, (j - 1) * cellHeight, cellWidth, cellHeight);
        }
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FluidGrid;
}

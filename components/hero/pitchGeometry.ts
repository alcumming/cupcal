// Pitch geometry for the CupCal animated hero.
// Derived from the artist's Scene.svg (0 0 1556 360) via a one-point-perspective
// homography. Do not recompute — see docs/cupcal-hero-spec.md §3.

export const VIEWBOX = { w: 1556, h: 360 };
export const COLS = 7;
export const ROWS = 5;

// Homography: unit square (u,v)∈[0,1]² → scene coords. Field corners
// TL(245,25) TR(1310,25) BR(1475,354) BL(80,354).
const H = [1065, -183.924731, 245, 0, 245.258065, 25, 0, -0.236559, 1];

export function project(u: number, v: number): [number, number] {
  const x = H[0] * u + H[1] * v + H[2];
  const y = H[3] * u + H[4] * v + H[5];
  const w = H[6] * u + H[7] * v + H[8];
  return [x / w, y / w];
}

export interface Cell {
  col: number;
  row: number;
  cx: number;
  cy: number; // center, scene coords
  scale: number; // 0.806 (back row) → 1.0 (front row)
  corners: [number, number][]; // 4 pts for the invisible hit-polygon
}

const FRONT_W = project(1, 0.9)[0] - project(0, 0.9)[0];

export const CELLS: Cell[] = (() => {
  const out: Cell[] = [];
  for (let row = 0; row < ROWS; row++) {
    const v = (row + 0.5) / ROWS;
    const scale = (project(1, v)[0] - project(0, v)[0]) / FRONT_W;
    for (let col = 0; col < COLS; col++) {
      const [cx, cy] = project((col + 0.5) / COLS, v);
      const corners: [number, number][] = [
        project(col / COLS, row / ROWS),
        project((col + 1) / COLS, row / ROWS),
        project((col + 1) / COLS, (row + 1) / ROWS),
        project(col / COLS, (row + 1) / ROWS),
      ];
      out.push({ col, row, cx, cy, scale, corners });
    }
  }
  return out;
})();

export const cellAt = (col: number, row: number) => CELLS[row * COLS + col];
export const REST_CELL = cellAt(3, 2); // ball home: ground point (777.5, 167.4), scale 0.893

// Depth scale at any GROUND y (pass the ball's ground y `by`, NOT by−lift).
export const scaleAtY = (y: number) =>
  0.806 + (1.0 - 0.806) * Math.min(1, Math.max(0, (y - 25) / (354 - 25)));

// Trapezoid side edges at a given y, for slingshot wall bounces.
export const leftEdgeX = (y: number) => 245 + (80 - 245) * (y - 25) / (354 - 25);
export const rightEdgeX = (y: number) => 1310 + (1475 - 1310) * (y - 25) / (354 - 25);

// Goal scoring zones (generous; tune against the art).
export const GOALS = {
  left: { plane: 215, yMin: 40, yMax: 250, dir: -1 as const },
  right: { plane: 1340, yMin: 40, yMax: 250, dir: 1 as const },
};

// Did the ball (scene coords) cross into a goal mouth this frame?
export const goalHit = (x: number, y: number) =>
  x <= GOALS.left.plane && y > GOALS.left.yMin && y < GOALS.left.yMax
    ? "left"
    : x >= GOALS.right.plane && y > GOALS.right.yMin && y < GOALS.right.yMax
      ? "right"
      : null;

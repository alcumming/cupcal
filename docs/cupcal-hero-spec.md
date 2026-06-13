# CupCal animated hero — build spec

Interactive above-the-fold hero: a hand-drawn calendar drawn in soccer-pitch
perspective, flanked by two goals. A ball hops between calendar cells (each lights
up as it lands), and the user can **slingshot** the ball into either goal. Built
on Next.js + Framer Motion, layered over the hand-drawn SVG art.

The perspective geometry and every element's position are already solved and
embedded below (derived from the artist's composed `Scene.svg`). Build
phase-by-phase; each phase is independently testable.

---

## 1. Assets (in `public/hero/`)

| File | viewBox | Notes |
|---|---|---|
| `calendar.svg` | `0 0 1398 354` | The pitch. 104 hand-drawn paths, **no IDs**, day labels are vector paths. Static background image — do not parse. |
| `ball.svg` | `0 0 75 76` | White circle `r=35.5` at center + ink shading + inner-shadow filter. |
| `ball-shadow.svg` | `0 0 85 15` | `<ellipse rx=42.5 ry=7.5 opacity=0.4>`. |
| `left-goal.svg` | `0 0 215 279` | Net = **flat shapes** (8 paths). Animate as one group. |
| `right-goal.svg` | `0 0 216 287` | Same. |
| `Scene.svg` | `0 0 1556 360` | Reference only (the artist's full composition, with a static ball baked in). **Do not use as the live background** — we composite from the parts so the ball can animate. Used here to derive all positions. |

Everything is positioned in **scene coordinates** (`0 0 1556 360`) so the whole
hero scales together responsively with no pixel math.

---

## 2. Composite layout (scene space `1556 × 360`)

Root SVG: `viewBox="0 0 1556 360"`, `preserveAspectRatio="xMidYMid meet"`. Layers
back-to-front:

```
<svg viewBox="0 0 1556 360">
  <image href="/hero/calendar.svg"   x="79"  y="3" width="1398" height="354" style="pointer-events:none"/>
  <!-- highlights: 35 motion.polygon (5c), pointer-events:none -->
  <!-- hit-zones: 35 polygon, fill=transparent, pointer-events:all -->
  <image href="/hero/left-goal.svg"  x="0"    y="0" width="215" height="279" style="pointer-events:none"/>
  <image href="/hero/right-goal.svg" x="1340" y="1" width="216" height="287" style="pointer-events:none"/>
  <!-- shadow: motion.ellipse, pointer-events:none -->
  <!-- ball: motion.g wrapping ball.svg, pointer-events:all (slingshot grab) -->
</svg>
```

**`pointer-events` matter.** The goal `<image>`s are rectangular boxes whose
transparent corners overlap the field; without `pointer-events:none` they swallow
hover/drag near the goals and "hover stops working in the corners." Only the
hit-zones and the ball receive pointer events.

Element positions (verified against `Scene.svg`):

- **Calendar** placed at offset `(79, 3)`, native `1398×354`.
- **Left goal** at `(0, 0)`, native `215×279`. Mouth (opening, faces right toward field) at **x ≈ 215**, spanning y ≈ `[0, 276]`.
- **Right goal** at `(1340, 1)`, native `216×287`. Mouth (faces left) at **x ≈ 1340**.
- **Field quad** (the 7×5 playing grid) corners: back-left `(245, 25)`, back-right `(1310, 25)`, front-left `(80, 354)`, front-right `(1475, 354)`.
- Artist's static ball rests at center `(611.9, 88.5)`; we instead initialize at the computed center cell (below). Ignore the baked ball.

Z-order note: render goals *after* highlights/hit-zones so the ball can visually
disappear into the net on a goal. (Optional polish: split each goal into back-posts
behind the ball layer and front-net in front.)

---

## 3. Coordinate system — solved

The pitch is a true one-point-perspective trapezoid (the homography below predicts
the drawn grid lines to ~1–2px). Geometry as a paste-ready module:

### `pitchGeometry.ts`

```ts
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
  col: number; row: number;
  cx: number; cy: number;        // center, scene coords
  scale: number;                 // 0.806 (back row) → 1.0 (front row)
  corners: [number, number][];   // 4 pts for the invisible hit-polygon
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
export const leftEdgeX  = (y: number) => 245 + (80   - 245) * (y - 25) / (354 - 25);
export const rightEdgeX = (y: number) => 1310 + (1475 - 1310) * (y - 25) / (354 - 25);

// Goal scoring zones (generous; tune against the art).
export const GOALS = {
  left:  { plane: 215,  yMin: 40, yMax: 250, dir: -1 as const },
  right: { plane: 1340, yMin: 40, yMax: 250, dir: 1 as const },
};
// Did the ball (scene coords) cross into a goal mouth this frame?
export const goalHit = (x: number, y: number) =>
  (x <= GOALS.left.plane  && y > GOALS.left.yMin  && y < GOALS.left.yMax)  ? "left"  :
  (x >= GOALS.right.plane && y > GOALS.right.yMin && y < GOALS.right.yMax) ? "right" : null;
```

### Reference cell centers (sanity-check the code)

```
row0 sc 0.806: (310,51) (466,51) (622,51) (778,51) (933,51) (1089,51) (1245,51)
row1 sc 0.847: (286,106)(450,106)(614,106)(777,106)(941,106)(1105,106)(1269,106)
row2 sc 0.893: (260,167)(432,167)(605,167)(778,167)(950,167)(1123,167)(1295,167)
row3 sc 0.943: (230,236)(413,236)(595,236)(777,236)(960,236)(1142,236)(1325,236)
row4 sc 1.000: (198,312)(391,312)(584,312)(778,312)(971,312)(1164,312)(1357,312)
```

---

## 4. Component structure

```
components/hero/
  CupCalHero.tsx       // "CupCal" gold wordmark + tagline, CTA, mounts the field
  PitchField.tsx       // root SVG: images, highlights, hit-zones, goals, shadow, ball
  useBall.ts           // motion values + behaviors (follow, hop, slingshot, idle)
  pitchGeometry.ts     // section 3
  palette.ts           // section 6
  useReducedMotion.ts
```

Install `framer-motion` (v11+; the `motion` package alias is equivalent). Use
`LazyMotion` + `m` (`domAnimation`) to trim bundle. Animate SVG elements with
`m.g` / `m.ellipse` / `m.polygon` driven by `useMotionValue` + `animate()`; the
slingshot flight is a manual `requestAnimationFrame` loop for precise goal/wall
detection (don't fight the spring engine for that part).

---

## 5. Behaviors

### 5.0 Rendering & input plumbing (read first — easy to get wrong)

**Units.** All geometry *and all physics constants* (`V_MAX`, `MAX_PULL`, `HOP_H`,
speeds, distances) are in **scene units** (the `0 0 1556 360` space), never screen
pixels. This makes the toy resolution-independent. The SVG scales these to pixels
for free.

**Pointer input must be converted to scene coords.** `pointerdown/move` give client
pixels; convert before computing drag vectors or velocities:
```ts
function clientToScene(svg: SVGSVGElement, e: PointerEvent): [number, number] {
  const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
  const m = svg.getScreenCTM()!.inverse();
  const r = p.matrixTransform(m); return [r.x, r.y];
}
```
Mixing pixel deltas with scene-unit constants is the classic bug here — the shot
will feel wildly different at different window sizes. Don't.

**Anchor model (matches the artwork).** The ball's logical position is its **ground
point** `G = (bx, by)` — the point on the pitch where its shadow sits. At rest the
ball pokes *up* out of the cell (see the mockups: shadow in the cell, ball above it).
Three motion values: `bx`, `by` (ground point), `lift` (extra height during a hop).

- **Shadow** ellipse centered exactly at `G`, scaled by cell scale `s`, and it
  *ignores* `lift` (it's the ground projection). Draw it directly, don't import the
  file: `rx = 40·s`, `ry = 7·s`; fade/shrink as `lift` grows
  (`opacity = 0.4·(1 − lift/260)`, `rx·=(1 − lift/520)`).
- **Ball** center sits at `(bx, by − (REST_RISE·s + lift))`, `REST_RISE ≈ 34`
  (one ball-radius; from the art the ball rests ~34u above its shadow). Render via a
  group whose transform maps `ball.svg`'s own center `(37.5, 38)` to that point:
  ```
  transform = `translate(${bx}px, ${by - (34*s + lift)}px) scale(${s}) translate(-37.5px, -38px)`
  ```
  Because we translate by the ball's center first, `scale` grows it from its center —
  not the SVG origin. Getting this order wrong makes the ball lurch when it scales.
  **Units gotcha (verified):** Framer Motion renders `m.g` transforms as CSS, where
  `translate()` requires length units — use `px` on every translate (as above). With
  unitless SVG-style values the browser silently drops the transform and the ball
  sticks at the SVG origin while the shadow (plain `cx`/`cy` attrs) moves correctly.
- **Squash/stretch** must pivot at the ball's **bottom** (contact), not its center, or
  it looks like it shrinks mid-air. Apply it as an inner wrapper `<g>` with
  `transform-origin: 37.5px 76px; transform-box: fill-box`.

`scaleAtY(by)` uses the **ground y**, never `by − lift` (a high lob must not shrink
the ball).

### 5.1 Ball state machine (behaviors are mutually exclusive)

The ball is always in exactly one mode; transitions disable the others (e.g.
spring-follow must NOT run during a shot):

```
IDLE ──(pointer enters field, desktop)──▶ FOLLOW
IDLE ──(tap cell, touch)──────────────────▶ FOLLOW (one hop) ──▶ IDLE
FOLLOW/IDLE ──(pointerdown on ball + drag past threshold)──▶ AIM
AIM ──(release)──▶ FLIGHT ──(goal)──▶ CELEBRATE ──▶ IDLE
                          └─(stops / off pitch)──▶ IDLE
any ──(4s no interaction)──▶ IDLE (auto-demo resumes)
```
Implement as a `mode` ref/state in `useBall`. The rAF flight loop runs only in
FLIGHT; the spring-follow target updates only in FOLLOW.

Ball display: ball radius ≈ `34·s` (front-row ~68px). Shadow as above.

### 5a. Hover → hop (desktop)
- `bx,by` **spring-follow** the hovered cell center (`stiffness 260, damping 26`).
  Interrupts gracefully — do **not** restart a fixed animation per `pointerenter`
  (stutters when sweeping).
- **Hop**: on settle over a cell (~80ms debounce), drive `t:0→1` over ~380ms,
  `lift = HOP_H · cell.scale · 4t(1−t)`, `HOP_H ≈ 70` (×1.4 for long jumps).
- **Squash/stretch** at takeoff/landing (`scaleY 0.85 / scaleX 1.15`, settle 120ms).
- On land: light that cell (5c), add ball spin ∝ travel.

### 5b. Slingshot (the shot — replayable toy, desktop + touch; NOT wired to nav)
1. **Grab** `onPointerDown` on the ball. Drag vs tap via ~8–10px threshold (tap on a
   *cell* hops there; tap on the ball does nothing/tiny hop).
2. **Aim** while dragging, ball stays put; render the **required** aim guide — dotted
   line in launch direction (opposite drag) + power indicator. `power = clamp(dragDist,
   0, MAX_PULL≈260)`.
3. **Release** → launch, begin rAF flight (all in scene units):
   ```
   v = dragDirReversed * (power/MAX_PULL) * V_MAX   // V_MAX ≈ 2600 scene-units/s
   each frame(dt):                                   // dt in seconds, clamp to ~1/30
     v *= FRICTION                                   // ~0.992 per ~16ms frame
     bx += v.x*dt; by += v.y*dt
     s = scaleAtY(by)
     const g = goalHit(bx, by)                       // helper in pitchGeometry.ts
     if (g) → CELEBRATE(g); stop loop
     else if (bx < leftEdgeX(by) || bx > rightEdgeX(by)) { v.x *= -RESTITUTION; clamp bx to edge; squash }
     else if (by < 25 || by > 354)                  { v.y *= -RESTITUTION; clamp by; squash }
     if (|v| < V_MIN) → settle at current cell-ish spot; mode = IDLE
   ```
   During FLIGHT the ball has `lift = 0` (it rolls on the plane); the arc is read via
   depth scaling and the shrink toward the goal, not a vertical hop. Ball spin
   (rotating `ball.svg`) is **optional** and subtle — the ink shading has a fixed light
   direction, so heavy spin looks odd; if used, `rotation += |v|·0.02`.

### 5c. Cell highlights
Each cell has a fixed palette color (section 6). **Single active cell**: on land,
animate that cell's `fillOpacity` 0→0.55 (~150ms) and the previous one →0. Purely
decorative per-cell hue, no semantic states.

### 5d. Idle / attract loop (also the mobile experience)
- On mount: ball auto-hops a random sequence of cells (lighting each), and every few
  hops performs a scripted slingshot at a goal (5e), then loops.
- **Pauses** on any field `pointerdown`/`pointermove`; resumes after ~4s idle.
- **Touch**: tap a cell → hop there; drag the ball → slingshot. Loop fills the gaps.

### 5e. Goal celebration
Nets are flat shapes → ripple = a quick **scale-pulse/skew of the whole net group**
(`scaleX 1→1.12→1`, `skewX ±4°`, settle ~350ms) — not a per-strand mesh ripple.
Add a goal flash, optional "GOAL!" stamp, tiny screen shake (±4px, 200ms), then
reset ball to `REST_CELL` after ~900ms.

### 5f. Accessibility / perf (do not skip)
- `prefers-reduced-motion`: **no idle loop, no hops, no flight.** The ball sits at
  `REST_CELL`. Hover (desktop) or tap (touch) just cross-fades the cell highlight
  on/off and snaps the ball to that cell with no arc. A "goal" (keyboard/tap) is a
  static flash, no shake. This is the full mobile experience too when reduced-motion
  is on — don't leave touch users with a frozen scene.
- **Keyboard**: arrows move active cell (hop), Enter/Space shoots at nearer goal;
  hit-zones focusable via roving `tabIndex`. The CTA button works regardless.
- Transform/opacity only (GPU); one rAF loop max; pause all animation off-screen
  (`IntersectionObserver`).

---

## 6. Palette — `palette.ts`

```ts
export const PALETTE = [
  "#E0A82E", "#10B981", "#38A8E0", "#F2683C", "#7C6BE8", "#14B8A6", "#EC5B86",
];
// Neighbors always differ (rotate by 3 each row):
export const cellColor = (col: number, row: number) =>
  PALETTE[(col + row * 3) % PALETTE.length];
```

Fills at ~0.55 opacity over the white paper. Gold + emerald are the brand anchors.

---

## 7. Phased build plan
1. **Static + geometry**: composite SVG (calendar + 2 goals), 35 hit-polygons from
   `CELLS`, log cell on hover/tap. Verify alignment by temporarily giving the
   hit-polygons a visible stroke (`stroke="red" fill="none"`) — they should trace the
   drawn grid — then set `fill="transparent" stroke="none"`.
2. **Ball + shadow placement**: spring-follow with depth scaling; tracking/fading shadow.
3. **Hop + squash** (5a).
4. **Highlights** (5c).
5. **Idle loop + mobile tap** (5d).
6. **Slingshot** (5b + 5e): drag, aim guide, rAF flight, goal/wall detection, net
   pulse + celebration + reset. *(Largest phase.)*
7. **A11y + perf + polish** (5f): reduced-motion, keyboard, IntersectionObserver,
   `LazyMotion`, tuning.

## 8. Locked decisions
- Shot = **drag slingshot** (aim + power), replayable, separate from the CTA.
- Highlights = **per-cell palette color, single active cell**, no semantics.
- Mobile = **auto-demo loop + tap-to-hop**.
- Net reaction = **scale-pulse** (flat-shape nets).

## 9. Tuning constants (start here, tune by feel)
`HOP_H 70` · `V_MAX 2600` · `FRICTION 0.992` · `RESTITUTION 0.6` · `MAX_PULL 260`
· `V_MIN ~40` · highlight opacity `0.55` · `REST_RISE 34` · front-row ball radius
`~34`. Goal scoring zones in `GOALS` are generous — narrow them if shots feel too easy.

## 10. Responsive — ⚠️ NEEDS A DECISION

The art is a fixed **4.3:1** band (`1556×360`). With `meet`, at a 380px-wide phone
it renders only **~88px tall**, and the back-row cells become ~12px — too small to
tap and visually slight for a hero centerpiece. This is the one open design issue,
and mobile is the priority surface.

Default in this spec (lowest effort, ship-ready): on mobile, treat the band as a
**decorative animated strip** — the auto-demo loop (5d) is the star (ball hopping +
shooting, no precise input needed), the headline sits above it and the primary CTA
button below. Tap-to-hop still works but isn't relied upon. Acceptable, but the band
is short.

If that feels too minor for the hero, the alternative needs **new art from the
designer**: a portrait/cropped mobile composition (e.g. a steeper, taller pitch
showing ~3 columns × 5 rows with both goals, ~1:1). Don't fake it by cropping the
wide viewBox — you'd lose the goals (and the shot). Flagging for the user rather
than guessing.

Desktop/tablet: full scene with `meet` is fine.

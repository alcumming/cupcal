"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionValue, animate, type MotionValue } from "framer-motion";
import {
  CELLS,
  REST_CELL,
  type Cell,
  scaleAtY,
  leftEdgeX,
  rightEdgeX,
  goalHit,
} from "./pitchGeometry";

// ---- Tuning constants (docs/cupcal-hero-spec.md §9) ----------------------
export const HOP_H = 70;
export const V_MAX = 2600; // scene-units / s
export const FRICTION = 0.992; // per ~16ms frame
export const RESTITUTION = 0.6;
export const MAX_PULL = 260;
export const V_MIN = 40;
export const REST_RISE = 34;
export const HIGHLIGHT_OPACITY = 0.55;

const IDLE_TIMEOUT_MS = 4000;
const HOP_DURATION_MS = 380;
const SQUASH_SETTLE_MS = 120;
const NET_PULSE_MS = 350;
const SCREEN_SHAKE_MS = 200;
const CELEBRATE_RESET_MS = 900;
const GOAL_SINK_MS = 250;
const GOAL_SINK_DEPTH = 90;
const RESET_FADE_MS = 250;

export type Mode = "idle" | "follow" | "aim" | "flight" | "celebrate";

export interface AimGuide {
  // launch direction unit vector (opposite of drag)
  dirX: number;
  dirY: number;
  power: number; // 0..MAX_PULL
}

export interface BallApi {
  bx: MotionValue<number>;
  by: MotionValue<number>;
  lift: MotionValue<number>;
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  rotation: MotionValue<number>;
  opacity: MotionValue<number>;
  activeCell: number | null; // index into CELLS, or null
  aim: AimGuide | null;
  goalFlash: "left" | "right" | null;
  goalStamp: boolean;
  shake: boolean;
  netPulse: "left" | "right" | null;
  mode: Mode;
  // Event handlers wired up by PitchField
  onFieldPointerEnter: () => void;
  onFieldPointerLeave: () => void;
  onCellHover: (cellIndex: number) => void;
  onCellTap: (cellIndex: number) => void;
  onBallPointerDown: (clientX: number, clientY: number) => void;
  onPointerMove: (clientX: number, clientY: number, scenePt: [number, number]) => void;
  onPointerUp: () => void;
  // Keyboard support
  moveActive: (dCol: number, dRow: number) => void;
  shootActive: () => void;
}

/**
 * Core ball state machine + motion values for the CupCal hero.
 * See docs/cupcal-hero-spec.md §5 for the full behavior spec.
 */
export function useBall(reducedMotion: boolean, paused: boolean, autoPlay: boolean): BallApi {
  const bx = useMotionValue(REST_CELL.cx);
  const by = useMotionValue(REST_CELL.cy);
  const lift = useMotionValue(0);
  const scaleX = useMotionValue(1);
  const scaleY = useMotionValue(1);
  const rotation = useMotionValue(0);
  const opacity = useMotionValue(1);

  const [activeCell, setActiveCell] = useState<number | null>(REST_CELL.row * 7 + REST_CELL.col);
  const [aim, setAim] = useState<AimGuide | null>(null);
  const [goalFlash, setGoalFlash] = useState<"left" | "right" | null>(null);
  const [goalStamp, setGoalStamp] = useState(false);
  const [shake, setShake] = useState(false);
  const [netPulse, setNetPulse] = useState<"left" | "right" | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const activeRowColRef = useRef<{ row: number; col: number }>({
    row: REST_CELL.row,
    col: REST_CELL.col,
  });

  const modeRef = useRef<Mode>("idle");
  const setModeBoth = (m: Mode) => {
    modeRef.current = m;
    setMode(m);
  };

  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hopDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragStartRef = useRef<[number, number] | null>(null);
  const dragCurrentRef = useRef<[number, number] | null>(null);
  const draggedPastThresholdRef = useRef(false);

  // Forward refs to break circular dependencies between callbacks that are
  // declared in terms of one another (runDemoStep <-> scheduleIdleResume,
  // and startCelebration/flight -> scheduleIdleResume).
  const runDemoStepRef = useRef<() => void>(() => {});
  const scheduleIdleResumeRef = useRef<() => void>(() => {});

  const cancelRaf = () => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const clearIdleTimer = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  const clearDemoTimer = () => {
    if (demoTimerRef.current) {
      clearTimeout(demoTimerRef.current);
      demoTimerRef.current = null;
    }
  };

  // ---- Highlight ----------------------------------------------------------
  const lightCell = useCallback((cellIndex: number) => {
    setActiveCell(cellIndex);
    const c = CELLS[cellIndex];
    activeRowColRef.current = { row: c.row, col: c.col };
  }, []);

  // ---- Squash/stretch helper -----------------------------------------------
  const squash = useCallback((sx: number, sy: number) => {
    animate(scaleX, sx, { duration: 0.06 });
    animate(scaleY, sy, { duration: 0.06 });
    setTimeout(() => {
      animate(scaleX, 1, { duration: SQUASH_SETTLE_MS / 1000 });
      animate(scaleY, 1, { duration: SQUASH_SETTLE_MS / 1000 });
    }, 60);
  }, [scaleX, scaleY]);

  // ---- Hop (5a) -------------------------------------------------------------
  const hopTo = useCallback(
    (cell: Cell, opts?: { onDone?: () => void }) => {
      if (reducedMotion) {
        bx.set(cell.cx);
        by.set(cell.cy);
        lift.set(0);
        lightCell(cell.row * 7 + cell.col);
        opts?.onDone?.();
        return;
      }

      const startX = bx.get();
      const startY = by.get();
      const dist = Math.hypot(cell.cx - startX, cell.cy - startY);
      const longJump = dist > 250;
      const hopH = HOP_H * cell.scale * (longJump ? 1.4 : 1);

      squash(1.15, 0.85); // takeoff

      const start = performance.now();
      const duration = HOP_DURATION_MS;

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        bx.set(startX + (cell.cx - startX) * t);
        by.set(startY + (cell.cy - startY) * t);
        lift.set(hopH * 4 * t * (1 - t));
        rotation.set(rotation.get() + dist * 0.02 * (t < 1 ? 1 / 60 : 0));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          lift.set(0);
          squash(0.85, 1.15); // landing
          lightCell(cell.row * 7 + cell.col);
          opts?.onDone?.();
        }
      };
      cancelRaf();
      rafRef.current = requestAnimationFrame(step);
    },
    [bx, by, lift, rotation, reducedMotion, squash, lightCell],
  );

  // ---- Spring-follow target (FOLLOW mode) ------------------------------------
  const followTargetRef = useRef<Cell | null>(null);

  const goToCell = useCallback(
    (cell: Cell) => {
      followTargetRef.current = cell;
      const xAnim = animate(bx, cell.cx, { type: "spring", stiffness: 260, damping: 26 });
      const yAnim = animate(by, cell.cy, { type: "spring", stiffness: 260, damping: 26 });

      if (hopDebounceRef.current) clearTimeout(hopDebounceRef.current);
      hopDebounceRef.current = setTimeout(() => {
        if (modeRef.current !== "follow") return;
        if (followTargetRef.current !== cell) return;
        // settled — small hop in place to mark the cell
        const hopH = HOP_H * cell.scale * 0.5;
        squash(1.1, 0.92);
        const start = performance.now();
        const dur = 220;
        const liftStep = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          lift.set(hopH * 4 * t * (1 - t));
          if (t < 1) {
            requestAnimationFrame(liftStep);
          } else {
            lift.set(0);
          }
        };
        requestAnimationFrame(liftStep);
        lightCell(cell.row * 7 + cell.col);
      }, 80);

      return () => {
        xAnim.stop();
        yAnim.stop();
      };
    },
    [bx, by, lift, squash, lightCell],
  );

  // ---- Slingshot flight (5b) --------------------------------------------------
  const startCelebration = useCallback(
    (goal: "left" | "right") => {
      setModeBoth("celebrate");
      setGoalFlash(goal);
      setGoalStamp(true);
      setNetPulse(goal);
      setShake(true);

      setTimeout(() => setShake(false), SCREEN_SHAKE_MS);
      setTimeout(() => setNetPulse(null), NET_PULSE_MS);

      setTimeout(() => {
        setGoalFlash(null);
        setGoalStamp(false);
        bx.set(REST_CELL.cx);
        by.set(REST_CELL.cy);
        lift.set(0);
        rotation.set(0);
        scaleX.set(1);
        scaleY.set(1);
        lightCell(REST_CELL.row * 7 + REST_CELL.col);
        animate(opacity, 1, { duration: RESET_FADE_MS / 1000 });
        setModeBoth("idle");
        scheduleIdleResumeRef.current();
      }, CELEBRATE_RESET_MS);
    },
    [bx, by, lift, rotation, scaleX, scaleY, opacity, lightCell],
  );

  const flight = useCallback(
    (vx0: number, vy0: number) => {
      setModeBoth("flight");
      lift.set(0);
      let vx = vx0;
      let vy = vy0;
      let last = performance.now();

      const step = (now: number) => {
        const dt = Math.min(1 / 30, (now - last) / 1000);
        last = now;

        vx *= FRICTION;
        vy *= FRICTION;

        let x = bx.get() + vx * dt;
        let y = by.get() + vy * dt;

        const g = goalHit(x, y);
        if (g) {
          bx.set(x);
          by.set(y);
          // Sink the ball into the net — keep travelling along its current
          // line, shrinking and fading — instead of stopping at the goal mouth.
          const dirLen = Math.hypot(vx, vy) || 1;
          const ndx = vx / dirLen;
          const ndy = vy / dirLen;
          const targetX = x + ndx * GOAL_SINK_DEPTH;
          const targetY = Math.min(250, Math.max(40, y + ndy * GOAL_SINK_DEPTH * 0.4));
          animate(bx, targetX, { duration: GOAL_SINK_MS / 1000, ease: "easeIn" });
          animate(by, targetY, { duration: GOAL_SINK_MS / 1000, ease: "easeIn" });
          animate(opacity, 0, { duration: GOAL_SINK_MS / 1000 * 0.9, ease: "easeIn" });
          animate(scaleX, 0.55, { duration: GOAL_SINK_MS / 1000, ease: "easeIn" });
          animate(scaleY, 0.55, { duration: GOAL_SINK_MS / 1000, ease: "easeIn" });
          startCelebration(g);
          return;
        }

        const lEdge = leftEdgeX(y);
        const rEdge = rightEdgeX(y);
        if (x < lEdge || x > rEdge) {
          vx *= -RESTITUTION;
          x = x < lEdge ? lEdge : rEdge;
          squash(1.15, 0.85);
        }
        if (y < 25 || y > 354) {
          vy *= -RESTITUTION;
          y = y < 25 ? 25 : 354;
          squash(1.15, 0.85);
        }

        bx.set(x);
        by.set(y);
        const s = scaleAtY(y);
        rotation.set(rotation.get() + Math.hypot(vx, vy) * 0.02 * dt);

        const speed = Math.hypot(vx, vy);
        if (speed < V_MIN) {
          // settle: find nearest cell-ish, light it
          let nearest = 0;
          let best = Infinity;
          for (let i = 0; i < CELLS.length; i++) {
            const c = CELLS[i];
            const d = Math.hypot(c.cx - x, c.cy - y);
            if (d < best) {
              best = d;
              nearest = i;
            }
          }
          lightCell(nearest);
          void s;
          setModeBoth("idle");
          scheduleIdleResumeRef.current();
          return;
        }

        rafRef.current = requestAnimationFrame(step);
      };

      cancelRaf();
      rafRef.current = requestAnimationFrame(step);
    },
    [bx, by, lift, rotation, scaleX, scaleY, opacity, squash, lightCell, startCelebration],
  );

  // ---- Idle / attract loop (5d) -------------------------------------------------
  const runDemoStep = useCallback(() => {
    if (modeRef.current !== "idle") return;

    // Occasionally do a scripted slingshot at a goal.
    const doShot = Math.random() < 0.22;

    if (doShot) {
      const toLeft = Math.random() < 0.5;
      const cell = CELLS[REST_CELL.row * 7 + REST_CELL.col];
      // Aim the ball at REST_CELL first, then shoot.
      hopTo(cell, {
        onDone: () => {
          if (modeRef.current !== "idle") return;
          const dir = toLeft ? -1 : 1;
          const power = MAX_PULL * (0.75 + Math.random() * 0.25);
          const speed = (power / MAX_PULL) * V_MAX;
          const vy = (Math.random() - 0.5) * speed * 0.3;
          flight(dir * speed, vy);
        },
      });
    } else {
      const next = Math.floor(Math.random() * CELLS.length);
      hopTo(CELLS[next], {
        onDone: () => {
          if (modeRef.current !== "idle") return;
          demoTimerRef.current = setTimeout(() => runDemoStepRef.current(), 700);
        },
      });
      return;
    }
  }, [hopTo, flight]);

  const scheduleIdleResume = useCallback(() => {
    clearIdleTimer();
    idleTimerRef.current = setTimeout(() => {
      if (modeRef.current === "idle" || modeRef.current === "follow") {
        setModeBoth("idle");
        if (autoPlay) {
          clearDemoTimer();
          demoTimerRef.current = setTimeout(() => runDemoStepRef.current(), 300);
        }
      }
    }, IDLE_TIMEOUT_MS);
  }, [autoPlay]);

  useEffect(() => {
    runDemoStepRef.current = runDemoStep;
  }, [runDemoStep]);

  useEffect(() => {
    scheduleIdleResumeRef.current = scheduleIdleResume;
  }, [scheduleIdleResume]);

  // Kick off the idle/attract loop on mount, and whenever it's resumed after pause.
  useEffect(() => {
    if (reducedMotion || !autoPlay) return;
    if (paused) {
      clearDemoTimer();
      clearIdleTimer();
      cancelRaf();
      return;
    }
    // Start demo loop shortly after mount.
    clearDemoTimer();
    demoTimerRef.current = setTimeout(() => {
      if (modeRef.current === "idle") runDemoStepRef.current();
    }, 600);

    return () => {
      clearDemoTimer();
      clearIdleTimer();
    };
  }, [reducedMotion, paused, autoPlay]);

  useEffect(() => () => cancelRaf(), []);

  // ---- Pause/resume on field interaction -----------------------------------------
  const pauseDemo = useCallback(() => {
    clearDemoTimer();
    cancelRaf();
  }, []);

  // ---- Hover handlers (5a) ---------------------------------------------------------
  const onFieldPointerEnter = useCallback(() => {
    if (reducedMotion) return;
    pauseDemo();
    clearIdleTimer();
    if (modeRef.current === "idle" || modeRef.current === "follow") {
      setModeBoth("follow");
    }
  }, [reducedMotion, pauseDemo]);

  const onFieldPointerLeave = useCallback(() => {
    if (reducedMotion) return;
    if (modeRef.current === "follow") {
      setModeBoth("idle");
      scheduleIdleResume();
    }
  }, [reducedMotion, scheduleIdleResume]);

  const onCellHover = useCallback(
    (cellIndex: number) => {
      if (reducedMotion) {
        const c = CELLS[cellIndex];
        bx.set(c.cx);
        by.set(c.cy);
        lightCell(cellIndex);
        return;
      }
      if (modeRef.current !== "follow") return;
      goToCell(CELLS[cellIndex]);
    },
    [reducedMotion, goToCell, bx, by, lightCell],
  );

  const onCellTap = useCallback(
    (cellIndex: number) => {
      pauseDemo();
      clearIdleTimer();
      const cell = CELLS[cellIndex];
      if (reducedMotion) {
        bx.set(cell.cx);
        by.set(cell.cy);
        lightCell(cellIndex);
        return;
      }
      if (modeRef.current === "aim" || modeRef.current === "flight") return;
      setModeBoth("follow");
      hopTo(cell, {
        onDone: () => {
          setModeBoth("idle");
          scheduleIdleResume();
        },
      });
    },
    [pauseDemo, reducedMotion, bx, by, lightCell, hopTo, scheduleIdleResume],
  );

  // ---- Slingshot grab/aim/release (5b) -------------------------------------------------
  const onBallPointerDown = useCallback(
    (clientX: number, clientY: number) => {
      pauseDemo();
      clearIdleTimer();
      cancelRaf();
      dragStartRef.current = [clientX, clientY];
      dragCurrentRef.current = [clientX, clientY];
      draggedPastThresholdRef.current = false;
    },
    [pauseDemo],
  );

  const onPointerMove = useCallback(
    (clientX: number, clientY: number, scenePt: [number, number]) => {
      if (!dragStartRef.current) {
        // Hover-follow path is handled by onCellHover via hit-zones; nothing here.
        return;
      }
      dragCurrentRef.current = [clientX, clientY];
      const [sx, sy] = dragStartRef.current;
      const dx = clientX - sx;
      const dy = clientY - sy;
      const dist = Math.hypot(dx, dy);

      if (!draggedPastThresholdRef.current && dist > 9) {
        draggedPastThresholdRef.current = true;
        if (reducedMotion) return;
        setModeBoth("aim");
      }

      if (draggedPastThresholdRef.current) {
        if (reducedMotion) return;
        // Aim guide: launch direction is opposite of drag.
        const dirLen = Math.hypot(dx, dy) || 1;
        const dirX = -dx / dirLen;
        const dirY = -dy / dirLen;
        const power = Math.min(MAX_PULL, dist);
        setAim({ dirX, dirY, power });
        void scenePt;
      }
    },
    [reducedMotion],
  );

  const onPointerUp = useCallback(() => {
    if (!dragStartRef.current) return;
    const start = dragStartRef.current;
    const current = dragCurrentRef.current ?? start;
    const wasDrag = draggedPastThresholdRef.current;
    dragStartRef.current = null;
    dragCurrentRef.current = null;
    draggedPastThresholdRef.current = false;

    if (!wasDrag) {
      // Tap on the ball: tiny hop or nothing.
      scheduleIdleResume();
      return;
    }

    if (reducedMotion) {
      setAim(null);
      scheduleIdleResume();
      return;
    }

    const dx = current[0] - start[0];
    const dy = current[1] - start[1];
    const dist = Math.hypot(dx, dy);
    const dirLen = dist || 1;
    const dirX = -dx / dirLen;
    const dirY = -dy / dirLen;
    const power = Math.min(MAX_PULL, dist);
    setAim(null);

    if (power < 8) {
      setModeBoth("idle");
      scheduleIdleResume();
      return;
    }

    const speed = (power / MAX_PULL) * V_MAX;
    flight(dirX * speed, dirY * speed);
  }, [reducedMotion, flight, scheduleIdleResume]);

  // ---- Keyboard support -----------------------------------------------------------------
  const moveActive = useCallback(
    (dCol: number, dRow: number) => {
      pauseDemo();
      clearIdleTimer();
      const prev = activeRowColRef.current;
      const col = Math.min(6, Math.max(0, prev.col + dCol));
      const row = Math.min(4, Math.max(0, prev.row + dRow));
      activeRowColRef.current = { col, row };
      const cell = CELLS[row * 7 + col];
      if (reducedMotion) {
        bx.set(cell.cx);
        by.set(cell.cy);
        lightCell(row * 7 + col);
      } else {
        setModeBoth("follow");
        hopTo(cell, {
          onDone: () => {
            setModeBoth("idle");
            scheduleIdleResume();
          },
        });
      }
    },
    [pauseDemo, reducedMotion, bx, by, lightCell, hopTo, scheduleIdleResume],
  );

  const shootActive = useCallback(() => {
    pauseDemo();
    clearIdleTimer();
    if (reducedMotion) {
      // Static flash toward the nearer goal, no shake/arc.
      const goal = bx.get() < REST_CELL.cx ? "left" : "right";
      setGoalFlash(goal);
      setGoalStamp(true);
      setTimeout(() => {
        setGoalFlash(null);
        setGoalStamp(false);
      }, 500);
      return;
    }
    if (modeRef.current === "aim" || modeRef.current === "flight") return;
    const goal: "left" | "right" = bx.get() < REST_CELL.cx ? "left" : "right";
    const dir = goal === "left" ? -1 : 1;
    flight(dir * V_MAX * 0.85, 0);
  }, [pauseDemo, reducedMotion, bx, flight]);

  return {
    bx,
    by,
    lift,
    scaleX,
    scaleY,
    rotation,
    opacity,
    activeCell,
    aim,
    goalFlash,
    goalStamp,
    shake,
    netPulse,
    mode,
    onFieldPointerEnter,
    onFieldPointerLeave,
    onCellHover,
    onCellTap,
    onBallPointerDown,
    onPointerMove,
    onPointerUp,
    moveActive,
    shootActive,
  };
}

export { CELLS, REST_CELL };
export type { Cell };

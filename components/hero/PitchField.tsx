"use client";

import { useCallback, useRef } from "react";
import { m, useMotionTemplate, useTransform } from "framer-motion";
import { VIEWBOX, CELLS, GOALS } from "./pitchGeometry";
import { cellColor } from "./palette";
import { useBall, MAX_PULL, REST_RISE } from "./useBall";
import { useReducedMotion } from "./useReducedMotion";
import { useCanHover } from "./useCanHover";

interface PitchFieldProps {
  paused: boolean;
}

function clientToScene(svg: SVGSVGElement, clientX: number, clientY: number): [number, number] {
  const p = svg.createSVGPoint();
  p.x = clientX;
  p.y = clientY;
  const m = svg.getScreenCTM();
  if (!m) return [0, 0];
  const inv = m.inverse();
  const r = p.matrixTransform(inv);
  return [r.x, r.y];
}

export default function PitchField({ paused }: PitchFieldProps) {
  const reducedMotion = useReducedMotion();
  const canHover = useCanHover();
  // Auto-play the attract loop only on touch devices; desktop relies on
  // user-triggered hover/aim/shoot interactions instead.
  const autoPlay = !canHover;
  const ball = useBall(reducedMotion, paused, autoPlay);
  const svgRef = useRef<SVGSVGElement>(null);

  const {
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
    onFieldPointerEnter,
    onFieldPointerLeave,
    onCellHover,
    onCellTap,
    onBallPointerDown,
    onPointerMove,
    onPointerUp,
    moveActive,
    shootActive,
  } = ball;

  // Derived motion values --------------------------------------------------
  const scale = useTransform(by, (y) => 0.806 + (1.0 - 0.806) * Math.min(1, Math.max(0, (y - 25) / (354 - 25))));

  // Ball center y = ground y - (REST_RISE * scale + lift)
  const ballCenterY = useTransform([by, lift, scale], (latest) => {
    const [yy, l, s] = latest as number[];
    return yy - (REST_RISE * s + l);
  });

  // Ball group transform: translate ball's own center (37.5, 38) to the
  // computed on-screen center, scale from there. Framer Motion renders SVG
  // `m.g` transforms as CSS `transform`, which requires length units on
  // translate() (unlike the SVG transform *attribute* syntax) — use `px`.
  const ballTransform = useMotionTemplate`translate(${bx}px, ${ballCenterY}px) scale(${scale}) translate(-37.5px, -38px)`;

  // Shadow geometry: ignores lift, fades/shrinks as lift grows.
  const shadowRx = useTransform([scale, lift], ([s, l]) => (s as number) * 40 * (1 - (l as number) / 520));
  const shadowRy = useTransform(scale, (s) => s * 7);
  const shadowOpacity = useTransform(lift, (l) => 0.4 * Math.max(0, 1 - l / 260));

  // Squash/stretch transform-origin is the ball's bottom (37.5, 76) in its own
  // viewBox coordinates — applied via an inner <g> with transform-box: fill-box.
  const squashTransform = useMotionTemplate`scaleX(${scaleX}) scaleY(${scaleY})`;
  const rotationTransform = useMotionTemplate`rotate(${rotation}deg)`;

  // Pointer plumbing ---------------------------------------------------------
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const scenePt = clientToScene(svg, e.clientX, e.clientY);
      onPointerMove(e.clientX, e.clientY, scenePt);
    },
    [onPointerMove],
  );

  const handleBallPointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      onBallPointerDown(e.clientX, e.clientY);
    },
    [onBallPointerDown],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      onPointerUp();
      void e;
    },
    [onPointerUp],
  );

  // IntersectionObserver pause is handled by the parent (CupCalHero) via `paused`.

  // Keyboard support: arrows move active cell, Enter/Space shoots.
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGSVGElement>) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          moveActive(-1, 0);
          break;
        case "ArrowRight":
          e.preventDefault();
          moveActive(1, 0);
          break;
        case "ArrowUp":
          e.preventDefault();
          moveActive(0, -1);
          break;
        case "ArrowDown":
          e.preventDefault();
          moveActive(0, 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          shootActive();
          break;
        default:
          break;
      }
    },
    [moveActive, shootActive],
  );

  // Aim guide geometry --------------------------------------------------------
  const aimLine = aim
    ? {
        x1: bx.get(),
        y1: by.get(),
        x2: bx.get() + aim.dirX * (aim.power * 1.4),
        y2: by.get() + aim.dirY * (aim.power * 1.4),
      }
    : null;

  return (
    <m.svg
      ref={svgRef}
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      preserveAspectRatio="xMidYMid meet"
      className="h-full w-full select-none touch-none outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 rounded-2xl"
      role="application"
      aria-label="Animated CupCal pitch. Use arrow keys to move the ball between calendar cells, Enter to shoot at goal."
      tabIndex={0}
      onPointerEnter={onFieldPointerEnter}
      onPointerLeave={onFieldPointerLeave}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      animate={shake ? { x: [0, -4, 4, -3, 3, 0], y: [0, 2, -2, 1, -1, 0] } : { x: 0, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background: calendar pitch */}
      <image
        href="/hero/calendar.svg"
        x={79}
        y={3}
        width={1398}
        height={354}
        style={{ pointerEvents: "none" }}
      />

      {/* Cell highlights (5c) */}
      {CELLS.map((cell, i) => {
        const color = cellColor(cell.col, cell.row);
        const isActive = activeCell === i;
        return (
          <m.polygon
            key={`hl-${i}`}
            points={cell.corners.map(([x, y]) => `${x},${y}`).join(" ")}
            fill={color}
            style={{ pointerEvents: "none" }}
            initial={{ fillOpacity: 0 }}
            animate={{ fillOpacity: isActive ? 0.55 : 0 }}
            transition={{ duration: 0.15 }}
          />
        );
      })}

      {/* Invisible hit-zones (5a/5d input) */}
      {CELLS.map((cell, i) => (
        <polygon
          key={`hz-${i}`}
          points={cell.corners.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="transparent"
          stroke="none"
          style={{ pointerEvents: "all", cursor: "pointer" }}
          onPointerEnter={() => onCellHover(i)}
          onPointerDown={() => onCellTap(i)}
        />
      ))}

      {/* Goals */}
      <m.image
        href="/hero/left-goal.svg"
        x={0}
        y={0}
        width={215}
        height={279}
        style={{ pointerEvents: "none", transformOrigin: "215px 140px" }}
        animate={
          netPulse === "left"
            ? { scaleX: [1, 1.12, 1], skewX: [0, -4, 0] }
            : { scaleX: 1, skewX: 0 }
        }
        transition={{ duration: 0.35 }}
      />
      <m.image
        href="/hero/right-goal.svg"
        x={1340}
        y={1}
        width={216}
        height={287}
        style={{ pointerEvents: "none", transformOrigin: "1340px 144px" }}
        animate={
          netPulse === "right"
            ? { scaleX: [1, 1.12, 1], skewX: [0, 4, 0] }
            : { scaleX: 1, skewX: 0 }
        }
        transition={{ duration: 0.35 }}
      />

      {/* Goal flash */}
      {goalFlash && (
        <m.rect
          x={goalFlash === "left" ? 0 : GOALS.right.plane}
          y={0}
          width={goalFlash === "left" ? GOALS.left.plane : VIEWBOX.w - GOALS.right.plane}
          height={VIEWBOX.h}
          fill="#ffffff"
          style={{ pointerEvents: "none" }}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* GOAL! stamp */}
      {goalStamp && (
        <m.text
          x={goalFlash === "left" ? GOALS.left.plane + 60 : GOALS.right.plane - 60}
          y={140}
          textAnchor="middle"
          fontSize={56}
          fontWeight={800}
          fill="#E0A82E"
          stroke="#171717"
          strokeWidth={2}
          style={{ pointerEvents: "none", fontFamily: "var(--font-geist-sans, sans-serif)" }}
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 1, 1], rotate: [-8, 4, 0, 0] }}
          transition={{ duration: 0.9, times: [0, 0.25, 0.5, 1] }}
        >
          GOAL!
        </m.text>
      )}

      {/* Aim guide (5b) */}
      {aim && aimLine && (
        <g style={{ pointerEvents: "none" }}>
          <line
            x1={aimLine.x1}
            y1={aimLine.y1}
            x2={aimLine.x2}
            y2={aimLine.y2}
            stroke="#171717"
            strokeWidth={3}
            strokeDasharray="6 8"
            strokeLinecap="round"
            opacity={0.55}
          />
          {(() => {
            const size = 9 + (aim.power / MAX_PULL) * 12;
            const angle = Math.atan2(aim.dirY, aim.dirX) * (180 / Math.PI);
            return (
              <polygon
                points={`${size * 1.4},0 ${-size * 0.6},${-size} ${-size * 0.6},${size}`}
                fill="#E0A82E"
                opacity={0.7}
                transform={`translate(${aimLine.x2} ${aimLine.y2}) rotate(${angle})`}
              />
            );
          })()}
        </g>
      )}

      {/* Shadow (ground projection — ignores lift) */}
      <m.ellipse
        cx={bx}
        cy={by}
        rx={shadowRx}
        ry={shadowRy}
        fill="black"
        opacity={shadowOpacity}
        style={{ pointerEvents: "none" }}
      />

      {/* Ball */}
      <m.g
        style={{ transform: ballTransform, touchAction: "none", opacity }}
        onPointerDown={handleBallPointerDown}
      >
        <m.g style={{ transform: rotationTransform, transformOrigin: "37.5px 38px" }}>
          <m.g
            style={{
              transform: squashTransform,
              transformOrigin: "37.5px 76px",
              transformBox: "fill-box",
              cursor: "grab",
            }}
          >
            <image href="/hero/ball.svg" x={0} y={0} width={75} height={76} style={{ pointerEvents: "all" }} />
          </m.g>
        </m.g>
      </m.g>
    </m.svg>
  );
}

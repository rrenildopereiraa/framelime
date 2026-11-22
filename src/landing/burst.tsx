import type { CSSProperties } from "react";
import { Lime } from "./lime.tsx";

/*
 * Laid out on the stage's 1240-wide design, then written in `cqw` so the
 * whole burst scales with the stage instead of drifting off the laptop.
 */
const DESIGN_WIDTH = 1240;
const cqw = (value: number) => `${((value / DESIGN_WIDTH) * 100).toFixed(3)}cqw`;

// Where the limes fly out from: the middle of the laptop.
const ORIGIN = { x: 620, y: 300 };

interface Flying {
  x: number;
  y: number;
  size: number;
  rotate: number;
  /** In front of the laptop and the cards, slightly blurred, for depth. */
  front?: boolean;
}

const LIMES: Flying[] = [
  { x: 70, y: -30, size: 200, rotate: -24 },
  { x: 990, y: -22, size: 180, rotate: 28 },
  { x: 112, y: 486, size: 124, rotate: -12, front: true },
  { x: 1160, y: 540, size: 108, rotate: 40 },
];

// Juice flung out with them: x, y and width.
const DROPS = [
  [330, -22, 14],
  [1150, 200, 12],
  [20, 140, 10],
  [900, 600, 16],
  [250, 610, 9],
  [1200, 40, 9],
] as const;

/** Three streaks behind a lime, pointing back at where it came from. */
function trails(lime: Flying): CSSProperties[] {
  const cx = lime.x + lime.size / 2;
  const cy = lime.y + lime.size / 2;
  const angle = Math.atan2(ORIGIN.y - cy, ORIGIN.x - cx);
  const length = Math.min(Math.hypot(ORIGIN.x - cx, ORIGIN.y - cy) * 0.7, lime.size * 1.5);
  const streaks = [
    { offset: 0, thickness: lime.size * 0.16, opacity: 0.55, reach: 1 },
    { offset: lime.size * 0.28, thickness: lime.size * 0.06, opacity: 0.4, reach: 0.7 },
    { offset: -lime.size * 0.28, thickness: lime.size * 0.06, opacity: 0.4, reach: 0.7 },
  ];
  return streaks.map((streak) => ({
    left: cqw(cx - Math.sin(angle) * streak.offset),
    top: cqw(cy + Math.cos(angle) * streak.offset - streak.thickness / 2),
    width: cqw(length * streak.reach),
    height: cqw(streak.thickness),
    transform: `rotate(${((angle * 180) / Math.PI).toFixed(1)}deg)`,
    opacity: streak.opacity,
  }));
}

/**
 * Limes bursting out from behind the laptop, with a starburst glow, motion
 * trails and a few drops of juice. Decorative, and only drawn from `lg` up.
 */
export function Burst() {
  return (
    <div aria-hidden="true" className="landing-burst">
      <div
        className="landing-glow"
        style={{
          left: cqw(ORIGIN.x - 560),
          top: cqw(ORIGIN.y - 400),
          width: cqw(1120),
          height: cqw(800),
        }}
      />
      {LIMES.map((lime, index) => (
        <div key={`${lime.x}-${lime.y}`} className={lime.front ? "landing-front" : undefined}>
          {trails(lime).map((style) => (
            <div key={`${style.top}`} className="landing-trail" style={style} />
          ))}
          <Lime
            id={`landing-lime-${index}`}
            className={`landing-lime ${lime.front ? "landing-lime-near" : ""}`}
            style={{
              left: cqw(lime.x),
              top: cqw(lime.y),
              width: cqw(lime.size),
              transform: `rotate(${lime.rotate}deg)`,
            }}
          />
        </div>
      ))}
      {DROPS.map(([x, y, size]) => (
        <div
          key={`${x}-${y}`}
          className="landing-drop"
          style={{ left: cqw(x), top: cqw(y), width: cqw(size), height: cqw(size * 1.25) }}
        />
      ))}
    </div>
  );
}

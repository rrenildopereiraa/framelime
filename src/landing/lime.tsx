import type { CSSProperties } from "react";

/** A lime slice: rind, pith, eight segments and a glint. Decorative. */
export function Lime({
  id,
  className,
  style,
}: {
  /** Prefix for the gradients' ids, unique on the page. */
  id: string;
  className?: string;
  style?: CSSProperties;
}) {
  const rind = `${id}-rind`;
  const flesh = `${id}-flesh`;
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className} style={style}>
      <defs>
        <radialGradient id={rind} cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#a3d932" />
          <stop offset="1" stopColor="#3f6d0a" />
        </radialGradient>
        <radialGradient id={flesh} cx=".42" cy=".38" r=".65">
          <stop offset="0" stopColor="#f4ffb8" />
          <stop offset="1" stopColor="#bfe82a" />
        </radialGradient>
      </defs>
      {/* The sticker's edge, white on light pages and dark on dark ones. */}
      <circle cx="60" cy="60" r="57" className="landing-sticker-edge" />
      <circle cx="60" cy="60" r="51" fill={`url(#${rind})`} />
      <circle cx="60" cy="60" r="44" fill="#f7fbe6" />
      <circle cx="60" cy="60" r="40" fill={`url(#${flesh})`} />
      <g stroke="#f7fbe6" strokeWidth="3.5" strokeLinecap="round">
        {SEGMENTS.map(([x, y]) => (
          <line key={`${x}-${y}`} x1="60" y1="60" x2={x} y2={y} />
        ))}
      </g>
      <circle cx="60" cy="60" r="6" fill="#f7fbe6" />
      <ellipse
        cx="44"
        cy="38"
        rx="14"
        ry="7"
        fill="#ffffff"
        opacity=".55"
        transform="rotate(-30 44 38)"
      />
    </svg>
  );
}

// Where each segment line meets the flesh's edge, every 45 degrees.
const SEGMENTS = Array.from({ length: 8 }, (_, index) => {
  const angle = (index * Math.PI) / 4;
  return [
    Math.round((60 + 40 * Math.cos(angle)) * 10) / 10,
    Math.round((60 + 40 * Math.sin(angle)) * 10) / 10,
  ] as const;
});

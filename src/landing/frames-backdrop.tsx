/** A frame's colors, sketched: page, tab strip, border and three token colors. */
interface Sketch {
  page: string;
  tab: string;
  border: string;
  tokens: [string, string, string];
}

// Framelime's themes, as their frames look: Lime, Eclipsa, Amber and Default.
const LIME: Sketch = {
  page: "#141512",
  tab: "#0e0f0d",
  border: "#2a2b26",
  tokens: ["#d4ff3a", "#a8e6a3", "#8fd8c6"],
};
const ECLIPSA: Sketch = {
  page: "#21243f",
  tab: "#151724",
  border: "#31365e",
  tokens: ["#9595e3", "#bec6f2", "#dda2f6"],
};
const AMBER: Sketch = {
  page: "#1d1710",
  tab: "#15110b",
  border: "#3a2e1c",
  tokens: ["#f5b84a", "#f0a35e", "#e9d6a8"],
};
const DEFAULT: Sketch = {
  page: "#ffffff",
  tab: "#f1f5f9",
  border: "#cbd5e1",
  tokens: ["#2563eb", "#16a34a", "#7c3aed"],
};

const SET = [LIME, ECLIPSA, AMBER, DEFAULT, LIME, AMBER, ECLIPSA, LIME];

// Copies of the set in each row: enough that a row always outruns the tilted view.
const COPIES = 4;

// Each row starts at a different theme and drifts at its own speed.
const ROWS = [
  { offset: 0, speed: "60s" },
  { offset: 3, speed: "72s" },
  { offset: 5, speed: "66s" },
  { offset: 1, speed: "80s" },
  { offset: 6, speed: "70s" },
];

// The four lines of code each frame sketches: width and indent.
const LINES = [
  { width: "62%", indent: false },
  { width: "40%", indent: true },
  { width: "74%", indent: true },
  { width: "30%", indent: false },
];

function rotate<T>(list: T[], by: number): T[] {
  return [...list.slice(by), ...list.slice(0, by)];
}

function FrameSketch({ sketch }: { sketch: Sketch }) {
  return (
    <div
      className="fs:0 w:75 h:46 mr:9 br:lg o:h"
      style={{
        background: sketch.page,
        boxShadow: `0 0 0 1px ${sketch.border}, 0 18px 0 -6px #000`,
      }}
    >
      <div
        className="h:8 bbw:1 bs:s"
        style={{ background: sketch.tab, borderColor: sketch.border }}
      />
      <div className="d:f fd:c g:3 p:5">
        {LINES.map((line, index) => (
          <div
            key={line.width}
            className={`h:2 br:sm ${line.indent ? "ml:5" : ""}`}
            style={{ width: line.width, background: sketch.tokens[index % 3] }}
          />
        ))}
      </div>
    </div>
  );
}

/** Rows of frames in Framelime's themes, drifting on a tilted plane. */
export function FramesBackdrop() {
  return (
    <div aria-hidden="true" className="landing-stage p:a i:0 o:h">
      <div className="landing-plane p:a d:f fd:c g:10 o:50">
        {ROWS.map((row) => {
          const frames = rotate(SET, row.offset);
          return (
            <div
              key={row.offset}
              className="landing-row d:f w:max"
              style={
                { "--landing-speed": row.speed, "--landing-copies": COPIES } as React.CSSProperties
              }
            >
              {Array.from({ length: COPIES }, () => frames)
                .flat()
                .map((sketch, index) => (
                  // oxlint-disable-next-line react/no-array-index-key -- a fixed, repeated list
                  <FrameSketch key={index} sketch={sketch} />
                ))}
            </div>
          );
        })}
      </div>
      <div className="landing-vignette p:a i:0" />
    </div>
  );
}

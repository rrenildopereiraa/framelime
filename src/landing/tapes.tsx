import { DISPLAY_STYLE } from "@/lib/fonts.ts";

const ACTIONS = [
  "Paste",
  "Tune",
  "Export",
  "PNG",
  "JPG",
  "WEBP",
  "SVG",
  "Copy image",
  "Share a link",
];
const OPTIONS = [
  "Lime",
  "Default",
  "Eclipsa",
  "Amber",
  "Your VS Code theme",
  "Radius 0–16",
  "16:9",
  "Fira Code",
  "Diffs",
];

function Tape({
  words,
  mark,
  className,
  trackClassName,
}: {
  words: string[];
  mark: string;
  className: string;
  trackClassName: string;
}) {
  // Three times over, so the track is always wider than the screen.
  const run = [...words, ...words, ...words];
  return (
    <div className={`py:5 o:h ${className}`}>
      <div className={`${trackClassName} d:f w:max fs:4xl fw:500 ws:nw`} style={DISPLAY_STYLE}>
        {/* Two copies: the track slides one, then starts over on the same frame. */}
        {[...run, ...run].map((word, index) => (
          // oxlint-disable-next-line react/no-array-index-key -- a fixed, repeated list
          <span key={index} className="d:f g:11 pr:11">
            <span>{word}</span>
            <span>{mark}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Two tapes across the page, one lime and one in the text color, running
 * opposite ways. Decorative: the controls below say the same in full.
 */
export function Tapes() {
  return (
    <div aria-hidden="true" className="p:r h:80 o:h">
      <div className="landing-tapes p:a t:20 d:f fd:c">
        <Tape
          words={ACTIONS}
          mark="→"
          className="bg:fill c:on-fill"
          trackClassName="landing-tape-track"
        />
        <Tape
          words={OPTIONS}
          mark="✳"
          className="bg:label c:page"
          trackClassName="landing-tape-track-back"
        />
      </div>
    </div>
  );
}

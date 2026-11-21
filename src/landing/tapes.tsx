import { type Icon, IconArrowRight, IconAsterisk } from "@tabler/icons-react";
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
  mark: Mark,
  className,
  trackClassName,
}: {
  words: string[];
  /** The Tabler icon between words. */
  mark: Icon;
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
          <span key={index} className="d:f ai:c g:11 pr:11">
            <span>{word}</span>
            <Mark className="w:8 h:8 fs:0" stroke={2.5} aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Two tapes across the page, one lime and one in the text color, running
 * opposite ways, each with a keycap edge like Yumma UI's buttons. Decorative,
 * so hidden from assistive tech: the hero already says what Framelime does.
 */
export function Tapes() {
  return (
    <div aria-hidden="true" className="p:r h:80 o:h">
      <div className="landing-tapes p:a t:20 d:f fd:c">
        <Tape
          words={ACTIONS}
          mark={IconArrowRight}
          className="bg:fill c:on-fill bbw:3 bs:s bc:edge"
          trackClassName="landing-tape-track"
        />
        <Tape
          words={OPTIONS}
          mark={IconAsterisk}
          className="bg:label c:page bbw:3 bs:s bc:hint"
          trackClassName="landing-tape-track-back"
        />
      </div>
    </div>
  );
}

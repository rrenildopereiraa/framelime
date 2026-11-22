import { IconAsterisk } from "@tabler/icons-react";
import type { ReactNode } from "react";
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

// Each sticker sits at a slight angle of its own, alternating sides.
const TILTS = [-2, 1.5, -1, 2, -1.5, 1];

// The second row cycles through the three looks.
const LOOKS = ["landing-sticker-fill", "landing-sticker-ink", ""];

function Row({
  words,
  separator,
  looks,
  trackClassName,
}: {
  words: string[];
  separator: ReactNode;
  looks: string[];
  trackClassName: string;
}) {
  // Three runs make one copy wider than the screen; the track holds two
  // copies and slides exactly one, so the loop restarts on the frame it ends on.
  const run = [...words, ...words, ...words];
  return (
    <div className={`${trackClassName} d:f ai:c w:max`}>
      {[...run, ...run].map((word, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- a fixed, repeated list
        <span key={index} className="d:f ai:c g:5 pr:5">
          <span
            className={`landing-sticker ${looks[index % looks.length]}`}
            style={{ ...DISPLAY_STYLE, rotate: `${TILTS[index % TILTS.length]}deg` }}
          >
            {word}
          </span>
          {separator}
        </span>
      ))}
    </div>
  );
}

/**
 * The old tapes, softened to match the sky: two rows of stickers drifting
 * opposite ways and fading out at the edges. Decorative, so hidden from
 * assistive tech: the hero already says what Framelime does.
 */
export function StickerBelt() {
  return (
    <div aria-hidden="true" className="landing-belt d:f fd:c g:4 py:7 o:h">
      <Row
        words={ACTIONS}
        looks={[""]}
        separator={<span className="landing-dot" />}
        trackClassName="landing-belt-track"
      />
      <Row
        words={OPTIONS}
        looks={LOOKS}
        separator={<IconAsterisk className="w:6 h:6 fs:0 c:accent" stroke={2.6} />}
        trackClassName="landing-belt-track-back"
      />
    </div>
  );
}

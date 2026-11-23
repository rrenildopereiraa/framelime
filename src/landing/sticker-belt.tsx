import { IconAsterisk } from "@tabler/icons-react";
import { DISPLAY_STYLE } from "@/lib/fonts.ts";

// What you do, and what you can set, taken in turns.
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
const WORDS = ACTIONS.flatMap((action, index) => [action, OPTIONS[index]]);

// Each sticker sits at a slight angle of its own, alternating sides.
const TILTS = [-2, 1.5, -1, 2, -1.5, 1];

// White, lime, white, dark: a calm run with a pop of color every other sticker.
const LOOKS = ["", "landing-sticker-fill", "", "landing-sticker-ink"];

/**
 * The old tapes, softened to match the sky: one row of stickers drifting
 * across, starred apart and fading out at the edges. Decorative, so hidden
 * from assistive tech: the hero already says what Framelime does.
 */
export function StickerBelt() {
  // The words run twice per copy, wider than any screen; the track holds two
  // copies and slides exactly one, so the loop restarts on the frame it ends on.
  const run = [...WORDS, ...WORDS];
  return (
    <div aria-hidden="true" className="landing-belt py:7 o:h">
      <div className="landing-belt-track d:f ai:c w:max">
        {[...run, ...run].map((word, index) => (
          // oxlint-disable-next-line react/no-array-index-key -- a fixed, repeated list
          <span key={index} className="d:f ai:c g:5 pr:5">
            <span
              className={`landing-sticker ${LOOKS[index % LOOKS.length]}`}
              style={{ ...DISPLAY_STYLE, rotate: `${TILTS[index % TILTS.length]}deg` }}
            >
              {word}
            </span>
            <IconAsterisk className="landing-star fs:0 c:accent" stroke={2.6} />
          </span>
        ))}
      </div>
    </div>
  );
}

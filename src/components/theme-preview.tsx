import type { PreviewColors } from "../lib/theme-catalog";

// Three short lines of code, as bars in the token colors they would take.
const LINES: [keyof PreviewColors, string][][] = [
  [["comment", "w:7"]],
  [
    ["keyword", "w:2"],
    ["name", "w:3"],
    ["string", "w:3"],
  ],
  [
    ["func", "w:4"],
    ["name", "w:3"],
  ],
];

/** A theme's frame color with a few lines in its token colors, for the picker. */
export function ThemePreview({
  background,
  colors,
}: {
  background: string;
  colors: PreviewColors;
}) {
  return (
    <span
      className="d:f fd:c jc:c g:1 w:14 h:7 px:2 bw:1 bc:line br:sm fs:0"
      style={{ backgroundColor: background }}
    >
      {LINES.map((line, index) => (
        <span key={index} className="d:f g:1">
          {line.map(([token, width], tokenIndex) => (
            <span
              key={tokenIndex}
              className={`h:1 br:9999 ${width}`}
              style={{ backgroundColor: colors[token] }}
            />
          ))}
        </span>
      ))}
    </span>
  );
}

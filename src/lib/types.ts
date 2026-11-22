import type { LanguageId } from "./highlighter";

export const MAX_DOCUMENTS = 5;

// "auto" keeps the frame sized to its content (the original behaviour and
// still the default); the rest lock it to a fixed shape for a target
// platform, so a snippet can be posted without a detour through an image
// editor to re-crop it.
export type AspectRatio = "auto" | "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export const ASPECT_RATIOS: {
  id: AspectRatio;
  label: string;
  // CSS aspect-ratio value; undefined means "size to content".
  value?: string;
}[] = [
  { id: "auto", label: "Auto" },
  { id: "1:1", label: "1:1 — Square" },
  { id: "4:3", label: "4:3 — Landscape" },
  { id: "3:4", label: "3:4 — Portrait" },
  { id: "16:9", label: "16:9 — Wide" },
  { id: "9:16", label: "9:16 — Story" },
];

export const ASPECT_RATIO_VALUES: Record<AspectRatio, string | undefined> = {
  auto: undefined,
  "1:1": "1 / 1",
  "4:3": "4 / 3",
  "3:4": "3 / 4",
  "16:9": "16 / 9",
  "9:16": "9 / 16",
};

export type HighlightType = "mark" | "add" | "remove";

export interface HighlightedLine {
  line: number;
  type: HighlightType;
}

export interface HighlightedWord {
  line: number;
  startCol: number;
  endCol: number;
  type: HighlightType;
}

export interface EditorDocument {
  id: string;
  fileName: string;
  code: string;
  language: LanguageId;
  highlightedLines: HighlightedLine[];
  highlightedWords: HighlightedWord[];
}

export interface CornerRadii {
  tl: number;
  tr: number;
  bl: number;
  br: number;
}

// Space between the frame's edge and the code window, in px. The default
// is the padding every frame had before it was adjustable.
export const PADDING_MIN = 0;
export const PADDING_MAX = 128;
export const PADDING_STEP = 8;
export const PADDING_DEFAULT = 64;

// Code font size, in px. Line height follows at 1.5x.
export const FONT_SIZE_MIN = 10;
export const FONT_SIZE_MAX = 24;
export const FONT_SIZE_DEFAULT = 14;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Where the language name shows. "status" is where it always was.
export type LabelPosition = "none" | "status" | "tab";

export const LABEL_POSITIONS: { id: LabelPosition; label: string }[] = [
  { id: "none", label: "None" },
  { id: "status", label: "Status bar, bottom right" },
  { id: "tab", label: "Tab bar, top right" },
];

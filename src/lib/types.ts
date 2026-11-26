import type { LanguageId } from "./highlighter";

export const MAX_DOCUMENTS = 5;

// "auto" keeps the frame sized to its content (the original behaviour and
// still the default); the rest lock it to a fixed shape for a target
// platform, so a snippet can be posted without a detour through an image
// editor to re-crop it. Size presets also fix the exported image's size in
// pixels, whatever the export scale.
export type AspectRatio =
  | "auto"
  | "1:1"
  | "4:3"
  | "3:4"
  | "16:9"
  | "9:16"
  | "x-post"
  | "linkedin-post"
  | "instagram-square"
  | "instagram-story";

export interface ImageSize {
  width: number;
  height: number;
}

export const ASPECT_RATIOS: {
  id: AspectRatio;
  label: string;
  /** The exported image's size, for a size preset. */
  size?: ImageSize;
}[] = [
  { id: "auto", label: "Auto" },
  { id: "1:1", label: "1:1 — Square" },
  { id: "4:3", label: "4:3 — Landscape" },
  { id: "3:4", label: "3:4 — Portrait" },
  { id: "16:9", label: "16:9 — Wide" },
  { id: "9:16", label: "9:16 — Story" },
  { id: "x-post", label: "X post — 1200 × 675", size: { width: 1200, height: 675 } },
  { id: "linkedin-post", label: "LinkedIn post — 1200 × 627", size: { width: 1200, height: 627 } },
  {
    id: "instagram-square",
    label: "Instagram square — 1080 × 1080",
    size: { width: 1080, height: 1080 },
  },
  {
    id: "instagram-story",
    label: "Instagram story — 1080 × 1920",
    size: { width: 1080, height: 1920 },
  },
];

export const ASPECT_RATIO_IDS = ASPECT_RATIOS.map((ratio) => ratio.id);

/** The exported image's size in pixels, for a size preset; `undefined` otherwise. */
export function presetSize(ratio: AspectRatio): ImageSize | undefined {
  return ASPECT_RATIOS.find((entry) => entry.id === ratio)?.size;
}

export const ASPECT_RATIO_VALUES: Record<AspectRatio, string | undefined> = {
  auto: undefined,
  "1:1": "1 / 1",
  "4:3": "4 / 3",
  "3:4": "3 / 4",
  "16:9": "16 / 9",
  "9:16": "9 / 16",
  "x-post": "1200 / 675",
  "linkedin-post": "1200 / 627",
  "instagram-square": "1 / 1",
  "instagram-story": "1080 / 1920",
};

// How many image pixels each CSS pixel of the frame becomes in PNG, JPG and
// WEBP exports. 2x is what every export used before it could be chosen.
export type ExportScale = 1 | 2 | 3;
export const EXPORT_SCALES: ExportScale[] = [1, 2, 3];
export const EXPORT_SCALE_DEFAULT: ExportScale = 2;

// A shadow under the code window. "none" keeps links made before it as they were.
export type ShadowStyle = "none" | "soft" | "hard";

export const SHADOW_STYLES: { id: ShadowStyle; label: string }[] = [
  { id: "none", label: "Off" },
  { id: "soft", label: "Soft" },
  { id: "hard", label: "Hard" },
];

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

// Corner radius, in px.
export const RADIUS_MIN = 0;
export const RADIUS_MAX = 16;

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

// Hash lines drawn along the code window's edges, past the frame's edges.
// Spacing is the gap between a line and the window, in px.
export const DECOR_SPACING_MIN = 0;
export const DECOR_SPACING_MAX = 48;
export const DECOR_SPACING_STEP = 4;
export const DECOR_SPACING_DEFAULT = 12;
export const DECOR_OPACITY_DEFAULT = 100;

// A tab in the frame's tab bar, for each open snippet.
export interface FrameTab {
  id: string;
  fileName: string;
}

// The frame's width when set by dragging its handles, in px. Unset (0 in a
// link) sizes it the way it always was: to the code window, or to the canvas
// for a fixed aspect ratio. Drags snap to the step.
export const FRAME_WIDTH_MIN = 320;
export const FRAME_WIDTH_MAX = 1920;
export const FRAME_WIDTH_STEP = 10;

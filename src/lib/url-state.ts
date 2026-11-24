import {
  parseAsBoolean,
  parseAsInteger,
  parseAsJson,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import type { FrameColors } from "../components/frame";
import {
  type BackgroundType,
  GRADIENT_ANGLE_DEFAULT,
  type ImageFit,
  PATTERN_IDS,
  PATTERN_SCALE_DEFAULT,
  type PatternId,
} from "./background";
import { FONT_FAMILIES, type FontFamilyId } from "../components/inspector";
import type { FrameMode } from "./chrome-theme";
import { requireThemeFrameColors, THEME_NAME } from "./highlighter";
import {
  type AspectRatio,
  DECOR_OPACITY_DEFAULT,
  DECOR_SPACING_DEFAULT,
  FONT_SIZE_DEFAULT,
  type LabelPosition,
  PADDING_DEFAULT,
} from "./types";

const FRAME_COLOR_KEYS: (keyof FrameColors)[] = [
  "page",
  "surface",
  "border",
  "accentDim",
  "tabBar",
  "tabActive",
  "statusBarBg",
  "statusBarText",
];

function parseFrameColors(value: unknown): FrameColors | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  for (const key of FRAME_COLOR_KEYS) {
    if (typeof record[key] !== "string") return null;
  }
  return record as unknown as FrameColors;
}

export const settingsParsers = {
  tabBar: parseAsBoolean.withDefault(true),
  statusBar: parseAsBoolean.withDefault(false),
  ratio: parseAsStringEnum<AspectRatio>(["auto", "1:1", "4:3", "3:4", "16:9", "9:16"]).withDefault(
    "auto",
  ),
  rtl: parseAsInteger.withDefault(0),
  rtr: parseAsInteger.withDefault(0),
  rbl: parseAsInteger.withDefault(0),
  rbr: parseAsInteger.withDefault(0),
  font: parseAsStringEnum<FontFamilyId>(Object.keys(FONT_FAMILIES) as FontFamilyId[]).withDefault(
    "default",
  ),
  pad: parseAsInteger.withDefault(PADDING_DEFAULT),
  size: parseAsInteger.withDefault(FONT_SIZE_DEFAULT),
  lines: parseAsBoolean.withDefault(false),
  label: parseAsStringEnum<LabelPosition>(["none", "status", "tab"]).withDefault("status"),
  // Defaults keep links made before these settings looking as they did.
  deco: parseAsBoolean.withDefault(false),
  // Empty follows the code window's border color.
  decoColor: parseAsString.withDefault(""),
  decoOpacity: parseAsInteger.withDefault(DECOR_OPACITY_DEFAULT),
  decoGap: parseAsInteger.withDefault(DECOR_SPACING_DEFAULT),
  // What fills the frame. "image" falls back to the solid color wherever
  // the image isn't stored, as on a share link.
  bg: parseAsStringEnum<BackgroundType>(["solid", "gradient", "pattern", "image"]).withDefault(
    "solid",
  ),
  // Gradient stops; an empty start or end follows the theme, an empty
  // middle leaves it out.
  gradFrom: parseAsString.withDefault(""),
  gradVia: parseAsString.withDefault(""),
  gradTo: parseAsString.withDefault(""),
  gradAngle: parseAsInteger.withDefault(GRADIENT_ANGLE_DEFAULT),
  pattern: parseAsStringEnum<PatternId>(PATTERN_IDS).withDefault("blueprint"),
  // Empty follows the theme's accent.
  patternInk: parseAsString.withDefault(""),
  patternScale: parseAsInteger.withDefault(PATTERN_SCALE_DEFAULT),
  imgFit: parseAsStringEnum<ImageFit>(["cover", "contain"]).withDefault("cover"),
  imgBlur: parseAsInteger.withDefault(0),
  imgDim: parseAsInteger.withDefault(0),
  theme: parseAsString.withDefault(THEME_NAME),
  // The frame's light/dark preference, independent of the app scheme.
  frameMode: parseAsStringEnum<FrameMode>(["light", "dark", "auto"]).withDefault("auto"),
  colors: parseAsJson<FrameColors>(parseFrameColors).withDefault(
    requireThemeFrameColors(THEME_NAME, "dark"),
  ),
};

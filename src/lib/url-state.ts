import {
  parseAsBoolean,
  parseAsInteger,
  parseAsJson,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import type { FrameColors } from "../components/frame";
import { type BackgroundType, GRADIENT_ANGLE_DEFAULT } from "./background";
import { FONT_FAMILIES, type FontFamilyId } from "../components/inspector";
import type { FrameMode } from "./chrome-theme";
import { requireThemeFrameColors, THEME_NAME } from "./highlighter";
import {
  ASPECT_RATIO_IDS,
  type AspectRatio,
  DECOR_OPACITY_DEFAULT,
  DECOR_SPACING_DEFAULT,
  FONT_SIZE_DEFAULT,
  type LabelPosition,
  PADDING_DEFAULT,
  type ShadowStyle,
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
  ratio: parseAsStringEnum<AspectRatio>(ASPECT_RATIO_IDS).withDefault("auto"),
  // The frame's width in px, set by dragging its handles; 0 sizes it to fit.
  w: parseAsInteger.withDefault(0),
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
  // A shadow under the code window; an empty color follows the theme.
  shadow: parseAsStringEnum<ShadowStyle>(["none", "soft", "hard"]).withDefault("none"),
  shadowColor: parseAsString.withDefault(""),
  // What fills the frame.
  bg: parseAsStringEnum<BackgroundType>(["solid", "gradient", "transparent"]).withDefault("solid"),
  // Gradient stops; an empty start or end follows the theme, an empty
  // middle leaves it out.
  gradFrom: parseAsString.withDefault(""),
  gradVia: parseAsString.withDefault(""),
  gradTo: parseAsString.withDefault(""),
  gradAngle: parseAsInteger.withDefault(GRADIENT_ANGLE_DEFAULT),
  theme: parseAsString.withDefault(THEME_NAME),
  // The frame's light/dark preference, independent of the app scheme.
  frameMode: parseAsStringEnum<FrameMode>(["light", "dark", "auto"]).withDefault("auto"),
  colors: parseAsJson<FrameColors>(parseFrameColors).withDefault(
    requireThemeFrameColors(THEME_NAME, "dark"),
  ),
};

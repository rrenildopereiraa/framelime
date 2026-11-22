import {
  parseAsBoolean,
  parseAsInteger,
  parseAsJson,
  parseAsString,
  parseAsStringEnum,
} from "nuqs";
import type { FrameColors } from "../components/frame";
import { FONT_FAMILIES, type FontFamilyId } from "../components/inspector";
import type { FrameMode } from "./chrome-theme";
import { requireThemeFrameColors, THEME_NAME } from "./highlighter";
import { type AspectRatio, FONT_SIZE_DEFAULT, type LabelPosition, PADDING_DEFAULT } from "./types";

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
  theme: parseAsString.withDefault(THEME_NAME),
  // The frame's light/dark preference, independent of the app scheme.
  frameMode: parseAsStringEnum<FrameMode>(["light", "dark", "auto"]).withDefault("auto"),
  colors: parseAsJson<FrameColors>(parseFrameColors).withDefault(
    requireThemeFrameColors(THEME_NAME, "dark"),
  ),
};

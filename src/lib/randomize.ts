import { useState } from "react";
import type { BackgroundType } from "./background";
import {
  DECOR_SPACING_MAX,
  DECOR_SPACING_MIN,
  DECOR_SPACING_STEP,
  type LabelPosition,
  LABEL_POSITIONS,
  PADDING_MAX,
  PADDING_MIN,
  PADDING_STEP,
  RADIUS_MAX,
  RADIUS_MIN,
} from "./types";

/** What Randomize changes, in groups that can each be locked. */
export type RandomizeGroup =
  | "theme"
  | "layout"
  | "radius"
  | "font"
  | "background"
  | "chrome"
  | "decorators";

export const RANDOMIZE_GROUPS: { id: RandomizeGroup; label: string }[] = [
  { id: "theme", label: "Theme" },
  { id: "layout", label: "Layout" },
  { id: "radius", label: "Radius" },
  { id: "font", label: "Font" },
  { id: "background", label: "Background" },
  { id: "chrome", label: "Chrome" },
  { id: "decorators", label: "Hash lines" },
];

const GROUP_IDS = new Set<string>(RANDOMIZE_GROUPS.map((group) => group.id));

// Locks belong to this browser, not to a share link.
export const LOCKS_STORAGE_KEY = "framelime:randomize-locks";

// Within the font size slider's range, kept to sizes that read well at a glance.
const RANDOM_FONT_SIZE_MIN = 12;
const RANDOM_FONT_SIZE_MAX = 18;
const GRADIENT_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** The locked groups saved in this browser; none when storage is empty, unreadable or blocked. */
export function loadLocks(storage: Pick<Storage, "getItem"> | undefined = globalStorage()) {
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(LOCKS_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is RandomizeGroup => typeof id === "string" && GROUP_IDS.has(id));
  } catch {
    return [];
  }
}

export function saveLocks(
  locks: RandomizeGroup[],
  storage: Pick<Storage, "setItem"> | undefined = globalStorage(),
) {
  try {
    storage?.setItem(LOCKS_STORAGE_KEY, JSON.stringify(locks));
  } catch {
    // Private windows and blocked storage: the locks last until the page closes.
  }
}

function globalStorage() {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/** The locked groups, remembered in this browser. */
export function useRandomizeLocks() {
  const [locks, setLocks] = useState<RandomizeGroup[]>(() => loadLocks());

  function setLocked(group: RandomizeGroup, locked: boolean) {
    setLocks((current) => {
      const next = locked
        ? [...new Set([...current, group])]
        : current.filter((id) => id !== group);
      saveLocks(next);
      return next;
    });
  }

  return { locks, setLocked };
}

/** The settings Randomize writes, under their link keys. */
export interface RandomPatch<Colors, Font extends string> {
  theme?: string;
  colors?: Colors;
  pad?: number;
  rtl?: number;
  rtr?: number;
  rbl?: number;
  rbr?: number;
  font?: Font;
  size?: number;
  bg?: BackgroundType;
  gradFrom?: string;
  gradVia?: string;
  gradTo?: string;
  gradAngle?: number;
  tabBar?: boolean;
  statusBar?: boolean;
  lines?: boolean;
  label?: LabelPosition;
  deco?: boolean;
  decoGap?: number;
}

/**
 * New settings for every group that isn't locked. Colors come from picking
 * among the curated themes rather than random hex values per token:
 * arbitrary colors have no contrast or taste guarantees, real themes do.
 */
export function randomPatch<Colors, Font extends string>({
  locks,
  currentTheme,
  themeNames,
  colorsFor,
  fontIds,
  random = Math.random,
}: {
  locks: readonly RandomizeGroup[];
  currentTheme: string;
  themeNames: string[];
  colorsFor: (theme: string) => Colors;
  fontIds: Font[];
  random?: () => number;
}): RandomPatch<Colors, Font> {
  const locked = new Set(locks);
  const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)];
  const between = (min: number, max: number, step = 1) =>
    min + Math.floor(random() * (Math.floor((max - min) / step) + 1)) * step;
  const coin = () => random() < 0.5;
  const patch: RandomPatch<Colors, Font> = {};

  if (!locked.has("theme")) {
    const others = themeNames.filter((name) => name !== currentTheme);
    const theme = pick(others.length > 0 ? others : themeNames);
    patch.theme = theme;
    patch.colors = colorsFor(theme);
  }

  if (!locked.has("layout")) {
    patch.pad = between(PADDING_MIN, PADDING_MAX, PADDING_STEP);
  }

  if (!locked.has("radius")) {
    const radius = between(RADIUS_MIN, RADIUS_MAX);
    Object.assign(patch, { rtl: radius, rtr: radius, rbl: radius, rbr: radius });
  }

  if (!locked.has("font")) {
    patch.font = pick(fontIds);
    patch.size = between(RANDOM_FONT_SIZE_MIN, RANDOM_FONT_SIZE_MAX);
  }

  // Never transparent: on its own it reads as a frame with nothing behind
  // it. Gradients take the theme's colors, which change with it.
  if (!locked.has("background")) {
    patch.bg = coin() ? "gradient" : "solid";
    if (patch.bg === "gradient") {
      Object.assign(patch, { gradFrom: "", gradVia: "", gradTo: "" });
      patch.gradAngle = pick(GRADIENT_ANGLES);
    }
  }

  if (!locked.has("chrome")) {
    patch.tabBar = coin();
    patch.statusBar = coin();
    patch.lines = coin();
    patch.label = pick(LABEL_POSITIONS).id;
  }

  if (!locked.has("decorators")) {
    patch.deco = coin();
    patch.decoGap = between(DECOR_SPACING_MIN, DECOR_SPACING_MAX, DECOR_SPACING_STEP);
  }

  return patch;
}

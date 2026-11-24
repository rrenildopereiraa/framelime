import { createHighlighterCore, type HighlighterCore, type ThemeInput } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";

import astro from "@shikijs/langs/astro";
import css from "@shikijs/langs/css";
import html from "@shikijs/langs/html";
import javascript from "@shikijs/langs/javascript";
import jsx from "@shikijs/langs/jsx";
import markdown from "@shikijs/langs/markdown";
import mdx from "@shikijs/langs/mdx";
import php from "@shikijs/langs/php";
import scss from "@shikijs/langs/scss";
import svelte from "@shikijs/langs/svelte";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import vue from "@shikijs/langs/vue";
import type { FrameColors } from "../components/frame";
import amber from "../themes/amber-theme.json";
import eclipsa from "../themes/eclipsa-theme.json";
import limeDark from "../themes/lime-dark-theme.json";
import limeLight from "../themes/lime-light-theme.json";
import tinycolor from "tinycolor2";
import type { ResolvedMode } from "./chrome-theme";
import {
  CATALOG_LOADERS,
  CATALOG_THEMES,
  THEME_CATALOG,
  type PreviewColors,
} from "./theme-catalog";

export const LANGUAGES = {
  html: "HTML",
  javascript: "JavaScript",
  mjs: "MJS",
  jsx: "JSX",
  typescript: "TypeScript",
  tsx: "TSX",
  astro: "Astro",
  vue: "Vue",
  svelte: "Svelte",
  markdown: "Markdown",
  mdx: "MDX",
  css: "CSS",
  scss: "SCSS",
  php: "PHP",
} as const;

export type LanguageId = keyof typeof LANGUAGES;

export const THEME_NAME = "Lime";

const BUILTIN_THEMES = [limeLight, limeDark, eclipsa, amber] as ThemeInput[];

// The canonical theme list users pick from. "Lime" is adaptive: it renders
// Lime Light or Lime Dark, following the frame's scheme.
export const THEMES = {
  Lime: "Lime",
  [eclipsa.name]: eclipsa.name,
  [amber.name]: amber.name,
  ...Object.fromEntries(CATALOG_THEMES.map((theme) => [theme.id, theme.id])),
} as Record<string, string>;

export type ThemeId = keyof typeof THEMES;

// Legacy names - old share URLs keep working. Default, and the Light and
// Monochrome themes it was made of, were removed in favor of Lime.
const LEGACY_THEME_NAMES: Record<string, string> = {
  Default: "Lime",
  Light: "Lime",
  Monochrome: "Lime",
  [limeLight.name]: "Lime",
  [limeDark.name]: "Lime",
};

export function normalizeThemeName(name: string): string {
  return LEGACY_THEME_NAMES[name] ?? name;
}

// The concrete Shiki theme for a (possibly adaptive) theme name under a
// given scheme.
export function resolveShikiTheme(themeName: string, mode: ResolvedMode): string {
  const name = normalizeThemeName(themeName);
  if (name === "Lime") return mode === "dark" ? limeDark.name : limeLight.name;
  const catalogTheme = CATALOG_THEMES.find((theme) => theme.id === name);
  if (catalogTheme) {
    return mode === "light" && "light" in catalogTheme ? catalogTheme.light : catalogTheme.dark;
  }
  return name;
}

/**
 * What the picker draws for a theme under a scheme: its frame color and the
 * colors of a few tokens. Undefined for an uploaded theme.
 */
export function themePreview(
  themeName: string,
  mode: ResolvedMode,
): { background: string; colors: PreviewColors } | undefined {
  const entry = THEME_CATALOG[resolveShikiTheme(themeName, mode)];
  const frame = themeFrameColors(themeName, mode);
  if (!entry || !frame) return undefined;
  return { background: frame.page, colors: entry.preview };
}

export function readThemeFrameColors(theme: {
  name: string;
  colors?: Record<string, string | null>;
  frameColors?: Partial<FrameColors>;
}): FrameColors {
  const c = theme.colors ?? {};
  const f = theme.frameColors ?? {};

  const colors: FrameColors = {
    page: getColor(c, "editor.background") ?? f.page ?? "#0b0b0a",
    surface: getColor(c, "sideBar.background") ?? f.surface ?? "#121311",
    border:
      firstColor(
        c,
        "editorGroupHeader.border",
        "sideBar.border",
        "tab.border",
        "editorGroup.border",
        "panel.border",
        "editorWidget.border",
      ) ??
      f.border ??
      "#232421",
    accentDim: getColor(c, "editor.foreground") ?? f.accentDim ?? "#95978d",
    tabBar:
      firstColor(
        c,
        "tab.inactiveBackground",
        "editorGroupHeader.tabsBackground",
        "sideBar.background",
        "editor.background",
      ) ??
      f.tabBar ??
      "#0b0b0a",
    tabActive: getColor(c, "tab.activeBackground") ?? f.tabActive ?? "#121311",
    statusBarBg: getColor(c, "statusBar.background") ?? f.statusBarBg ?? "#1a1b18",
    statusBarText: getColor(c, "statusBar.foreground") ?? f.statusBarText ?? "#d4ff3a",
    highlightMark:
      getColor(c, "editor.wordHighlightBackground") ??
      getColor(c, "editor.rangeHighlightBackground") ??
      getColor(c, "editor.selectionHighlightBackground") ??
      f.highlightMark ??
      "#64748b",
    highlightAdd:
      getColor(c, "diffEditor.insertedTextBackground") ??
      getColor(c, "diffEditor.insertedLineBackground") ??
      f.highlightAdd ??
      "#86efac",
    highlightRemove:
      getColor(c, "diffEditor.removedTextBackground") ??
      getColor(c, "diffEditor.removedLineBackground") ??
      f.highlightRemove ??
      "#fca5a5",
  };

  // Solid parts of the frame draw see-through theme colors over the page.
  for (const key of ["surface", "border", "tabBar", "tabActive", "statusBarBg"] as const) {
    colors[key] = flatten(colors[key], colors.page);
  }
  colors.border = visibleBorder(colors);
  return colors;
}

// The color a see-through color shows over a solid background.
function flatten(color: string, background: string): string {
  const parsed = tinycolor(color);
  const alpha = parsed.getAlpha();
  if (alpha >= 1) return color;
  return tinycolor.mix(background, parsed.setAlpha(1), alpha * 100).toHexString();
}

// The frame's border should set it apart from the backdrop and from its
// own code area, as Lime's does (about 1.3:1). Many themes draw borders so
// close to the background they vanish, so those step toward the text color
// until they show.
const BORDER_CONTRAST = 1.25;

function visibleBorder({ border, page, tabActive, accentDim }: FrameColors): string {
  const contrast = (color: string) =>
    Math.min(tinycolor.readability(color, page), tinycolor.readability(color, tabActive));
  if (contrast(border) >= BORDER_CONTRAST) return border;
  for (let amount = 2; amount <= 60; amount += 2) {
    const candidate = tinycolor.mix(page, accentDim, amount).toHexString();
    if (contrast(candidate) >= BORDER_CONTRAST + 0.05) return candidate;
  }
  return border;
}

// A theme color, with short hex (#fff, #fff8) spelled out. Fully
// transparent colors count as unset, as themes use them to hide a part.
function getColor(colors: Record<string, string | null>, key: string): string | undefined {
  const value = colors[key];
  if (value == null || !/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) return undefined;
  const hex = value.length <= 5 ? value.replace(/[0-9a-f]/gi, (digit) => digit + digit) : value;
  if (hex.length === 9 && hex.slice(7) === "00") return undefined;
  return hex;
}

function firstColor(colors: Record<string, string | null>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = getColor(colors, key);
    if (value) return value;
  }
  return undefined;
}

// Frame colors per scheme. Adaptive themes (Lime) carry distinct light
// and dark sets; static themes carry the same set for both schemes.
export const THEME_FRAME_COLORS: Record<string, Record<ResolvedMode, FrameColors>> = {
  Lime: {
    light: readThemeFrameColors(limeLight),
    dark: readThemeFrameColors(limeDark),
  },
  [eclipsa.name]: (() => {
    const colors = readThemeFrameColors(
      eclipsa as unknown as {
        name: string;
        colors?: Record<string, string | null>;
        frameColors?: Partial<FrameColors>;
      },
    );
    return { light: colors, dark: colors };
  })(),
  [amber.name]: (() => {
    const colors = readThemeFrameColors(
      amber as unknown as {
        name: string;
        colors?: Record<string, string | null>;
        frameColors?: Partial<FrameColors>;
      },
    );
    return { light: colors, dark: colors };
  })(),
  // A theme missing from the catalog (before scripts/theme-catalog.ts has
  // read it) is left out; a test checks the catalog is current.
  ...Object.fromEntries(
    CATALOG_THEMES.flatMap((theme) => {
      const light = THEME_CATALOG[resolveShikiTheme(theme.id, "light")]?.frame;
      const dark = THEME_CATALOG[theme.dark]?.frame;
      return light && dark ? [[theme.id, { light, dark }]] : [];
    }),
  ),
};

// Default frame colors for a (possibly adaptive) theme under a scheme.
export function themeFrameColors(themeName: string, mode: ResolvedMode): FrameColors | undefined {
  return THEME_FRAME_COLORS[normalizeThemeName(themeName)]?.[mode];
}

// Like themeFrameColors, but for themes that always ship both schemes
// (the curated picker themes) - unknown/custom names throw instead of
// silently producing undefined.
export function requireThemeFrameColors(themeName: string, mode: ResolvedMode): FrameColors {
  const colors = themeFrameColors(themeName, mode);
  if (!colors) {
    throw new Error(`No frame colors for theme "${themeName}" in ${mode} mode`);
  }
  return colors;
}

const FRAME_COLOR_KEYS: (keyof FrameColors)[] = [
  "page",
  "surface",
  "border",
  "accentDim",
  "tabBar",
  "tabActive",
  "statusBarBg",
  "statusBarText",
  "highlightMark",
  "highlightAdd",
  "highlightRemove",
];

export function framesColorsEqual(a: FrameColors, b: FrameColors): boolean {
  return FRAME_COLOR_KEYS.every((key) => a[key] === b[key]);
}

let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: BUILTIN_THEMES,
      langs: [
        astro,
        css,
        html,
        javascript,
        jsx,
        markdown,
        mdx,
        php,
        scss,
        svelte,
        tsx,
        typescript,
        vue,
      ],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return highlighterPromise;
}

/**
 * The highlighter, with the Shiki theme for a theme under a scheme loaded.
 * The catalog's themes are fetched the first time they're needed.
 */
export async function getHighlighterWithTheme(
  themeName: string,
  mode: ResolvedMode,
): Promise<{ highlighter: HighlighterCore; theme: string }> {
  const highlighter = await getHighlighter();
  const theme = resolveShikiTheme(themeName, mode);
  const load = CATALOG_LOADERS[theme];
  if (load && !highlighter.getLoadedThemes().includes(theme)) {
    await highlighter.loadTheme((await load()).default);
  }
  return { highlighter, theme };
}

// VS Code theme files are JSONC - strip // and /* */ comments (outside
// strings) and trailing commas so JSON.parse accepts them.
function stripJsonComments(text: string): string {
  let result = "";
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        result += char;
      }
      continue;
    }
    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      result += char;
      if (char === "\\") {
        result += next ?? "";
        i++;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }
    if (char === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (char === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    result += char;
  }

  // Trailing commas before } or ]
  return result.replace(/,(\s*[}\]])/g, "$1");
}

/**
 * Register a user-uploaded VS Code theme (JSON or JSONC) with the
 * highlighter and return its name and extracted frame colors.
 */
export async function loadCustomTheme(text: string): Promise<{
  name: string;
  frameColors: FrameColors;
}> {
  const theme = JSON.parse(stripJsonComments(text)) as {
    name?: string;
    tokenColors?: unknown;
    colors?: Record<string, string | null>;
    frameColors?: Partial<FrameColors>;
  };
  if (!theme.tokenColors) {
    throw new Error("Not a VS Code color theme (missing tokenColors)");
  }
  theme.name = theme.name || "Custom";
  const highlighter = await getHighlighter();
  await highlighter.loadTheme(theme as unknown as ThemeInput);
  return {
    name: theme.name,
    frameColors: readThemeFrameColors(
      theme as {
        name: string;
        colors?: Record<string, string | null>;
        frameColors?: Partial<FrameColors>;
      },
    ),
  };
}

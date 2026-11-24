import type { ThemeRegistration } from "@shikijs/core";
import type { FrameColors } from "../components/frame";
import catalog from "../themes/catalog.json";

/**
 * The popular themes in the picker, beside the built-in ones. A theme with
 * both schemes is adaptive, as Lime is: it follows the frame's scheme. One
 * with a single scheme looks the same in both.
 */
export const CATALOG_THEMES = [
  { id: "GitHub", light: "github-light", dark: "github-dark" },
  { id: "Catppuccin", light: "catppuccin-latte", dark: "catppuccin-mocha" },
  { id: "Rosé Pine", light: "rose-pine-dawn", dark: "rose-pine" },
  { id: "Vitesse", light: "vitesse-light", dark: "vitesse-dark" },
  { id: "One", light: "one-light", dark: "one-dark-pro" },
  { id: "Claude", light: "Claude Light", dark: "Claude Dark" },
  { id: "Dracula", dark: "dracula" },
  { id: "Nord", dark: "nord" },
] as const satisfies readonly { id: string; light?: string; dark: string }[];

type ThemeModule = Promise<{ default: ThemeRegistration }>;

// One chunk per theme, fetched the first time it is picked.
export const CATALOG_LOADERS: Record<string, () => ThemeModule> = {
  "github-light": () => import("@shikijs/themes/github-light"),
  "github-dark": () => import("@shikijs/themes/github-dark"),
  "catppuccin-latte": () => import("@shikijs/themes/catppuccin-latte"),
  "catppuccin-mocha": () => import("@shikijs/themes/catppuccin-mocha"),
  "rose-pine-dawn": () => import("@shikijs/themes/rose-pine-dawn"),
  "rose-pine": () => import("@shikijs/themes/rose-pine"),
  "vitesse-light": () => import("@shikijs/themes/vitesse-light"),
  "vitesse-dark": () => import("@shikijs/themes/vitesse-dark"),
  "one-light": () => import("@shikijs/themes/one-light"),
  "one-dark-pro": () => import("@shikijs/themes/one-dark-pro"),
  // From the Claude Vellum theme for Zed, converted by scripts/convert-zed-theme.ts.
  "Claude Light": () => import("../themes/claude-light-theme.json") as unknown as ThemeModule,
  "Claude Dark": () => import("../themes/claude-dark-theme.json") as unknown as ThemeModule,
  dracula: () => import("@shikijs/themes/dracula"),
  nord: () => import("@shikijs/themes/nord"),
};

/** The token colors a theme's preview in the picker draws its lines in. */
export interface PreviewColors {
  keyword: string;
  name: string;
  string: string;
  func: string;
  comment: string;
}

export interface CatalogEntry {
  frame: FrameColors;
  preview: PreviewColors;
}

/**
 * Frame and preview colors per Shiki theme, read from the themes ahead of
 * time so the picker needs no theme loaded. `vpx scripts/theme-catalog.ts`
 * writes it; a test checks it matches the themes.
 */
export const THEME_CATALOG: Record<string, CatalogEntry> = catalog;

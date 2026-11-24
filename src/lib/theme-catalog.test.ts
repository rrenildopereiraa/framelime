import { describe, expect, it } from "vite-plus/test";
import {
  getHighlighterWithTheme,
  LANGUAGES,
  requireThemeFrameColors,
  THEMES,
  themePreview,
} from "./highlighter";
import { THEME_CATALOG } from "./theme-catalog";
import { buildThemeCatalog } from "./theme-catalog-build";

const MODES = ["light", "dark"] as const;

describe("theme catalog", () => {
  it("matches the themes it was read from", async () => {
    // If this fails, run `vpx scripts/theme-catalog.ts` and commit the result.
    expect(THEME_CATALOG).toEqual(await buildThemeCatalog());
  });

  it("gives every theme frame colors and a preview in both schemes", () => {
    for (const theme of Object.keys(THEMES)) {
      for (const mode of MODES) {
        expect(requireThemeFrameColors(theme, mode).page).toMatch(/^#/);
        expect(themePreview(theme, mode)).toBeDefined();
      }
    }
  });

  it("highlights every language with every theme", async () => {
    for (const name of Object.keys(THEMES)) {
      for (const mode of MODES) {
        const { highlighter, theme } = await getHighlighterWithTheme(name, mode);
        for (const lang of Object.keys(LANGUAGES)) {
          const { tokens } = highlighter.codeToTokens("const a = 1;", { lang, theme });
          const colors = new Set(tokens.flat().map((token) => token.color));
          expect(colors.size, `${name} ${mode} ${lang}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

import { createHighlighterCore, type ThemeRegistration } from "@shikijs/core";
import { createJavaScriptRegexEngine } from "@shikijs/engine-javascript";
import typescript from "@shikijs/langs/typescript";
import amber from "../themes/amber-theme.json";
import eclipsa from "../themes/eclipsa-theme.json";
import limeDark from "../themes/lime-dark-theme.json";
import limeLight from "../themes/lime-light-theme.json";
import { readThemeFrameColors } from "./highlighter";
import { CATALOG_LOADERS, type CatalogEntry, type PreviewColors } from "./theme-catalog";

// Each preview color is the color of one token in this snippet. A comment
// can split at its marker, so it's matched by its first token.
const SAMPLE = `// note
const name = "lime";
greet(name);`;

const SAMPLE_TOKENS: Record<keyof PreviewColors, string> = {
  comment: "//",
  keyword: "const",
  name: "name",
  string: "lime",
  func: "greet",
};

const BUILTIN = [limeLight, limeDark, eclipsa, amber];

/** Reads frame and preview colors from every theme the picker offers. */
export async function buildThemeCatalog(): Promise<Record<string, CatalogEntry>> {
  const catalogThemes = await Promise.all(
    Object.values(CATALOG_LOADERS).map(async (load) => (await load()).default),
  );
  const themes = [...(BUILTIN as unknown as ThemeRegistration[]), ...catalogThemes];
  const highlighter = await createHighlighterCore({
    themes,
    langs: [typescript],
    engine: createJavaScriptRegexEngine(),
  });

  const result: Record<string, CatalogEntry> = {};
  for (const theme of themes) {
    const name = theme.name!;
    const { tokens, fg } = highlighter.codeToTokens(SAMPLE, { lang: "typescript", theme: name });
    const flat = tokens.flat();
    const colorOf = (text: string) =>
      (flat.find((token) => token.content.includes(text))?.color ?? fg ?? "#888888").toLowerCase();
    const preview = Object.fromEntries(
      Object.entries(SAMPLE_TOKENS).map(([key, text]) => [key, colorOf(text)]),
    ) as unknown as PreviewColors;
    result[name] = {
      frame: readThemeFrameColors(theme as Parameters<typeof readThemeFrameColors>[0]),
      preview,
    };
  }
  highlighter.dispose();
  return result;
}

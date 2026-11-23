import type { Plugin } from "prettier";
import type { LanguageId } from "./highlighter";

// The parser Prettier's standalone build uses for each language it handles
// without a community plugin. PHP, Vue, Svelte and Astro are left out.
const PARSERS = {
  html: "html",
  javascript: "babel",
  mjs: "babel",
  jsx: "babel",
  typescript: "typescript",
  tsx: "typescript",
  markdown: "markdown",
  mdx: "mdx",
  css: "css",
  scss: "scss",
} satisfies Partial<Record<LanguageId, string>>;

type FormattableLanguage = keyof typeof PARSERS;

export function canFormat(language: LanguageId): language is FormattableLanguage {
  return language in PARSERS;
}

let prettierPromise: Promise<{
  format: typeof import("prettier/standalone").format;
  plugins: Plugin[];
}> | null = null;

// Prettier is around a megabyte, so it is fetched the first time a snippet
// is formatted and never before. HTML and Markdown embed scripts and styles,
// so every plugin is loaded together.
function loadPrettier() {
  prettierPromise ??= Promise.all([
    import("prettier/standalone"),
    import("prettier/plugins/babel"),
    import("prettier/plugins/estree"),
    import("prettier/plugins/typescript"),
    import("prettier/plugins/postcss"),
    import("prettier/plugins/html"),
    import("prettier/plugins/markdown"),
  ]).then(([prettier, ...plugins]) => ({
    format: prettier.format,
    plugins: plugins as Plugin[],
  }));
  // A failed download can be retried on the next format.
  prettierPromise.catch(() => {
    prettierPromise = null;
  });
  return prettierPromise;
}

export async function formatCode(code: string, language: FormattableLanguage): Promise<string> {
  const { format, plugins } = await loadPrettier();
  const formatted = await format(code, { parser: PARSERS[language], plugins, useTabs: true });
  // Prettier ends every file with a newline; the frame would show it as an empty last line.
  return formatted.replace(/\n+$/, "");
}

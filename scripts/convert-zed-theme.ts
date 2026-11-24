// Converts one theme from a Zed theme family into a VS Code color theme
// that Shiki can load: `vpx scripts/convert-zed-theme.ts <zed.json> <theme
// name> <out.json> <display name> <source note>`.
import { readFileSync, writeFileSync } from "node:fs";

const [input, themeName, output, displayName, source] = process.argv.slice(2);

interface ZedStyle {
  [key: string]: unknown;
  syntax: Record<string, { color?: string; font_style?: string | null }>;
}

const family = JSON.parse(readFileSync(input, "utf8")) as {
  themes: { name: string; appearance: "light" | "dark"; style: ZedStyle }[];
};
const theme = family.themes.find((entry) => entry.name === themeName);
if (!theme) throw new Error(`No theme named "${themeName}" in ${input}`);
const style = theme.style;
const color = (key: string) => style[key] as string | undefined;

// Zed's syntax names, each with the TextMate scopes it stands for.
const SCOPES: [string, string[]][] = [
  ["comment", ["comment", "punctuation.definition.comment"]],
  ["comment.doc", ["comment.block.documentation"]],
  ["string", ["string", "punctuation.definition.string"]],
  ["string.escape", ["constant.character.escape"]],
  ["string.regex", ["string.regexp"]],
  ["string.special.url", ["markup.underline.link"]],
  ["number", ["constant.numeric"]],
  ["boolean", ["constant.language"]],
  ["constant", ["constant", "variable.other.constant", "variable.other.enummember"]],
  ["keyword", ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control"]],
  ["operator", ["keyword.operator", "punctuation.accessor"]],
  ["variable", ["variable", "variable.other", "meta.definition.variable"]],
  ["variable.parameter", ["variable.parameter"]],
  ["variable.builtin", ["variable.language"]],
  [
    "property",
    [
      "variable.other.property",
      "variable.other.object.property",
      "support.variable.property",
      "meta.object-literal.key",
      "support.type.property-name",
    ],
  ],
  [
    "function",
    [
      "entity.name.function",
      "meta.function-call entity.name.function",
      "support.function",
      "variable.function",
    ],
  ],
  ["function.builtin", ["support.function.builtin"]],
  [
    "type",
    [
      "entity.name.type",
      "entity.name.class",
      "support.class",
      "support.type",
      "entity.other.inherited-class",
    ],
  ],
  ["type.builtin", ["support.type.primitive", "support.type.builtin"]],
  ["namespace", ["entity.name.namespace", "entity.name.type.module"]],
  ["tag", ["entity.name.tag", "punctuation.definition.tag"]],
  ["tag.attribute", ["entity.other.attribute-name"]],
  ["punctuation", ["punctuation", "meta.brace"]],
  ["label", ["entity.name.label"]],
  ["title", ["markup.heading", "entity.name.section"]],
  ["emphasis", ["markup.italic"]],
  ["emphasis.strong", ["markup.bold"]],
  ["link_text", ["string.other.link", "markup.underline.link.image"]],
  ["text.literal", ["markup.inline.raw", "markup.raw", "markup.fenced_code"]],
  ["diff.plus", ["markup.inserted"]],
  ["diff.minus", ["markup.deleted"]],
];

const tokenColors = SCOPES.flatMap(([key, scope]) => {
  const syntax = style.syntax[key];
  if (!syntax?.color) return [];
  const fontStyle = syntax.font_style === "italic" ? "italic" : undefined;
  return [{ scope, settings: { foreground: syntax.color, ...(fontStyle ? { fontStyle } : {}) } }];
});

const background = color("editor.background")!;
const vscodeTheme = {
  name: displayName,
  type: theme.appearance,
  source,
  colors: {
    "editor.background": background,
    "editor.foreground": color("editor.foreground") ?? color("text"),
    "editorLineNumber.foreground": color("editor.line_number"),
    "sideBar.background": color("panel.background"),
    "editorGroupHeader.border": color("border"),
    "tab.inactiveBackground": color("tab.inactive_background"),
    "tab.activeBackground": color("tab.active_background"),
    "statusBar.background": color("status_bar.background"),
    "statusBar.foreground": color("text.accent"),
    "editor.wordHighlightBackground": color("editor.document_highlight.read_background"),
    "diffEditor.insertedTextBackground": color("created.background"),
    "diffEditor.removedTextBackground": color("deleted.background"),
  },
  tokenColors: [
    { settings: { foreground: color("editor.foreground") ?? color("text"), background } },
    ...tokenColors,
  ],
};

writeFileSync(output, `${JSON.stringify(vscodeTheme, null, 2)}\n`);
console.log(`Wrote ${displayName} to ${output}`);

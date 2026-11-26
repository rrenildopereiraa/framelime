import type { LanguageId } from "./highlighter";

// Signals read line by line or across the whole paste. Each language is
// told apart from its neighbours by markers it alone uses; when none are
// clear, nothing is detected and the snippet keeps its language.

const JS_KEYWORDS =
  /^\s*(import\s.+\sfrom\s|import\s+["']|export\s|const\s|let\s|var\s|function[\s*]|async\s+function|class\s+\w|if\s*\(|for\s*\(|while\s*\(|return\b)|=>|console\.\w+\(|require\(|document\.|window\./m;

const TS_SIGNALS = [
  /^\s*(export\s+)?(interface|enum|namespace|declare)\s+\w/m,
  /^\s*(export\s+)?type\s+\w+(<[^>]*>)?\s*=/m,
  /\b(as\s+const|satisfies\s+\w)/,
  /[(,]\s*\w+\??\s*:\s*(string|number|boolean|unknown|any|void|never|[A-Z]\w*)(\[\])?\s*[,)=]/,
  /\)\s*:\s*(string|number|boolean|void|unknown|never|Promise<|[A-Z]\w*(<[^>]*>)?)\s*[{=]/,
  /\b(const|let|var)\s+\w+\s*:\s*[\w<[\]>|. ]+\s*=/,
  /\b(private|protected|public|readonly)\s+\w+\s*[:;=(]/,
  /<[A-Z]\w*(\s+extends\s+[^>]+)?>\s*\(/,
  /^\s*import\s+type\s/m,
];

// A tag where JS can put an expression: after return, `(`, `=`, `&&`, `?`, `:` or `=>`.
const JSX_SIGNALS = [
  /(return|=>|[(=?:]|&&)\s*\(?\s*<([A-Za-z][\w.]*|>)[\s/>]/,
  /\sclassName=/,
  // A closing or self-closing tag; an opening one alone could be a generic.
  /<\/[A-Za-z][\w.]*>|<[A-Za-z][\w.]*(\s[^<>]*)?\/>/,
];

const CSS_DECLARATION = /^\s*-{0,2}[a-z][a-z-]*\s*:\s*[^;{}]+;\s*$/m;
const CSS_BLOCK = /^\s*[^\s{}=()][^{}=()]*\{\s*$/m;
const CSS_AT_RULE =
  /^\s*@(media|import|font-face|keyframes|supports|layer|tailwind|yummacss|container)\b/m;
const SCSS_SIGNALS = [
  /^\s*\$[\w-]+\s*:/m,
  /^\s*@(mixin|include|use|forward|extend|each|if|function|return)\b/m,
  /^\s*&[\w:.[-]/m,
  /^\s*\/\/\s/m,
  /#\{\$/,
];

const MARKDOWN_SIGNALS = [
  /^#{1,6}\s+\S/m,
  /^\s*[-*+]\s+\S/m,
  /^\s*\d+\.\s+\S/m,
  /^```/m,
  /\[[^\]]+\]\([^)]+\)/,
  /^>\s/m,
  /\*\*[^*]+\*\*/,
];

const HTML_DOCUMENT = /^\s*(<!doctype html|<html[\s>]|<head[\s>]|<body[\s>])/i;
const HTML_TAG_START = /^\s*<([a-z][\w-]*)[\s>]/i;

function count(code: string, patterns: RegExp[]) {
  return patterns.filter((pattern) => pattern.test(code)).length;
}

/** The language a paste is written in, or `null` when it isn't clear. */
export function detectLanguage(code: string): LanguageId | null {
  const text = code.replace(/\r\n?/g, "\n").trim();
  if (text.length === 0) return null;

  if (/<\?php\b/.test(text)) return "php";

  // Single-file components: a template or script block at the top level.
  const hasScriptBlock = /^<script[\s>]/m.test(text);
  const hasStyleBlock = /^<style[\s>]/m.test(text);
  if (
    /^<template[\s>]/m.test(text) &&
    (hasScriptBlock || hasStyleBlock || /^<\/template>/m.test(text))
  ) {
    return "vue";
  }
  if (
    (hasScriptBlock || /^\s*</.test(text)) &&
    /\{#(if|each|await|key|snippet)\s|\{@(html|render|const)\s|\s(on|bind):\w+=|\$(state|props|derived|effect)\(|^\s*\$:\s/m.test(
      text,
    )
  ) {
    return "svelte";
  }
  if (/^---\n[\s\S]*?\n---\n/.test(text)) {
    const body = text.replace(/^---\n[\s\S]*?\n---\n/, "");
    const frontmatter = text.slice(0, text.length - body.length);
    if (/^\s*</.test(body) && /\b(import|const|Astro\.)/.test(frontmatter)) return "astro";
  }

  // Markup that starts with a tag and isn't JSX inside code.
  if (HTML_DOCUMENT.test(text)) return "html";
  if (HTML_TAG_START.test(text) && !JS_KEYWORDS.test(text) && count(text, MARKDOWN_SIGNALS) === 0) {
    return "html";
  }

  // Stylesheets: declarations in blocks, with no code around them.
  const looksLikeCss =
    !JS_KEYWORDS.test(text) &&
    (CSS_DECLARATION.test(text) || CSS_AT_RULE.test(text)) &&
    (CSS_BLOCK.test(text) || CSS_AT_RULE.test(text));
  if (looksLikeCss) return count(text, SCSS_SIGNALS) > 0 ? "scss" : "css";

  const markdown = count(text, MARKDOWN_SIGNALS);
  const esm = /^(import|export)\s/m.test(text);
  if (markdown >= 2 || (markdown >= 1 && !JS_KEYWORDS.test(text))) {
    const jsxInProse = /^<[A-Z]\w*[\s/>]/m.test(text);
    return esm || jsxInProse ? "mdx" : "markdown";
  }

  if (!JS_KEYWORDS.test(text) && count(text, JSX_SIGNALS) === 0) return null;
  const typed = count(text, TS_SIGNALS) > 0;
  const jsx = count(text, JSX_SIGNALS) > 0;
  if (typed) return jsx ? "tsx" : "typescript";
  return jsx ? "jsx" : "javascript";
}

const EXTENSIONS: Record<LanguageId, string> = {
  html: "html",
  javascript: "js",
  mjs: "mjs",
  jsx: "jsx",
  typescript: "ts",
  tsx: "tsx",
  astro: "astro",
  vue: "vue",
  svelte: "svelte",
  markdown: "md",
  mdx: "mdx",
  css: "css",
  scss: "scss",
  php: "php",
};

/**
 * The file name for a language change: one ending in the old language's
 * extension takes the new one, so `shuffle.js` becomes `shuffle.css`. Any
 * other name is left as it was.
 */
export function renameForLanguage(fileName: string, from: LanguageId, to: LanguageId) {
  const suffix = `.${EXTENSIONS[from]}`;
  if (!fileName.endsWith(suffix)) return fileName;
  return `${fileName.slice(0, -suffix.length)}.${EXTENSIONS[to]}`;
}

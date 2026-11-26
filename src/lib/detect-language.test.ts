import { describe, expect, it } from "vite-plus/test";
import { detectLanguage, renameForLanguage } from "./detect-language";
import { SNIPPETS } from "./snippets";

const SAMPLES: [string, string][] = [
  ["php", `<?php\n\necho "Hello";\n`],
  [
    "vue",
    `<template>\n  <button @click="count++">{{ count }}</button>\n</template>\n\n<script setup>\nimport { ref } from "vue";\nconst count = ref(0);\n</script>\n`,
  ],
  [
    "svelte",
    `<script>\n  let count = $state(0);\n</script>\n\n<button onclick={() => count++}>{count}</button>\n{#if count > 3}<p>Many</p>{/if}\n`,
  ],
  [
    "astro",
    `---\nimport Layout from "../layouts/Layout.astro";\nconst title = "Home";\n---\n\n<Layout title={title}>\n  <h1>{title}</h1>\n</Layout>\n`,
  ],
  ["html", `<!DOCTYPE html>\n<html>\n  <body>\n    <p>Hi</p>\n  </body>\n</html>\n`],
  ["html", `<section class="d:f">\n  <h2>Title</h2>\n  <p>Text</p>\n</section>\n`],
  ["css", `.card {\n  display: flex;\n  gap: 1rem;\n}\n`],
  ["css", `@media (min-width: 40rem) {\n  .card {\n    padding: 2rem;\n  }\n}\n`],
  ["scss", `$gap: 1rem;\n\n.card {\n  gap: $gap;\n  &:hover {\n    color: red;\n  }\n}\n`],
  [
    "markdown",
    `# Title\n\nSome **bold** text and a [link](https://example.com).\n\n- one\n- two\n`,
  ],
  [
    "mdx",
    `import { Chart } from "./chart";\n\n# Sales\n\n<Chart year={2026} />\n\n- up\n- right\n`,
  ],
  [
    "javascript",
    `const total = items.reduce((sum, item) => sum + item.price, 0);\nconsole.log(total);\n`,
  ],
  [
    "typescript",
    `interface User {\n  id: number;\n  name: string;\n}\n\nexport const greet = (user: User) => user.name;\n`,
  ],
  ["typescript", `function add(a: number, b: number): number {\n  return a + b;\n}\n`],
  ["jsx", `export function App() {\n  return <div className="p:4">Hello</div>;\n}\n`],
  [
    "tsx",
    `type Props = { name: string };\n\nexport function Hello({ name }: Props) {\n  return <h1>Hi {name}</h1>;\n}\n`,
  ],
];

describe("detectLanguage", () => {
  it.each(SAMPLES)("detects %s", (language, code) => {
    expect(detectLanguage(code)).toBe(language);
  });

  it("detects nothing in plain prose or an empty paste", () => {
    expect(detectLanguage("")).toBeNull();
    expect(detectLanguage("   \n")).toBeNull();
    expect(detectLanguage("just a sentence")).toBeNull();
  });

  it("reads every sample snippet as its own language, or JavaScript for MJS", () => {
    for (const snippet of SNIPPETS) {
      const expected = snippet.language === "mjs" ? "javascript" : snippet.language;
      expect(detectLanguage(snippet.code), snippet.fileName).toBe(expected);
    }
  });
});

describe("renameForLanguage", () => {
  it("swaps the old language's extension for the new one", () => {
    expect(renameForLanguage("shuffle.js", "javascript", "css")).toBe("shuffle.css");
    expect(renameForLanguage("shuffle.css", "css", "javascript")).toBe("shuffle.js");
  });

  it("leaves other names alone", () => {
    expect(renameForLanguage("notes", "javascript", "css")).toBe("notes");
    expect(renameForLanguage("app.tsx", "typescript", "css")).toBe("app.tsx");
  });
});

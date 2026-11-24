// Writes src/themes/catalog.json: run after adding or updating a theme.
import { writeFileSync } from "node:fs";
import { buildThemeCatalog } from "../src/lib/theme-catalog-build";

const catalog = await buildThemeCatalog();
writeFileSync(
  new URL("../src/themes/catalog.json", import.meta.url),
  `${JSON.stringify(catalog, null, 2)}\n`,
);
console.log(`Wrote ${Object.keys(catalog).length} themes`);

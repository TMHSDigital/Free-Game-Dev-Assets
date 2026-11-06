#!/usr/bin/env node
/**
 * Rewrites every place the repo restates the entry count, from the catalog
 * itself: the category tables in README.md and catalog/README.md, the README
 * badge, "Browse N sources", "searches all N entries", and
 * expectedEntryCount in site/config.json. The README and table counts are
 * of listed entries (deprecated ones are hidden on the site, so the numbers
 * match its "All" chip); expectedEntryCount counts every file. Run after
 * adding, removing or deprecating entries: node site/sync-counts.mjs. The validator (V6) checks the same
 * places, so it passes afterwards.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { countEntriesByCategory } from "./lib/entry-files.mjs";
import { syncCatalogReadme, syncConfig, syncReadme } from "./lib/scaffold.mjs";
import { cliArgs } from "./lib/cli.mjs";

// No flags: a mistyped one fails instead of being ignored.
cliArgs({}, "node site/sync-counts.mjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");

let changed = false;
function update(file, fn) {
  const full = path.join(ROOT, file);
  const before = fs.readFileSync(full, "utf8");
  const after = fn(before);
  if (after !== before) {
    fs.writeFileSync(full, after);
    changed = true;
    console.log(`updated ${file}`);
  }
}

const { counts, total, files, deprecated } = countEntriesByCategory(CATALOG);

update("README.md", (t) => syncReadme(t, counts, total));
update("catalog/README.md", (t) => syncCatalogReadme(t, counts));
update("site/config.json", (t) => syncConfig(t, files));

console.log(`${total} listed entries (${files} files, ${deprecated} deprecated): ${Object.entries(counts).map(([c, n]) => `${c} ${n}`).join(", ")}`);
// The README screenshot (also the social card) shows the count as an image,
// which no script can update.
if (changed) {
  console.log("The count changed: retake docs/images/readme/og-card.png after the next build (site/README.md, \"Social preview\").");
}

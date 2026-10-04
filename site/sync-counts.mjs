#!/usr/bin/env node
/**
 * Rewrites every place the repo restates the entry count, from the catalog
 * itself: the category tables in README.md and catalog/README.md, the README
 * badge, "Browse N sources", "searches all N entries", and
 * expectedEntryCount in site/config.json. Run after adding or removing
 * entries: node site/sync-counts.mjs. The validator (V6) checks the same
 * places, so it passes afterwards.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { listEntryFiles } from "./lib/entry-files.mjs";
import { syncCatalogReadme, syncConfig, syncReadme } from "./lib/scaffold.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
function countEntries() {
  const counts = {};
  for (const d of fs.readdirSync(CATALOG, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith(".")) continue;
    counts[d.name] = listEntryFiles(path.join(CATALOG, d.name)).length;
  }
  return counts;
}

function update(file, fn) {
  const full = path.join(ROOT, file);
  const before = fs.readFileSync(full, "utf8");
  const after = fn(before);
  if (after !== before) {
    fs.writeFileSync(full, after);
    console.log(`updated ${file}`);
  }
}

const counts = countEntries();
const total = Object.values(counts).reduce((a, b) => a + b, 0);

update("README.md", (t) => syncReadme(t, counts, total));
update("catalog/README.md", (t) => syncCatalogReadme(t, counts));
update("site/config.json", (t) => syncConfig(t, total));

console.log(`${total} entries: ${Object.entries(counts).map(([c, n]) => `${c} ${n}`).join(", ")}`);

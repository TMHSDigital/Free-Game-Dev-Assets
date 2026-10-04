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

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Replaces the count cell of each category row whose line contains `fragment` (CAT = category). */
function syncTable(text, counts, fragment) {
  let out = text;
  for (const [cat, n] of Object.entries(counts)) {
    const re = new RegExp(`(\\|[^|\\n]*\\|\\s*)\\d+(\\s*\\|[^\\n]*${escRe(fragment.replace("CAT", cat))})`);
    out = out.replace(re, `$1${n}$2`);
  }
  return out;
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

update("README.md", (t) =>
  syncTable(t, counts, "catalog/CAT/")
    .replace(/badge\/sources-\d+-/, `badge/sources-${total}-`)
    .replace(/Browse \d+ sources/g, `Browse ${total} sources`)
    .replace(/searches all \d+ entries/g, `searches all ${total} entries`)
);
update("catalog/README.md", (t) => syncTable(t, counts, "`CAT/`"));
update("site/config.json", (t) => t.replace(/("expectedEntryCount":\s*)\d+/, `$1${total}`));

console.log(`${total} entries: ${Object.entries(counts).map(([c, n]) => `${c} ${n}`).join(", ")}`);

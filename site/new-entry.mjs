#!/usr/bin/env node
/**
 * Starts a catalog entry from catalog/TEMPLATE.md:
 *   node site/new-entry.mjs <category> <id>
 * Writes catalog/<category>/<id>.md with the id, category and today's date
 * filled in, then prints the steps that still need a person: the licence
 * research, the category README row, and the checks.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { newEntryProblem, newEntryText } from "./lib/scaffold.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");

function fail(msg) {
  console.error(`new-entry: ${msg}`);
  process.exit(1);
}

const [category, id] = process.argv.slice(2);
const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
// Ids are unique across the whole catalog, not per category.
const taken = id
  ? fs.readdirSync(CATALOG, { withFileTypes: true }).find((d) => d.isDirectory() && fs.existsSync(path.join(CATALOG, d.name, `${id}.md`)))?.name
  : undefined;
const problem = newEntryProblem({ category, id, categories: Object.keys(config.categories || {}), taken });
if (problem) fail(problem);

const today = new Date().toISOString().slice(0, 10);
const text = newEntryText(fs.readFileSync(path.join(CATALOG, "TEMPLATE.md"), "utf8"), { id, category, today });

const rel = `catalog/${category}/${id}.md`;
// A category can be in config.json before its folder exists.
fs.mkdirSync(path.join(CATALOG, category), { recursive: true });
fs.writeFileSync(path.join(ROOT, rel), text);

console.log(`wrote ${rel}

Next:
  1. Fill every frontmatter field from the live source page (CONTRIBUTING.md,
     "Frontmatter rules"), and replace the example body. Quote the licence in
     ## Evidence with today's date: (${today}).
  2. Add a row for [${id}.md](${id}.md) to catalog/${category}/README.md.
  3. node site/sync-counts.mjs   (README counts, badge, expectedEntryCount)
  4. npm test && npm run validate   (quick; CI also runs the full build)`);

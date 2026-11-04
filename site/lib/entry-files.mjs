/**
 * The one list of catalog entry files. build, validate, sync-counts and
 * check-links all read it, so a file is either an entry everywhere or nowhere.
 */
import fs from "node:fs";
import path from "node:path";

/** A short kebab-case id: the only thing an entry's file name, page path and thumbnail name are built from. */
export const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * True when `id` may be used as a path segment for `file`: it matches ID_RE
 * and equals the file's base name. validate reports the mismatch; the other
 * scripts refuse to build a path from anything else.
 */
export function idMatchesFile(id, file) {
  return ID_RE.test(String(id)) && String(id) === path.basename(String(file), ".md");
}

/** Not entries: the category index and the copy-me template. */
export const NON_ENTRY_MD = new Set(["README.md", "TEMPLATE.md"]);
/** Never walked: hidden folders (any name starting ".") and local scratch. */
const SKIP_DIRS = new Set(["_scratch", "node_modules"]);

/** Absolute paths of every entry file under `dir`, sorted. */
export function listEntryFiles(dir) {
  const out = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (!ent.name.startsWith(".") && !SKIP_DIRS.has(ent.name)) walk(full);
      } else if (ent.name.endsWith(".md") && !NON_ENTRY_MD.has(ent.name)) {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out.sort();
}

/** True when an entry file's frontmatter says `status: deprecated`. */
export function isDeprecated(text) {
  const fm = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return Boolean(fm && /^status:\s*["']?deprecated["']?\s*(#.*)?$/m.test(fm[1]));
}

/**
 * Entry counts per category folder, from the same list build and validate
 * use, so a skipped folder (catalog/_scratch) never counts. `total` also
 * includes any entry file outside a category folder, as validate's does.
 */
export function countEntriesByCategory(catalogDir) {
  const files = listEntryFiles(catalogDir);
  let deprecated = 0;
  const counts = {};
  for (const d of fs.readdirSync(catalogDir, { withFileTypes: true })) {
    if (d.isDirectory() && !d.name.startsWith(".") && !SKIP_DIRS.has(d.name)) counts[d.name] = 0;
  }
  for (const file of files) {
    const [first, ...rest] = path.relative(catalogDir, file).split(path.sep);
    if (isDeprecated(fs.readFileSync(file, "utf8"))) {
      deprecated += 1;
      continue;
    }
    if (rest.length && first in counts) counts[first] += 1;
  }
  return { counts, total: files.length - deprecated, files: files.length, deprecated };
}

/**
 * The one list of catalog entry files and the one way to read them. build,
 * validate, sync-counts, check-links, check-added, reverify-batch, thumbs and
 * pr-diff all use it, so a file is either an entry everywhere or nowhere.
 */
import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter.mjs";

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
/** Never walked: hidden folders (".git"), underscore folders ("_scratch") and node_modules. */
const skipDir = (name) => name.startsWith(".") || name.startsWith("_") || name === "node_modules";

/**
 * True when `rel` (a path under catalog/, "/" or the platform separator) names
 * an entry file. listEntryFiles walks by this rule and pr-diff filters a git
 * diff by it, so both agree on what an entry is.
 */
export function isEntryPath(rel) {
  const parts = String(rel).split(/[\\/]/);
  const name = parts.pop();
  // A file named like a skipped folder (_draft.md, .notes.md) is a draft, not an entry.
  return name.endsWith(".md") && !NON_ENTRY_MD.has(name) && !skipDir(name) && !parts.some(skipDir);
}

/** Absolute paths of every entry file under `dir`, sorted. */
export function listEntryFiles(dir) {
  const out = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        if (!skipDir(ent.name)) walk(full);
      } else if (isEntryPath(path.relative(dir, full))) {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out.sort();
}

/**
 * Every entry file under `catalogDir`, read and parsed once:
 * `[{ file, rel, text, parsed }]`, where `rel` is relative to `root` with "/"
 * and `parsed` is parseFrontmatter's `{ meta, body, errors }` or null. Each
 * script then filters with a named rule (usableRecord, or its own).
 */
export function readCatalog(catalogDir, { root = path.dirname(catalogDir), read = (f) => fs.readFileSync(f, "utf8") } = {}) {
  return listEntryFiles(catalogDir).map((file) => {
    const text = read(file);
    return { file, rel: path.relative(root, file).split(path.sep).join("/"), text, parsed: parseFrontmatter(text) };
  });
}

/** A record whose frontmatter parsed cleanly and whose id matches its file name. */
export function usableRecord(r) {
  return Boolean(r.parsed && !r.parsed.errors.length && idMatchesFile(r.parsed.meta.id, r.file));
}

/** True when an entry file's frontmatter says `status: deprecated` (read as validate reads it, BOM and all). */
export function isDeprecated(text) {
  return String(parseFrontmatter(text)?.meta.status ?? "") === "deprecated";
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
    if (d.isDirectory() && !skipDir(d.name)) counts[d.name] = 0;
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

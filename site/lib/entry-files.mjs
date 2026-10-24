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

/**
 * The text rewrites behind site/sync-counts.mjs and site/new-entry.mjs, as
 * pure functions so lib.test.mjs can check them. The CLIs do the file I/O.
 */

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Replaces the count cell of each category row whose line contains `fragment` (CAT = category). */
export function syncTable(text, counts, fragment) {
  let out = text;
  for (const [cat, n] of Object.entries(counts)) {
    const re = new RegExp(`(\\|[^|\\n]*\\|\\s*)\\d+(\\s*\\|[^\\n]*${escRe(fragment.replace("CAT", cat))})`);
    out = out.replace(re, `$1${n}$2`);
  }
  return out;
}

/** README.md: the category table, the badge, "Browse N sources" and "searches all N entries". */
export function syncReadme(text, counts, total) {
  return syncTable(text, counts, "catalog/CAT/")
    .replace(/badge\/sources-\d+-/, `badge/sources-${total}-`)
    .replace(/Browse \d+ sources/g, `Browse ${total} sources`)
    .replace(/searches all \d+ entries/g, `searches all ${total} entries`);
}

export const syncCatalogReadme = (text, counts) => syncTable(text, counts, "`CAT/`");

export const syncConfig = (text, total) => text.replace(/("expectedEntryCount":\s*)\d+/, `$1${total}`);

export const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Why new-entry must refuse these arguments, or null. `taken` is the category already holding the id, if any. */
export function newEntryProblem({ category, id, categories, taken }) {
  if (!category || !id) return "usage: node site/new-entry.mjs <category> <id>";
  if (!categories.includes(category)) return `"${category}" is not a category. Use one of: ${categories.join(", ")}`;
  if (!ID_RE.test(id)) return `"${id}" is not a short kebab-case id`;
  if (taken) return `catalog/${taken}/${id}.md already exists`;
  return null;
}

/** The template with the id, category and date filled in. A new entry starts unsettled. */
export function newEntryText(template, { id, category, today }) {
  return template
    .replace(/^id: .*$/m, `id: ${id}`)
    .replace(/^category: .*$/m, `category: ${category}`)
    .replace(/^verified: .*$/m, `verified: ${today}`)
    // Set active once the licence is read and quoted.
    .replace(/^status: .*$/m, "status: needs-review");
}

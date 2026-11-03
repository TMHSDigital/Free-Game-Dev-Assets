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

import { ID_RE } from "./entry-files.mjs";
export { ID_RE };

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
    .replace(/^added: .*$/m, `added: ${today}`)
    .replace(/^verified: .*$/m, `verified: ${today}`)
    // Set active once the licence is read and quoted.
    .replace(/^status: .*$/m, "status: needs-review");
}

/* ------------------------------------------------ draft from a New source issue */

/**
 * The fields of a GitHub issue-form body, by label. Forms render each answer
 * as "### <label>" then the value; an empty answer is "_No response_".
 */
export function parseIssueForm(body) {
  const out = {};
  const parts = String(body || "").replace(/\r\n/g, "\n").split(/^### +/m).slice(1);
  for (const part of parts) {
    const nl = part.indexOf("\n");
    const label = (nl === -1 ? part : part.slice(0, nl)).trim();
    const value = (nl === -1 ? "" : part.slice(nl + 1)).trim();
    out[label] = value === "_No response_" ? "" : value;
  }
  return out;
}

/** The New source form's dropdown answers, as frontmatter values. Anything else is "unknown". */
export const FORM_COMMERCIAL = {
  "Explicitly allowed": true,
  "Explicitly forbidden": false,
  "Video/YouTube only (not games)": false,
  "Unclear / per-file": "unknown",
};
export const FORM_ATTRIBUTION = {
  Yes: true,
  No: false,
  "Credit appreciated but not required": false,
  Unclear: "unknown",
};

/** A YAML double-quoted scalar. */
const yamlString = (s) => `"${String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\s+/g, " ").trim()}"`;

/**
 * A draft entry from a parsed New source form. It always starts
 * `needs-review`, and subcategories, formats and tags are left empty, so
 * validate fails until a maintainer has read the source and filled them in.
 * A licence outside the vocabulary becomes `unknown`. The reporter's quote
 * goes into Evidence, marked as reported, for the maintainer to re-read.
 * Returns `{ text, warnings }`.
 */
export function entryFromIssue(template, form, { id, issue, today, vocab }) {
  const warnings = [];
  const name = form["Name"] || id;
  const url = form["Publisher URL"] || "";
  const category = form["Category"] || "";
  const reported = (form["License as stated on the live page"] || "").trim();
  const term = vocab.licenses?.[reported];
  const license = term ? reported : "unknown";
  if (!term) warnings.push(`licence "${reported}" is not in site/license-vocabulary.json; set to unknown`);
  const commercial = Object.prototype.hasOwnProperty.call(FORM_COMMERCIAL, form["Commercial / game use"]) ? FORM_COMMERCIAL[form["Commercial / game use"]] : "unknown";
  const attribution = Object.prototype.hasOwnProperty.call(FORM_ATTRIBUTION, form["Credit required?"]) ? FORM_ATTRIBUTION[form["Credit required?"]] : "unknown";
  const credit = (form["Credit line as the source words it"] || "").trim();
  const quote = (form["Licence quote and date"] || "").replace(/\s+/g, " ").trim();
  const quoteDate = quote.match(/\b(\d{4}-\d{2}-\d{2})\b/)?.[1];
  const verified = quoteDate && quoteDate <= today ? quoteDate : today;
  if (!quoteDate) warnings.push("the quote has no YYYY-MM-DD date; verified is set to today");
  const isPublisher = /- \[x\] I publish or maintain this source/i.test(form["Relationship to the source"] || "");

  let fm = newEntryText(template, { id, category, today })
    .replace(/^name: .*$/m, `name: ${yamlString(name)}`)
    .replace(/^url: .*$/m, `url: ${url}`)
    .replace(/^subcategories: .*$/m, "subcategories: []")
    .replace(/^license: .*$/m, `license: ${yamlString(license)}`)
    .replace(/^commercial: .*$/m, `commercial: ${commercial}`)
    .replace(/^attribution_required: .*$/m, `attribution_required: ${attribution}${credit ? `\nattribution_string: ${yamlString(credit)}` : ""}`)
    .replace(/^formats: .*$/m, "formats: []")
    .replace(/^tags: .*$/m, "tags: []")
    .replace(/^verified: .*$/m, `verified: ${verified}`);
  fm = term?.spdx ? fm.replace(/^license_spdx: .*$/m, `license_spdx: ${term.spdx}`) : fm.replace(/^license_spdx: .*\n/m, "");

  const head = fm.slice(0, fm.indexOf("\n---", 4) + 4);
  const notes = [
    `- Drafted from #${issue}. Every field below came from the reporter: re-read the source before setting \`active\`.`,
    ...(isPublisher ? [`- Submitted by the publisher (#${issue}).`] : []),
    ...((form["Why it belongs"] || "").trim() ? [`- Reporter's note: ${form["Why it belongs"].replace(/\s+/g, " ").trim()}`] : []),
  ];
  const body = [
    "",
    `# ${name}`,
    "",
    "One-paragraph summary: what you get, why it's useful, any caveats.",
    "",
    "## Notes",
    "",
    ...notes,
    "",
    "## Evidence",
    "",
    quote ? `- Reported in #${issue}: ${quote}` : `- Reported in #${issue} without a quote: read the licence page and quote it here.`,
    "",
  ];
  return { text: `${head}\n${body.join("\n")}`, warnings };
}

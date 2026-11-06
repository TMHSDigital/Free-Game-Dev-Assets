/**
 * What a pull request changes in the licence facts of catalog entries, as a
 * Markdown table for the CI step summary (site/pr-diff.mjs). A reviewer sees
 * every changed licence field, old and new, beside the newest Evidence line
 * that should back it, instead of reading raw frontmatter diffs. Pure.
 */
import { evidenceSection, parseFrontmatter } from "./frontmatter.mjs";
import { isEntryPath } from "./entry-files.mjs";

/**
 * The entry files in `git diff --name-status -z` output, as
 * `[{ status, file }]`. A/M/D/T rows of non-entry files (category READMEs,
 * underscore and dot folders) are dropped; anything outside catalog/ too.
 */
export function changedEntries(nameStatusZ) {
  const parts = String(nameStatusZ).split("\0").filter(Boolean);
  const out = [];
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const status = parts[i];
    const file = parts[i + 1];
    if (!file.startsWith("catalog/") || !isEntryPath(file.slice("catalog/".length))) continue;
    out.push({ status, file });
  }
  return out;
}

const metaAndBody = (text) => {
  const parsed = text === null ? null : parseFrontmatter(text);
  return parsed ? { meta: parsed.meta, body: parsed.body } : { meta: null, body: "" };
};

/**
 * One table row per changed entry. `before(file)` reads the base version and
 * `after(file)` the working one; neither is called for an added or removed file.
 */
export function diffRows(changes, { before, after }) {
  return changes.map(({ status, file }) => {
    const a = metaAndBody(status === "A" ? null : before(file));
    const b = metaAndBody(status === "D" ? null : after(file));
    return {
      file,
      change: status === "A" ? "added" : status === "D" ? "removed" : "modified",
      fields: licenceChanges(a.meta, b.meta),
      evidence: newestEvidenceLine(b.body || a.body),
    };
  });
}

/** The frontmatter fields that carry a licence fact, in table order. */
export const LICENCE_FIELDS = [
  "status",
  "license",
  "license_spdx",
  "commercial",
  "attribution_required",
  "attribution_string",
  "engine_lock",
  "limits",
  "preview",
  "verified",
];

const DATE_RE = /\b(\d{4}-\d{2}-\d{2})\b/g;

const text = (v) => (v === undefined || v === null || v === "" ? null : Array.isArray(v) ? v.join(", ") : String(v));

/** Changed licence fields between two frontmatter objects (either may be null: added or removed). */
export function licenceChanges(before, after) {
  const out = [];
  for (const field of LICENCE_FIELDS) {
    const a = before ? text(before[field]) : null;
    const b = after ? text(after[field]) : null;
    if (a !== b) out.push({ field, before: a, after: b });
  }
  return out;
}

/** The Evidence line carrying the newest date (dates inside URLs ignored), or null. */
export function newestEvidenceLine(body) {
  const ev = evidenceSection(String(body || ""));
  if (!ev) return null;
  let best = null;
  for (const line of ev.split(/\r?\n/)) {
    const prose = line.replace(/\]\([^)]*\)/g, "]").replace(/https?:\/\/\S+/g, "");
    for (const m of prose.matchAll(DATE_RE)) {
      if (!best || m[1] > best.date) best = { date: m[1], line: line.trim() };
    }
  }
  return best ? best.line : null;
}

/** A value as an inert inline code span (or an em dash for none), safe inside a table cell. */
function cell(v, max = 160) {
  if (v === null || v === undefined) return "—";
  let s = String(v).replace(/\s+/g, " ").trim();
  if (s.length > max) s = `${s.slice(0, max - 1)}…`;
  s = s.replaceAll("`", "'").replaceAll("|", "\\|");
  return `\`${s}\``;
}

/**
 * The step-summary Markdown for a list of `{ file, change: "added"|"removed"|"modified",
 * fields: [{ field, before, after }], evidence }`.
 */
export function licenceDiffMarkdown(rows) {
  const changed = rows.filter((r) => r.fields.length);
  const lines = ["## Licence fields changed in this pull request", ""];
  if (!changed.length) {
    lines.push("No licence field changed in any catalog entry.", "");
    return lines.join("\n");
  }
  lines.push(
    `${changed.length} ${changed.length === 1 ? "entry" : "entries"} changed. Check each new value against the Evidence line beside it.`,
    "",
    "| Entry | Field | Before | After | Newest Evidence line |",
    "| --- | --- | --- | --- | --- |"
  );
  for (const r of changed) {
    const label = `${cell(r.file)}${r.change === "modified" ? "" : ` (${r.change})`}`;
    r.fields.forEach((f, i) => {
      lines.push(`| ${i ? "" : label} | ${f.field} | ${cell(f.before)} | ${cell(f.after)} | ${i ? "" : cell(r.evidence, 220)} |`);
    });
  }
  lines.push("");
  return lines.join("\n");
}

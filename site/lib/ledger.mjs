/**
 * docs/review-ledger.md, newest section first, as data (#91). The site shows
 * the ledger as a guide page (guide/changelog/), and the README "Recent"
 * block is written from its newest headings by sync-counts, so neither is
 * kept by hand. Pure.
 */

/** Sections headed `## YYYY-MM-DD (title)`, in file order: [{ date, title }]. */
export function ledgerSections(md) {
  const out = [];
  for (const m of String(md).matchAll(/^## (\d{4}-\d{2}-\d{2}) \((.+)\)\s*$/gm)) out.push({ date: m[1], title: m[2] });
  return out;
}

/** The README "Recent" blockquote for the newest `n` sections. */
export function recentBlock(sections, n = 3) {
  const rows = sections.slice(0, n).map((s) => `${s.date}, ${s.title}.`);
  if (!rows.length) return "";
  return [`> **Recent:** ${rows[0]}`, ...rows.slice(1).map((r) => `> ${r}`), "> Every run is in the [changelog](docs/review-ledger.md)."].join("\n");
}

const RECENT_RE = /^> \*\*Recent:\*\*.*(?:\n>.*)*/m;

/** README text with its "Recent" block replaced by `block`; unchanged when it has none. */
export function syncRecentBlock(readme, block) {
  return RECENT_RE.test(readme) ? readme.replace(RECENT_RE, () => block) : readme;
}

/** The README's current "Recent" block, or null. */
export function readmeRecentBlock(readme) {
  return String(readme).match(RECENT_RE)?.[0] ?? null;
}

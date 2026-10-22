/**
 * The monthly re-verification batch: which entries to re-read next and the
 * checklist issue that asks for it. Pure, so lib.test.mjs can pin the
 * selection rule; site/reverify-batch.mjs does the file I/O.
 */

/** Days since a licence check before the entry is due again. Half of "aging". */
export const DUE_DAYS = 150;
/** Months the whole catalog should take to cycle through the batches. */
export const CYCLE_MONTHS = 10;

/** Days since `verified` at `now`, or null when the date is unusable. */
function ageDays(verified, now) {
  const t = Date.parse(`${verified}T00:00:00Z`);
  return Number.isNaN(t) ? null : Math.floor((now - t) / 86400000);
}

/**
 * The entries due for a re-read: active or needs-review, last checked more
 * than `dueDays` ago or never, oldest first. `size` defaults to a tenth of
 * the live catalog so every entry comes round in about CYCLE_MONTHS.
 */
export function pickBatch(entries, { now = Date.now(), dueDays = DUE_DAYS, size } = {}) {
  const live = entries.filter((e) => e.status !== "deprecated");
  const limit = size ?? Math.ceil(live.length / CYCLE_MONTHS);
  return live
    .map((entry) => ({ entry, age: entry.verified ? ageDays(entry.verified, now) : null }))
    .filter((r) => r.age === null || r.age > dueDays)
    .sort((a, b) => (b.age ?? Infinity) - (a.age ?? Infinity) || a.entry.id.localeCompare(b.entry.id))
    .slice(0, limit)
    .map((r) => ({ ...r.entry, age: r.age }));
}

const code = (s) => `\`${String(s).replaceAll("`", "%60")}\``;

/** The issue body: how to do one, then a checklist with what to re-read. */
export function batchIssueMarkdown({ batch, repo, date, total, dueDays = DUE_DAYS }) {
  const lines = [
    `Monthly re-verification batch, ${date}: the ${batch.length} entries whose licence was read longest ago (more than ${dueDays} days, out of ${total} live entries). Each one is a small, self-contained check, and a good first contribution.`,
    "",
    "**How to do one**",
    "1. Open the entry and its source page (the `url` in the frontmatter).",
    "2. Find the licence or terms page and read what it says about commercial use, attribution and redistribution.",
    "3. If it still supports the entry, update `verified` to today's date and add a dated quote under `## Evidence`, for example `- Terms page (YYYY-MM-DD): \"...\"`.",
    "4. If the terms are unclear, mixed per file, or have changed, set `status: needs-review` and note what you found under `## Notes`. If the source is gone, say so in a comment and we will deprecate it.",
    "",
    "The rule is in [CONTRIBUTING.md](CONTRIBUTING.md): a wrong licence claim is worse than a missing entry, so never infer a licence from the site's reputation. One PR per entry or a few at a time is fine. `npm run validate` checks the file; CI runs it on your PR.",
    "",
    "**Entries** (oldest check first)",
    "",
    ...batch.map((e) => {
      const when = e.verified ? `verified ${e.verified}${e.age !== null ? ` (${e.age} days ago)` : ""}` : "no verified date";
      return `- [ ] [${code(e.id)}](${repo}/blob/main/${e.rel}): ${code(e.url)}, recorded as ${code(e.license)}, ${e.status}, ${when}`;
    }),
    "",
    "Opened by `.github/workflows/reverify.yml`; the next batch replaces this list if it is still open.",
    "",
  ];
  return lines.join("\n");
}

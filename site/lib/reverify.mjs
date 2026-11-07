/**
 * The monthly re-verification batch: which entries to re-read next and the
 * checklist issue that asks for it. Pure, so lib.test.mjs can pin the
 * selection rule; site/reverify-batch.mjs does the file I/O.
 */

import { isListed, VERIFIED_FRESH_DAYS } from "./shared.mjs";

/**
 * Days since a licence check before the entry is due again: 30 days inside
 * the fresh window, so a batch reaches an entry before its cue turns from
 * fresh to aging.
 */
export const DUE_DAYS = VERIFIED_FRESH_DAYS - 30;

/** Days since `verified` at `now`, or null when the date is unusable. */
function ageDays(verified, now) {
  const t = Date.parse(`${verified}T00:00:00Z`);
  return Number.isNaN(t) ? null : Math.floor((now - t) / 86400000);
}

/**
 * Days between two batches, at most: the workflow runs on the 1st of each
 * month, and the longest month has 31 days.
 */
export const BATCH_GAP_DAYS = 31;

/**
 * Batch `k` (0 = this one) is the last that can re-read an entry before
 * its licence check turns VERIFIED_FRESH_DAYS old; undated entries are due
 * now. Negative (already late) counts as 0.
 */
function deadlineBatch(age) {
  if (age === null) return 0;
  return Math.max(0, Math.floor((VERIFIED_FRESH_DAYS - age) / BATCH_GAP_DAYS));
}

/**
 * The smallest steady batch size that re-reads every live entry before it
 * turns VERIFIED_FRESH_DAYS old: for each coming batch k, the entries whose
 * deadline is batch k or sooner, spread over the k + 1 batches left. A bulge
 * of entries read in the same week is spread over the months before it
 * expires instead of landing in one batch. The look-ahead stops where an
 * entry re-read now would itself fall due.
 */
export function batchSizeNeeded(ages) {
  const horizon = Math.floor(VERIFIED_FRESH_DAYS / BATCH_GAP_DAYS);
  const byBatch = new Array(horizon + 1).fill(0);
  for (const age of ages) {
    const k = deadlineBatch(age);
    if (k <= horizon) byBatch[k] += 1;
  }
  let need = 0;
  let cumulative = 0;
  for (let k = 0; k <= horizon; k += 1) {
    cumulative += byBatch[k];
    need = Math.max(need, Math.ceil(cumulative / (k + 1)));
  }
  return need;
}

/**
 * This month's batch, oldest first (undated first of all), sized by
 * batchSizeNeeded so no live entry passes VERIFIED_FRESH_DAYS before a batch
 * reaches it. Every entry more than `dueDays` old is in it, since it would
 * turn stale before the next one. An explicit `size` takes that many of the
 * entries more than `dueDays` old instead.
 */
export function pickBatch(entries, { now = Date.now(), dueDays = DUE_DAYS, size } = {}) {
  const live = entries
    .filter(isListed)
    .map((entry) => ({ entry, age: entry.verified ? ageDays(entry.verified, now) : null }))
    .sort((a, b) => (b.age ?? Infinity) - (a.age ?? Infinity) || a.entry.id.localeCompare(b.entry.id));
  const picked =
    size === undefined
      ? live.slice(0, batchSizeNeeded(live.map((r) => r.age)))
      : live.filter((r) => r.age === null || r.age > dueDays).slice(0, size);
  return picked.map((r) => ({ ...r.entry, age: r.age }));
}

const code = (s) => `\`${String(s).replaceAll("`", "%60")}\``;

/** The issue body: how to do one, then a checklist with what to re-read. */
export function batchIssueMarkdown({ batch, repo, date, total, dueDays = DUE_DAYS, openQuestions = [] }) {
  const lines = [
    `Monthly re-verification batch, ${date}: the ${batch.length} entries whose licence was read longest ago, out of ${total} live entries: enough that none passes ${VERIFIED_FRESH_DAYS} days before the next batch. Each one is a small, self-contained check, and a good first contribution.`,
    "",
    "**How to do one**",
    "1. Open the entry and its source page (the `url` in the frontmatter).",
    "2. Find the licence or terms page and read what it says about commercial use, attribution and redistribution.",
    "3. If it still supports the entry, update `verified` to today's date and add a dated quote under `## Evidence`, for example `- Terms page (YYYY-MM-DD): \"...\"`.",
    "4. If the terms are unclear, mixed per file, or have changed, set `status: needs-review` and note what you found under `## Notes`. If the source is gone, say so in a comment and we will deprecate it.",
    "",
    `The rule is in [CONTRIBUTING.md](${repo}/blob/main/CONTRIBUTING.md): a wrong licence claim is worse than a missing entry, so never infer a licence from the site's reputation. One PR per entry or a few at a time is fine. \`npm run validate\` checks the file; CI runs it on your PR.`,
    "",
    "**Entries** (oldest check first)",
    "",
    ...batch.map((e) => {
      const when = e.verified ? `verified ${e.verified}${e.age !== null ? ` (${e.age} days ago)` : ""}` : "no verified date";
      return `- [ ] [${code(e.id)}](${repo}/blob/main/${e.rel}): ${code(e.url)}, recorded as ${code(e.license)}, ${e.status}, ${when}`;
    }),
    "",
    // Every needs-review entry's open question, whatever its age (#211).
    ...(openQuestions.length
      ? [
          `**Open questions** (${openQuestions.length} needs-review ${openQuestions.length === 1 ? "entry" : "entries"}; settling one is also a good contribution)`,
          "",
          ...openQuestions.map((e) => `- [ ] [${code(e.id)}](${repo}/blob/main/${e.rel}): ${e.review.replace(/[\r\n]+/g, " ")}`),
          "",
        ]
      : []),
    "Opened by `.github/workflows/reverify.yml`; the next batch replaces this list if it is still open.",
    "",
  ];
  return lines.join("\n");
}

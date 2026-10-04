# Design: licence freshness

Date: 2026-09-25. Status: implemented; see the entry for it in `docs/review-ledger.md`.

## Why

Sub-project C of the site brainstorm, visible trust. The maintainer chose the one claim
a visitor most needs to believe: that the licences are current. Every entry already
records `verified`, the date someone last read its licence at the source, and each card
shows that date with an aging cue. Nothing shows the catalog as a whole.

On 2026-09-25 all 317 visible entries were checked within 90 days (76 within 30). The
oldest checks, 61 entries from 2026-07-19, reach 90 days on 2026-10-17. The signal is
honest because it will move.

## What success looks like

- A visitor on the homepage sees, in one line, how many licences were checked recently,
  how old the oldest check is, and when those numbers were computed.
- One page lists every check, oldest first, so a visitor or the maintainer can see
  what is due.
- The numbers never disagree with the cards, and never lag the calendar by more than
  about a week.

## Decisions taken

| Question | Decision |
| --- | --- |
| What the signals prove | The licences are current |
| Placement | A homepage line and a `/freshness/` page |
| Thresholds | The card buckets: fresh up to 180 days, aging 181 to 365, stale after 365 |
| Keeping ages current | Computed at build time, stamped with the build date, plus a weekly scheduled rebuild |

## The homepage line

One prerendered line directly under the hero, above Starter stacks, built from the
visible (not deprecated) entries:

> Every licence here was read at its source. Checked within 180 days: 317 of 317.
> Older than a year: 0. Oldest check: 2026-07-19 (68 days). As of 2026-09-25.
> See every check, oldest first.

- "Checked within 180 days" is the fresh bucket; "Older than a year" is the stale
  bucket. When the aging bucket (181 to 365 days) is not empty, the line adds
  "Aging (181 to 365 days): N". When an entry has no `verified` date, the line adds
  "No check date: N".
- "As of" is the build date.
- "See every check, oldest first" links to `/freshness/`.
- Buckets come from `verifiedAge` in `site/lib/shared.mjs`, the function the cards use.

## The freshness page

`/freshness/`, static HTML, complete without JavaScript:

- Title "Licence freshness", one `h1`, the same summary line as the homepage, and one
  sentence of method: the verified date is when someone last read the licence at the
  source, and each entry's page quotes it with dates.
- **Most recently checked**: entries whose `verified` date is within the 30 days before
  the build date (the 30th day included), newest first, all of them. Labelled
  "checked", not "re-verified": the catalog keeps only the latest date, so a first
  check and a recheck look the same.
- **Every check, oldest first**: a table of all visible entries with the date, the age
  in days, the bucket, the entry name linked to its page, and the licence. Ties sort by
  name. Below 640px each row stacks into a block, with no horizontal scroll.
- Canonical URL, description and social tags, the same topbar as the entry pages, and
  the existing page checks.

Links in: the homepage line; a "Licence freshness" link in the footer of the homepage,
every entry page and every stack page; `sitemap.xml`; one line near the top of
`llms.txt`.

## Build and schedule

- `site/lib/freshness.mjs`, pure functions:
  - `freshnessStats(entries, now)`: `{ total, fresh, aging, stale, unknown, oldest,
    recent }`, where `oldest` is `{ entry, days }` or null and `recent` is the entries
    checked in the last 30 days, newest first. Deprecated entries are skipped.
  - `freshnessLineHtml(stats, stamp, href)`: the summary line, linking to `href`.
  - `freshnessPageHtml({ entries, stats, site, stamp, total, hasCard, now })`: the page.
- `site/build.mjs` fills a `FRESHNESS_LINE` marker in `site/public/index.html`, writes
  `dist/freshness/index.html`, adds it to the sitemap and the page checks, and adds the
  footer link to entry and stack pages and the line to `llms.txt`.
- `.github/workflows/pages.yml` gains `schedule: - cron: "17 6 * * 1"` (Mondays 06:17
  UTC) beside the push trigger. The scheduled run is the same build; only the date
  changes.

## Testing

- `site/lib/lib.test.mjs`: buckets at 180/181 and 365/366 days; deprecated entries
  skipped; a missing `verified` counted as unknown; the oldest entry chosen, ties by
  name; the 30-day window including day 30 and excluding day 31; the summary line with
  zero and non-zero aging, stale and unknown counts; page escaping of names, one `h1`,
  canonical, and table rows oldest first.
- Build: the homepage and `/freshness/` pass the page checks.
- Browser: the homepage line links to the page; the table stacks at 375px with no
  horizontal scroll; no text below AA contrast in light and dark; the page works
  without JavaScript; zero console errors.
- Live after deploy: `/freshness/` returns 200 and `sitemap.xml` has 324 URLs.

## Risks

- **A high number read as a guarantee.** The line says what was measured (read at the
  source, on a date) and the page's method sentence says the entry page holds the
  quotes. The legend's advice to re-check older dates still applies.
- **The scheduled build fails silently.** It runs the same checks as a push; a failure
  shows in the Actions tab and the site keeps the last good build.

## Out of scope

- An Atom feed, badges, and "recently added" (which needs dates from git history).
- Changing the card buckets.

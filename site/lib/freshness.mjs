/**
 * Licence freshness: how recently each licence was read at its source.
 * Buckets come from verifiedAge, the function the homepage cards use, so the
 * summary and the cards cannot disagree. Pure: `now` is passed in.
 */
import { esc, freshnessPageUrl, sponsorButtonHtml, verifiedAge } from "./shared.mjs";

const RECENT_DAYS = 30;
const byName = (a, b) => a.entry.name.localeCompare(b.entry.name);
const dayWord = (n) => `${n} ${n === 1 ? "day" : "days"}`;

export function freshnessStats(entries, now) {
  const rows = entries
    .filter((e) => e.status !== "deprecated")
    .map((entry) => ({ entry, ...verifiedAge(entry.verified, now) }));
  const count = (bucket) => rows.filter((r) => r.bucket === bucket).length;
  const dated = rows.filter((r) => r.days !== null).sort((a, b) => b.days - a.days || byName(a, b));
  const undated = rows.filter((r) => r.days === null).sort(byName);
  const recent = dated
    .filter((r) => r.days <= RECENT_DAYS)
    .sort((a, b) => a.days - b.days || byName(a, b))
    .map((r) => ({ entry: r.entry, days: r.days }));
  return {
    total: rows.length,
    fresh: count("fresh"),
    aging: count("aging"),
    stale: count("stale"),
    unknown: count("unknown"),
    oldest: dated.length ? { entry: dated[0].entry, days: dated[0].days } : null,
    recent,
    rows: [...dated, ...undated],
  };
}

/** The one-line summary, for the homepage and the top of /freshness/. */
export function freshnessLineHtml(stats, stamp, href) {
  const parts = [
    "Every licence here was read at its source.",
    `<strong>Checked within 180 days: ${stats.fresh} of ${stats.total}.</strong>`,
  ];
  if (stats.aging) parts.push(`Aging (181 to 365 days): ${stats.aging}.`);
  parts.push(`Older than a year: ${stats.stale}.`);
  if (stats.unknown) parts.push(`No check date: ${stats.unknown}.`);
  if (stats.oldest) parts.push(`Oldest check: ${esc(stats.oldest.entry.verified)} (${dayWord(stats.oldest.days)}).`);
  parts.push(`As of ${esc(stamp)}.`);
  parts.push(`<a href="${esc(href)}">See every check, oldest first</a>.`);
  return parts.join(" ");
}

const BUCKET_WORDS = { fresh: "fresh", aging: "aging", stale: "stale", unknown: "no check date" };

function recentHtml(recent, stamp) {
  if (!recent.length) return `<p>None checked on ${esc(stamp)} or in the ${RECENT_DAYS} days before it.</p>`;
  const items = recent
    .map(
      (r) =>
        `<li><a href="../entry/${esc(r.entry.id)}/">${esc(r.entry.name)}</a> <span class="verified is-fresh">${esc(r.entry.verified)} (${dayWord(r.days)})</span></li>`
    )
    .join("\n          ");
  return `<ul class="recent-list">
          ${items}
        </ul>`;
}

function rowHtml(r) {
  const date = r.entry.verified ? esc(r.entry.verified) : "none";
  const age = r.days === null ? "" : dayWord(r.days);
  return `<tr class="fresh-row" data-id="${esc(r.entry.id)}">
            <td data-label="Checked">${date}</td>
            <td data-label="Age">${age}</td>
            <td data-label="Status"><span class="verified is-${r.bucket}">${BUCKET_WORDS[r.bucket]}</span></td>
            <td data-label="Entry"><a href="../entry/${esc(r.entry.id)}/">${esc(r.entry.name)}</a></td>
            <td data-label="Licence">${esc(r.entry.license)}</td>
          </tr>`;
}

export function freshnessPageHtml({ stats, site, stamp, total, hasCard }) {
  const url = freshnessPageUrl(site);
  const title = `Licence freshness | ${site.title}`;
  const desc = `When each licence in the catalog was last read at its source, oldest first. As of ${stamp}.`;
  const card = `${String(site.siteUrl).replace(/\/+$/, "")}/og-card.png`;
  const cardMeta = hasCard
    ? `<meta property="og:image" content="${esc(card)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${esc(card)}" />`
    : `<meta name="twitter:card" content="summary" />`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <link rel="canonical" href="${esc(url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${esc(site.title)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${esc(url)}" />
    ${cardMeta}
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(desc)}" />
    <link rel="icon" href="../favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#content">Skip to the list</a>
    <header class="topbar">
      <a class="brand" href="../">Free Game Dev Assets</a>
      <nav class="topnav" aria-label="Primary">
        <a href="../#catalog">Catalog</a>
        <a href="../#stacks">Stacks</a>
        <a href="../#starters">Starters</a>
        <a href="../#guides">Guides</a>
        <a href="${esc(site.repo)}" rel="noopener noreferrer">GitHub</a>
      </nav>
    </header>
    <main class="section entry-page freshness-page" id="content">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../#catalog">Catalog</a> <span aria-hidden="true">/</span>
        <span aria-current="page">Licence freshness</span>
      </nav>
      <h1>Licence freshness</h1>
      <p class="freshness-line">${freshnessLineHtml(stats, stamp, "#every-check")}</p>
      <div class="entry-lead"><p>An entry's verified date is when someone last read its licence at the source. Each entry's page quotes that licence with dates. Deprecated entries are not counted.</p></div>
      <section aria-labelledby="recent">
        <h2 id="recent">Most recently checked</h2>
        <p>Checked on ${esc(stamp)} or in the ${RECENT_DAYS} days before it, newest first. The catalog keeps only the latest check date, so a first check and a recheck look the same.</p>
        ${recentHtml(stats.recent, stamp)}
      </section>
      <section aria-labelledby="every-check">
        <h2 id="every-check">Every check, oldest first</h2>
        <table class="fresh-table">
          <thead>
            <tr><th scope="col">Checked</th><th scope="col">Age</th><th scope="col">Status</th><th scope="col">Entry</th><th scope="col">Licence</th></tr>
          </thead>
          <tbody>
          ${stats.rows.map(rowHtml).join("\n          ")}
          </tbody>
        </table>
      </section>
    </main>
    <footer class="footer">
      <p>Catalog metadata is CC0. Linked assets keep their own licenses: re-check the live source before shipping.</p>
      <p class="footer-sponsor">${sponsorButtonHtml()}</p>
      <p class="footer-stamp">Built ${esc(stamp)} from ${total} catalog entries.</p>
    </footer>
  </body>
</html>
`;
}

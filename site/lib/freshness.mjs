/**
 * Licence freshness: how recently each licence was read at its source.
 * Buckets come from verifiedAge, the function the homepage cards use, so the
 * summary and the cards cannot disagree. Pure: `now` is passed in.
 */
import { baseHeadHtml, esc, freshnessPageUrl, sponsorButtonHtml, verifiedAge } from "./shared.mjs";

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
  return `<strong>${stats.fresh} of ${stats.total}</strong> licences re-read in the last 180 days. <a href="${esc(href)}">Every check, oldest first</a>.`;
}

/** Days an entry counts as new on the home page. */
const NEW_DAYS = 30;

/**
 * "New this month" for the home page: the entries added in the last 30 days
 * before `stamp`, newest first, the first few named and the rest counted,
 * with a link to the whole list sorted by `added`. Empty string when none.
 */
export function newEntriesLineHtml(entries, stamp, { named = 5, sortHref = "?sort=added#catalog" } = {}) {
  const since = new Date(Date.parse(`${stamp}T00:00:00Z`) - NEW_DAYS * 86400000).toISOString().slice(0, 10);
  const fresh = entries
    .filter((e) => e.status !== "deprecated" && e.added && e.added >= since)
    .sort((a, b) => b.added.localeCompare(a.added) || a.name.localeCompare(b.name));
  if (!fresh.length) return "";
  const links = fresh.slice(0, named).map((e) => `<a href="entry/${esc(e.id)}/">${esc(e.name)}</a>`);
  const more = fresh.length - links.length;
  const tail = more > 0 ? ` and <a href="${esc(sortHref)}">${more} more</a>` : "";
  return `<strong>New in the last ${NEW_DAYS} days: ${fresh.length}.</strong> ${links.join(", ")}${tail}.`;
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
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    ${baseHeadHtml({ site, title, description: desc, url, hasCard, root: "../" })}
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
        <span class="nav-sponsor">${sponsorButtonHtml()}</span>
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
      <p>Catalog metadata is CC0. Linked assets keep their own licences. This is the catalog's reading of each licence, not legal advice: re-check the live source before shipping.</p>
      <p><a href="../data.json">data.json</a> · <a href="../catalog.csv">CSV</a> · <a href="../feed.xml">feed</a> · <a href="https://github.com/TMHSDigital/Free-Game-Dev-Assets/blob/main/docs/data.md">Use the data</a></p>
      <p class="footer-sponsor">${sponsorButtonHtml()}</p>
      <p class="footer-stamp">Built ${esc(stamp)} from ${total} catalog entries.</p>
    </footer>
  </body>
</html>
`;
}

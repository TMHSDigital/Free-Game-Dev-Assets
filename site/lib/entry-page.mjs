/** One entry's page. Pure: everything it needs is passed in. */
import {
  commercialLabel,
  entryPageUrl,
  esc,
  MAINTENANCE_NOTES,
  PERSPECTIVE_LABELS,
  STATUS_NOTES,
  verifiedAge,
} from "./shared.mjs";

export function jsonLd(entry, site) {
  const work = { "@type": "CreativeWork", name: entry.name, url: entry.url };
  if (entry.summary) work.description = entry.summary;
  if (entry.publisher) work.publisher = { "@type": "Organization", name: entry.publisher };
  if (entry.license_spdx) work.license = `https://spdx.org/licenses/${entry.license_spdx}.html`;
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${entry.name} (${entry.license})`,
    url: entryPageUrl(site, entry.id),
    isPartOf: { "@type": "WebSite", name: site.title, url: site.siteUrl },
    mainEntity: work,
  };
  if (entry.summary) page.description = entry.summary;
  if (entry.verified) page.dateModified = entry.verified;
  return page;
}

/** JSON for a <script> element: `<` escaped so no string can close the tag. */
export function scriptJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function credit(entry) {
  if (entry.attribution_required === true && entry.attribution_string) {
    return {
      value: "Required",
      block: `<div class="attribution">
          <p class="attribution-label">Credit line</p>
          <p class="attribution-string" id="attribution-string">${esc(entry.attribution_string)}</p>
          <button type="button" class="btn-ghost" id="copy-attribution" data-copy="${esc(entry.attribution_string)}" hidden>Copy credit line</button>
          <span class="copy-status" id="copy-status" role="status" aria-live="polite"></span>
        </div>`,
    };
  }
  if (entry.attribution_required === true) {
    return {
      value: "Required",
      block: `<p class="attribution-note">Attribution is required and no canned credit line is recorded. Read the Notes for what the source asks for.</p>`,
    };
  }
  if (entry.attribution_required === false) return { value: "Not required", block: "" };
  return { value: "Unclear: read the Notes", block: "" };
}

export function entryPageHtml({ entry, leadHtml, restHtml, deprecatedReasonHtml, prev, next, site, categoryLabel, stamp, total, hasCard, now, stacks = [] }) {
  const repo = site.repo;
  const url = entryPageUrl(site, entry.id);
  const title = `${entry.name} (${entry.license}) | ${site.title}`;
  const desc = entry.summary || site.tagline;
  const age = verifiedAge(entry.verified, now);
  const ageText = age.days === null ? "verified date unknown" : `${entry.verified} (${age.days}d ago)`;
  const c = credit(entry);
  const licence =
    entry.license_spdx && entry.license_spdx !== entry.license ? `${entry.license} (${entry.license_spdx})` : entry.license;
  const rows = [
    ["Licence", esc(licence)],
    ["Commercial use", esc(commercialLabel(entry.commercial))],
    ["Credit", esc(c.value)],
    ["Status", `${esc(entry.status)}: ${esc(STATUS_NOTES[entry.status] || "")}`],
    ["Verified", `<span class="verified is-${age.bucket}">${esc(ageText)}</span>`],
    entry.maintenance ? ["Maintenance", `${esc(entry.maintenance)}: ${esc(MAINTENANCE_NOTES[entry.maintenance] || "")}`] : null,
    entry.publisher ? ["Publisher", esc(entry.publisher)] : null,
    ["Formats", esc((entry.formats || []).join(", ") || "none listed")],
    entry.camera_perspective
      ? ["Perspective", esc(PERSPECTIVE_LABELS[entry.camera_perspective] || entry.camera_perspective)]
      : null,
    entry.grid_dimensions ? ["Grid", esc(entry.grid_dimensions)] : null,
  ]
    .filter(Boolean)
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join("\n          ");
  const deprecated = entry.status === "deprecated";
  const banner = deprecated
    ? `<p class="deprecated-banner" role="note"><strong>Deprecated.</strong> ${deprecatedReasonHtml || "This entry is kept for history only."}</p>`
    : "";
  const issue = `${repo}/issues/new?template=correction.yml&title=${encodeURIComponent(`[correction] ${entry.id}`)}&entry=${encodeURIComponent(entry.id)}`;
  const card = `${String(site.siteUrl).replace(/\/+$/, "")}/og-card.png`;
  const cardMeta = hasCard
    ? `<meta property="og:image" content="${esc(card)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${esc(card)}" />`
    : `<meta name="twitter:card" content="summary" />`;
  const pager =
    prev || next
      ? `<nav class="page-pager" aria-label="More in ${esc(categoryLabel)}">
        ${prev ? `<a class="btn-ghost" href="../${esc(prev.id)}/" rel="prev"><span aria-hidden="true">&larr;</span> ${esc(prev.name)}</a>` : "<span></span>"}
        ${next ? `<a class="btn-ghost" href="../${esc(next.id)}/" rel="next">${esc(next.name)} <span aria-hidden="true">&rarr;</span></a>` : "<span></span>"}
      </nav>`
      : "";
  const usedIn = stacks.length
    ? `<p class="used-in">Used in: ${stacks.map((s) => `<a href="../../stack/${esc(s.id)}/">${esc(s.title)}</a>`).join(", ")}</p>`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <link rel="canonical" href="${esc(url)}" />
    ${deprecated ? '<meta name="robots" content="noindex" />' : ""}
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${esc(site.title)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${esc(url)}" />
    ${cardMeta}
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(desc)}" />
    <link rel="icon" href="../../favicon.svg" type="image/svg+xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Public+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../styles.css" />
    <script type="application/ld+json">${scriptJson(jsonLd(entry, site))}</script>
  </head>
  <body>
    <a class="skip-link" href="#content">Skip to entry</a>
    <header class="topbar">
      <a class="brand" href="../../">Free Game Dev Assets</a>
      <nav class="topnav" aria-label="Primary">
        <a href="../../#catalog">Catalog</a>
        <a href="../../#stacks">Stacks</a>
        <a href="../../#starters">Starters</a>
        <a href="../../#guides">Guides</a>
        <a href="${esc(repo)}" rel="noopener noreferrer">GitHub</a>
      </nav>
    </header>
    <main class="section entry-page" id="content">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../../#catalog" data-back-to-results>Catalog</a> <span aria-hidden="true">/</span>
        <a href="../../?cat=${encodeURIComponent(entry.category)}#catalog">${esc(categoryLabel)}</a> <span aria-hidden="true">/</span>
        <span aria-current="page">${esc(entry.name)}</span>
      </nav>
      ${banner}
      <h1>${esc(entry.name)}</h1>
      <div class="entry-lead">${leadHtml}</div>
      <section class="facts-panel" aria-labelledby="facts-title">
        <h2 id="facts-title">At a glance</h2>
        <dl class="facts">
          ${rows}
        </dl>
        ${c.block}
      </section>
      <p class="page-actions">
        <a class="btn" href="${esc(entry.url)}" rel="noopener noreferrer">Go to source</a>
        <a class="btn-ghost" href="${esc(`${repo}/blob/main/${entry.path}`)}" rel="noopener noreferrer">View the file on GitHub</a>
        <a class="btn-ghost" href="${esc(issue)}" rel="noopener noreferrer">Report a problem with this entry</a>
        <button type="button" class="btn-ghost shortlist-toggle" data-shortlist="${esc(entry.id)}" aria-pressed="false" hidden>Add to shortlist</button>
      </p>
      ${usedIn}
      <div class="entry-content">${restHtml}</div>
      ${pager}
    </main>
    <footer class="footer">
      <p>Catalog metadata is CC0. Linked assets keep their own licenses: re-check the live source before shipping.</p>
      <p><a href="../../freshness/">Licence freshness</a></p>
      <p class="footer-stamp">Built ${esc(stamp)} from ${total} catalog entries.</p>
    </footer>
    <script src="../../entry.js" defer></script>
    <script type="module" src="../../shortlist.js"></script>
  </body>
</html>
`;
}

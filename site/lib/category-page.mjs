/** One category's page: every entry in it, both views, no JavaScript needed to see everything. Pure. */
import { groupedEntriesHtml } from "./cards.mjs";
import { baseHeadHtml, clipText, esc, PREVIEW_CREDIT_LINE, SEO_DESCRIPTION_MAX, SEO_TITLE_MAX, sponsorButtonHtml } from "./shared.mjs";

export function categoryPageUrl(site, cat) {
  return `${String(site.siteUrl).replace(/\/+$/, "")}/category/${cat}/`;
}

export function categoryPageHtml({ cat, meta, entries, site, stamp, total, hasCard, now }) {
  const label = meta.label || cat;
  const blurb = meta.blurb || "";
  const url = categoryPageUrl(site, cat);
  const title = `${label} assets | ${site.title}`;
  const n = entries.length;
  const sources = `${n} ${n === 1 ? "source" : "sources"}`;
  const description = clipText(`${sources} of free ${label} assets: ${blurb}. Every licence read at the source.`, SEO_DESCRIPTION_MAX);
  const repo = site.repo;
  // The category is the h1, so its group heading is an h2 and the card titles h3.
  const grid = groupedEntriesHtml(entries, { [cat]: meta }, { root: "../../", repo, now, limit: false, headingLevel: 2, titleLevel: 3 });
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(clipText(title, SEO_TITLE_MAX))}</title>
    <meta name="description" content="${esc(description)}" />
    ${baseHeadHtml({ site, title, description, url, hasCard, root: "../../" })}
  </head>
  <body>
    <a class="skip-link" href="#entry-grid">Skip to the list</a>
    <header class="topbar">
      <a class="brand" href="../../">Free Game Dev Assets</a>
      <nav class="topnav" aria-label="Primary">
        <a href="../../#catalog">Catalog</a>
        <a href="../../#stacks">Stacks</a>
        <a href="../../#starters">Starters</a>
        <a href="../../#guides">Guides</a>
        <a href="${esc(repo)}" rel="noopener noreferrer">GitHub</a>
        <span class="nav-sponsor">${sponsorButtonHtml()}</span>
      </nav>
    </header>
    <main class="section category-page" id="content">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../../#catalog">Catalog</a> <span aria-hidden="true">/</span>
        <span aria-current="page">${esc(label)}</span>
      </nav>
      <h1>${esc(label)}</h1>
      <p class="section-blurb">${esc(sources)} · ${esc(blurb)}</p>
      <p class="category-search"><a href="../../?cat=${encodeURIComponent(cat)}#catalog">Search and filter on the catalog page</a></p>
      <div class="entry-list" id="entry-grid">
${grid}
      </div>
    </main>
    <footer class="footer">
      <p>Catalog metadata is CC0. Linked assets keep their own licences. This is the catalog's reading of each licence, not legal advice: re-check the live source before shipping.</p>
      <p class="footer-credit">${PREVIEW_CREDIT_LINE}</p>
      <p><a href="../../freshness/">Licence freshness</a></p>
      <p class="footer-sponsor">${sponsorButtonHtml()}</p>
      <p class="footer-stamp">Built ${esc(stamp)} from ${total} catalog entries.</p>
    </footer>
    <script type="module" src="../../category.js"></script>
    <script type="module" src="../../shortlist.js"></script>
  </body>
</html>
`;
}

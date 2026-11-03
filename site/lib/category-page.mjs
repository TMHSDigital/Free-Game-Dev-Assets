/** One category's page: every entry in it, both views, no JavaScript needed to see everything. Pure. */
import { groupedEntriesHtml } from "./cards.mjs";
import { baseHeadHtml, breadcrumbLd, clipText, entryPageUrl, esc, SEO_DESCRIPTION_MAX, SEO_TITLE_MAX, PAGE_MODULES, siteHeaderHtml, siteFooterHtml } from "./shared.mjs";
import { scriptJson } from "./entry-page.mjs";

export function categoryPageUrl(site, cat) {
  return `${String(site.siteUrl).replace(/\/+$/, "")}/category/${cat}/`;
}

/** schema.org CollectionPage for a category, its entries as an ItemList. */
export function categoryJsonLd({ cat, label, description, entries, site }) {
  const url = categoryPageUrl(site, cat);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${label} assets`,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: site.title, url: site.siteUrl },
    breadcrumb: breadcrumbLd([
      { name: site.title, url: site.siteUrl },
      { name: label, url },
    ]),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: entries.length,
      itemListElement: entries.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.name, url: entryPageUrl(site, e.id) })),
    },
  };
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
    ${baseHeadHtml({ site, title, description, url, hasCard, root: "../../", modules: PAGE_MODULES.category })}
    <link rel="alternate" type="application/atom+xml" title="${esc(`${site.title}: new sources in ${label}`)}" href="${esc(`${url}feed.xml`)}" />
    <script type="application/ld+json">${scriptJson(categoryJsonLd({ cat, label, description, entries, site }))}</script>
  </head>
  <body>
    <a class="skip-link" href="#entry-grid">Skip to the list</a>
    ${siteHeaderHtml({ root: "../../", repo: repo })}
    <main class="section category-page" id="content">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../../#catalog">Catalog</a> <span aria-hidden="true">/</span>
        <span aria-current="page">${esc(label)}</span>
      </nav>
      <h1>${esc(label)}</h1>
      <p class="section-blurb">${esc(sources)} · ${esc(blurb)}</p>
      <p class="category-search"><a href="../../?cat=${encodeURIComponent(cat)}#catalog">Search and filter on the catalog page</a> · <a href="feed.xml">Feed of new ${esc(label)} sources</a></p>
      <div class="entry-list" id="entry-grid">
${grid}
      </div>
    </main>
    ${siteFooterHtml({ root: "../../", stamp, total })}
    <script type="module" src="../../category.js"></script>
    <script type="module" src="../../shortlist.js"></script>
  </body>
</html>
`;
}

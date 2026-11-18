/**
 * "Free alternatives to ..." pages (#189): one per common search, defined in
 * site/alternatives.json, listing the active catalog entries that answer it
 * with their recorded licence verdicts. Pure.
 */
import { groupedEntriesHtml } from "./cards.mjs";
import { baseHeadHtml, breadcrumbLd, clipText, entryPageUrl, esc, SEO_DESCRIPTION_MAX, SEO_TITLE_MAX, PAGE_MODULES, siteHeaderHtml, siteFooterHtml } from "./shared.mjs";
import { scriptJson } from "./entry-page.mjs";

/** Fewer matches than this and the page is not worth a search result; the build fails. */
export const MIN_ALTERNATIVES = 3;

export function alternativesPageUrl(site, slug) {
  return `${String(site.siteUrl).replace(/\/+$/, "")}/alternatives/${slug}/`;
}

/**
 * The active entries a page lists: any id in `ids`, or an entry in one of
 * `categories` carrying one of `tags` or `subcategories`, less `exclude`.
 * Only `active` entries: a page meant for search traffic shows settled
 * licences only.
 */
export function alternativesFor(def, entries) {
  const ids = new Set(def.ids || []);
  const exclude = new Set(def.exclude || []);
  const cats = new Set(def.categories || []);
  const tags = new Set(def.tags || []);
  const subs = new Set(def.subcategories || []);
  return entries.filter(
    (e) =>
      e.status === "active" &&
      !exclude.has(e.id) &&
      (ids.has(e.id) || (cats.has(e.category) && ((e.tags || []).some((t) => tags.has(t)) || (e.subcategories || []).some((s) => subs.has(s)))))
  );
}

/** Problems with alternatives.json against the catalog: unknown ids or categories, duplicate slugs, too few matches. */
export function checkAlternatives(defs, entries, categories) {
  const errors = [];
  const known = new Set(entries.map((e) => e.id));
  const slugs = new Set();
  for (const def of defs) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(def.slug))) errors.push(`alternatives.json: slug "${def.slug}" must be lower-case kebab-case`);
    if (slugs.has(def.slug)) errors.push(`alternatives.json: duplicate slug "${def.slug}"`);
    slugs.add(def.slug);
    if (!def.title || !def.context) errors.push(`alternatives.json: "${def.slug}" needs a title and a context sentence`);
    for (const id of [...(def.ids || []), ...(def.exclude || [])]) if (!known.has(id)) errors.push(`alternatives.json: "${def.slug}" names unknown entry "${id}"`);
    for (const c of def.categories || []) if (!(c in categories)) errors.push(`alternatives.json: "${def.slug}" names unknown category "${c}"`);
    const n = alternativesFor(def, entries).length;
    if (n < MIN_ALTERNATIVES) errors.push(`alternatives.json: "${def.slug}" matches ${n} active entries; it needs at least ${MIN_ALTERNATIVES}`);
  }
  return errors;
}

/** The alternatives pages that list entries of a category, for that category page's links. */
export function alternativesForCategory(defs, entries, cat) {
  return defs.filter((def) => alternativesFor(def, entries).some((e) => e.category === cat));
}

/** schema.org CollectionPage, the entries as an ItemList, like a category page. */
export function alternativesJsonLd({ def, description, entries, site }) {
  const url = alternativesPageUrl(site, def.slug);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: def.title,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: site.title, url: site.siteUrl },
    breadcrumb: breadcrumbLd([
      { name: site.title, url: site.siteUrl },
      { name: def.title, url },
    ]),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: entries.length,
      itemListElement: entries.map((e, i) => ({ "@type": "ListItem", position: i + 1, name: e.name, url: entryPageUrl(site, e.id) })),
    },
  };
}

export function alternativesPageHtml({ def, entries, categories, site, stamp, total, hasCard, now }) {
  const url = alternativesPageUrl(site, def.slug);
  const n = entries.length;
  const sources = `${n} free ${n === 1 ? "source" : "sources"}`;
  const description = clipText(`${def.title}: ${sources} for games, each licence read at the source and dated.`, SEO_DESCRIPTION_MAX);
  const title = `${def.title} | ${site.title}`;
  const repo = site.repo;
  // Grouped by category in the catalog's order, as on the home page.
  const used = Object.fromEntries(Object.entries(categories).filter(([cat]) => entries.some((e) => e.category === cat)));
  const grid = groupedEntriesHtml(entries, used, { root: "../../", repo, now, limit: false, headingLevel: 2, titleLevel: 3 });
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(clipText(title, SEO_TITLE_MAX))}</title>
    <meta name="description" content="${esc(description)}" />
    ${baseHeadHtml({ site, title, description, url, hasCard, root: "../../", modules: PAGE_MODULES.category })}
    <script type="application/ld+json">${scriptJson(alternativesJsonLd({ def, description, entries, site }))}</script>
  </head>
  <body>
    <a class="skip-link" href="#entry-grid">Skip to the list</a>
    ${siteHeaderHtml({ root: "../../", repo })}
    <main class="section category-page" id="content">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../../#catalog">Catalog</a> <span aria-hidden="true">/</span>
        <span aria-current="page">${esc(def.title)}</span>
      </nav>
      <h1>${esc(def.title)}</h1>
      <p class="section-blurb">${esc(def.context)}</p>
      <p class="section-blurb">${esc(sources)}, active entries only. Licences are as the catalog read them at the source on each entry's verified date; re-check the live source before shipping.</p>
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

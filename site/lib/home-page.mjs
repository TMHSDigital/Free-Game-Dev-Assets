/**
 * The homepage pieces and small site files the build writes (#85): pure
 * functions moved out of build.mjs so they are unit-tested, with build.mjs
 * left to orchestrate.
 */
import { baseHeadHtml, commercialLabel, esc, headAssetsHtml, opensearchLinkHtml, PAGE_MODULES } from "./shared.mjs";
import { scriptJson } from "./entry-page.mjs";
import { homeJsonLd } from "./exports.mjs";

/** Sort rank for "license permissiveness": least owed first. */
export const ATTRIBUTION_RANK = { none: 0, notice: 1, required: 2, any: 3 };

/** The Licence-filter family a license value belongs to (license-vocabulary.json `families`). */
export function licenseFamily(vocab, license) {
  for (const [key, fam] of Object.entries(vocab.families || {})) {
    if (Array.isArray(fam.licenses) && fam.licenses.includes(license)) return key;
  }
  return "mixed";
}

/**
 * Without JavaScript the chips cannot filter, so the prerender emits them as
 * jump links to the group headings instead. app.js replaces them with real
 * filter buttons on hydrate.
 */
export function categoryChipsHtml(entries, categories) {
  const counts = new Map();
  for (const e of entries) counts.set(e.category, (counts.get(e.category) || 0) + 1);
  const chips = [
    `<a class="chip" href="#catalog">All <span class="chip-count">${entries.length}</span></a>`,
  ];
  for (const [cat, meta] of Object.entries(categories)) {
    const n = counts.get(cat) || 0;
    if (!n) continue;
    chips.push(
      `<a class="chip" href="#group-${esc(cat)}">${esc(meta.label || cat)} <span class="chip-count">${n}</span></a>`
    );
  }
  return chips.join("");
}

export function starterRowsHtml(featured) {
  return featured
    .map(
      (e) => `<tr>
  <td class="need">${esc(e.need || "")}</td>
  <td><a href="entry/${esc(e.id)}/">${esc(e.name)}</a></td>
  <td class="license">${esc(e.license)} &middot; ${esc(commercialLabel(e.commercial))}</td>
</tr>`
    )
    .join("\n");
}

export function guideRowsHtml(guides) {
  return (guides || [])
    .map(
      (g) =>
        `<li><a href="guide/${esc(g.id)}/">${esc(g.title)}<span>${esc(g.path)}</span></a></li>`
    )
    .join("\n");
}

export function headMetaHtml(site, stats, generatedAt, hasCard) {
  return [
    baseHeadHtml({ site, title: site.title, description: site.tagline, url: site.siteUrl, hasCard, root: "./", modules: PAGE_MODULES.home }),
    opensearchLinkHtml(site),
    `<meta name="generator" content="site/build.mjs ${esc(generatedAt)}" />`,
    `<meta name="catalog:entries" content="${stats.total}" />`,
    `<script type="application/ld+json">${scriptJson(homeJsonLd({ site, generatedAt, total: stats.listed }))}</script>`,
  ].join("\n    ");
}

export function robotsTxt(site) {
  const base = site.siteUrl.replace(/\/+$/, "");
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

export function notFoundHtml(site) {
  const base = site.siteUrl.replace(/\/+$/, "");
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Not found - ${esc(site.title)}</title>
    <meta name="robots" content="noindex" />
    ${headAssetsHtml(`${base}/`).join("\n    ")}
  </head>
  <body>
    <main class="section">
      <h1>Not found</h1>
      <p>That page is not part of this catalog.</p>
      <p>Looking for an entry? <a href="${esc(base)}/#catalog">Search the catalog</a>.</p>
      <div id="suggestions"></div>
      <p class="hero-actions">
        <a class="btn" href="${esc(base)}/">Back to the catalog</a>
      </p>
    </main>
    <script src="${esc(base)}/data.js" defer></script>
    ${PAGE_MODULES.notFound.filter((m) => m !== "not-found.js").map((m) => `<link rel="modulepreload" href="${esc(base)}/${m}" />`).join("\n    ")}
    <script type="module" src="${esc(base)}/not-found.js"></script>
  </body>
</html>
`;
}

export function stackRowsHtml(stacks) {
  return stacks
    .map((s) => `<li><a href="stack/${esc(s.meta.id)}/">${esc(s.meta.title)}<span>${esc(s.meta.task)}</span></a></li>`)
    .join("\n");
}

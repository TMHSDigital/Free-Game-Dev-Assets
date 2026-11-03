/** A guide from docs/ as a site page: the site's head, nav, breadcrumb and footer around the rendered guide. Pure. */
import { baseHeadHtml, breadcrumbLd, clipText, esc, SEO_DESCRIPTION_MAX, SEO_TITLE_MAX, siteHeaderHtml, siteFooterHtml } from "./shared.mjs";
import { scriptJson } from "./entry-page.mjs";
import { plainText } from "./guide-render.mjs";

export function guidePageUrl(site, id) {
  return `${String(site.siteUrl).replace(/\/+$/, "")}/guide/${id}/`;
}

export function guidePageHtml({ guide, rendered, site, stamp, total, hasCard }) {
  const url = guidePageUrl(site, guide.id);
  const title = `${guide.title} | ${site.title}`;
  const description = clipText(plainText(rendered.firstParagraph) || guide.title, SEO_DESCRIPTION_MAX);
  const edit = `${site.repo}/blob/main/${guide.path}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: plainText(rendered.title),
    url,
    isPartOf: { "@type": "WebSite", name: site.title, url: site.siteUrl },
    breadcrumb: breadcrumbLd([
      { name: site.title, url: site.siteUrl },
      { name: "Guides", url: `${String(site.siteUrl).replace(/\/+$/, "")}/#guides` },
      { name: guide.title, url },
    ]),
  };
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(clipText(title, SEO_TITLE_MAX))}</title>
    <meta name="description" content="${esc(description)}" />
    ${baseHeadHtml({ site, title, description, url, type: "article", hasCard, root: "../../" })}
    <script type="application/ld+json">${scriptJson(ld)}</script>
  </head>
  <body>
    <a class="skip-link" href="#content">Skip to the guide</a>
    ${siteHeaderHtml({ root: "../../", repo: site.repo })}
    <main class="section entry-page guide-page" id="content">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../../#catalog">Catalog</a> <span aria-hidden="true">/</span>
        <a href="../../#guides">Guides</a> <span aria-hidden="true">/</span>
        <span aria-current="page">${esc(guide.title)}</span>
      </nav>
      <h1${rendered.titleId ? ` id="${esc(rendered.titleId)}"` : ""}>${esc(plainText(rendered.title))}</h1>
      <div class="entry-body guide-body">
${rendered.html}
      </div>
      <p class="page-actions"><a class="btn-ghost" href="${esc(edit)}" rel="noopener noreferrer">Edit this guide on GitHub</a></p>
    </main>
    ${siteFooterHtml({ root: "../../", stamp, total, credit: false })}
  </body>
</html>
`;
}

/** The credits audit page, audit/ (#187). The work happens in the browser (audit.js). Pure. */
import { baseHeadHtml, esc, PAGE_MODULES, siteFooterHtml, siteHeaderHtml } from "./shared.mjs";

export function auditPageUrl(site) {
  return `${String(site.siteUrl).replace(/\/+$/, "")}/audit/`;
}

export function auditPageHtml({ site, stamp, total, hasCard }) {
  const title = `Credits audit | ${site.title}`;
  const desc = "Paste your credits file or the URLs your game's assets came from, and see what each one owes, in your browser.";
  const repo = String(site.repo);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    ${baseHeadHtml({ site, title, description: desc, url: auditPageUrl(site), hasCard, root: "../", modules: PAGE_MODULES.audit })}
  </head>
  <body>
    <a class="skip-link" href="#content">Skip to the audit</a>
    ${siteHeaderHtml({ root: "../", repo })}
    <main class="section entry-page audit-page" id="content">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../#catalog">Catalog</a> <span aria-hidden="true">/</span>
        <span aria-current="page">Credits audit</span>
      </nav>
      <h1>Credits audit</h1>
      <div class="entry-lead"><p>Paste a credits file, or one asset URL per line. Each line is matched to the catalog: by the source's URL, by the site it came from, or by the source's name. Nothing leaves your browser.</p></div>
      <noscript><p>The audit runs in your browser and needs JavaScript. Without it, search the <a href="../#catalog">catalog</a> for each source.</p></noscript>
      <form class="audit-form" id="audit-form">
        <label for="audit-input">Credits file or URLs</label>
        <textarea id="audit-input" rows="12" spellcheck="false" placeholder="https://kenney.nl/assets/ui-pack&#10;Music: Kevin MacLeod (incompetech.com)"></textarea>
        <p><button type="submit" class="btn">Check what these owe</button></p>
      </form>
      <section id="audit-results" aria-live="polite" hidden>
        <h2>Line by line</h2>
        <ul class="audit-lines" id="audit-lines"></ul>
        <h2>What the matched sources owe</h2>
        <div class="shortlist-owes" id="audit-owes"></div>
        <p class="shortlist-actions"><button type="button" class="btn-ghost" id="audit-download">Download CREDITS.md</button></p>
        <p class="filter-note">A line the catalog does not know is not a verdict on it: read its licence yourself, or <a href="${esc(repo)}/issues/new?template=new-source.yml" rel="noopener noreferrer">suggest the source</a>.</p>
      </section>
    </main>
    ${siteFooterHtml({ root: "../", stamp, total, current: "audit" })}
    <script src="../data.js" defer></script>
    <script type="module" src="../audit.js"></script>
  </body>
</html>
`;
}

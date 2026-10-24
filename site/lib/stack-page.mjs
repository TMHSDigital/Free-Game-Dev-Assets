/** A starter stack's page. Pure: everything it needs is passed in. */
import { scriptJson } from "./entry-page.mjs";
import {
  baseHeadHtml,
  clipText,
  commercialLabel,
  entryPageUrl,
  esc,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  STATUS_NOTES,
  stackPageUrl,
  verifiedAge,
  sponsorButtonHtml,
  PREVIEW_CREDIT_LINE, breadcrumbLd } from "./shared.mjs";
import { copyAllText } from "./stacks.mjs";
import { entryCardHtml } from "./cards.mjs";

export function stackJsonLd(meta, sections, site) {
  const rows = sections.flatMap((s) => s.rows);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: meta.title,
    description: meta.task,
    url: stackPageUrl(site, meta.id),
    numberOfItems: rows.length,
    itemListElement: rows.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${r.need}: ${r.entry.name}`,
      url: entryPageUrl(site, r.entry.id),
    })),
  };
}

const entryLink = (entry) => `<a href="../../entry/${esc(entry.id)}/">${esc(entry.name)}</a>`;
const names = (items) => items.map((i) => entryLink(i.entry)).join(", ");

function owesHtml(owed) {
  const groups = [];
  if (owed.credits.length) {
    const items = owed.credits
      .map((c, n) => {
        const label = `<p class="attribution-label">${esc(c.needs.join(", "))}: ${entryLink(c.entry)}</p>`;
        if (!c.line) {
          return `<li class="credit-item">${label}<p class="attribution-note">No canned credit line: see the entry.</p></li>`;
        }
        return `<li class="credit-item">${label}
            <p class="attribution-string" id="credit-${n}">${esc(c.line)}</p>
            <button type="button" class="btn-ghost" data-copy="${esc(c.line)}" data-target="credit-${n}" hidden>Copy credit line</button>
            <span class="copy-status" role="status" aria-live="polite"></span></li>`;
      })
      .join("\n");
    const all = copyAllText(owed);
    const allButton = all
      ? `<p class="copy-all"><button type="button" class="btn-ghost" data-copy="${esc(all)}" data-target="credits-all" hidden>Copy all credits</button>
          <span class="copy-status" role="status" aria-live="polite"></span></p>
          <pre class="attribution-string copy-all-text" id="credits-all" hidden>${esc(all)}</pre>`
      : "";
    groups.push(`<div class="owes-group"><h3>Credits to ship</h3><ul class="credit-list" id="credits-list">${items}</ul>${allButton}</div>`);
  }
  if (owed.noCredit.length) {
    const n = owed.noCredit.length;
    groups.push(`<div class="owes-group"><h3>No credit needed</h3><p>${n} ${n === 1 ? "pick" : "picks"}: ${names(owed.noCredit)}.</p></div>`);
  }
  if (owed.perFile.length) {
    groups.push(`<div class="owes-group"><h3>Check each file</h3><p>Some files qualify, some do not. Check each file you take from ${names(owed.perFile)}.</p></div>`);
  }
  if (owed.openQuestions.length) {
    const items = owed.openQuestions.map((i) => `<li>${entryLink(i.entry)}: ${esc(STATUS_NOTES["needs-review"])}</li>`).join("");
    groups.push(`<div class="owes-group"><h3>Open questions</h3><ul>${items}</ul></div>`);
  }
  if (owed.unclear.length) {
    groups.push(`<div class="owes-group"><h3>Unclear credit</h3><p>Read the Notes on ${names(owed.unclear)}.</p></div>`);
  }
  return groups.join("\n        ");
}

/** One pick: the entry's card with the need above its title and the reason below its meta line. */
function rowHtml(r, now, repo) {
  const flag = r.entry.status === "needs-review" ? ' <span class="pick-flag">needs review</span>' : "";
  const lead = `<p class="pick-need">${esc(r.need)}${flag}</p>`;
  const trail = `<p class="pick-why">${r.whyHtml}</p>`;
  // Picks sit under a section h2, so the card titles are h3.
  return `<li class="pick">${entryCardHtml(r.entry, { root: "../../", repo, now, view: "cards", lead, trail, titleLevel: 3 })}</li>`;
}

export function stackPageHtml({ stack, sections, gapsHtml, leadHtml, owed, site, stamp, total, hasCard, now }) {
  const { meta } = stack;
  const repo = site.repo;
  const url = stackPageUrl(site, meta.id);
  const title = `${meta.title} | ${site.title}`;
  const sectionHtml = sections
    .map(
      (s) => `<section class="stack-section" aria-labelledby="sec-${esc(s.name.toLowerCase())}">
        <h2 id="sec-${esc(s.name.toLowerCase())}">${esc(s.name)}</h2>
        <ul class="pick-list entry-list">
          ${s.rows.map((r) => rowHtml(r, now, repo)).join("\n          ")}
        </ul>
      </section>`
    )
    .join("\n      ");
  const gaps = gapsHtml.length
    ? `<section class="stack-section" aria-labelledby="sec-gaps">
        <h2 id="sec-gaps">Gaps</h2>
        <ul class="gap-list">${gapsHtml.map((g) => `<li>${g}</li>`).join("")}</ul>
      </section>`
    : "";
  const script = copyAllText(owed) ? '<script src="../../stack.js" defer></script>' : "";
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(clipText(meta.title, SEO_TITLE_MAX))}</title>
    <meta name="description" content="${esc(clipText(meta.task, SEO_DESCRIPTION_MAX))}" />
    ${baseHeadHtml({ site, title, description: meta.task, url, type: "article", hasCard, root: "../../" })}
    <script type="application/ld+json">${scriptJson(stackJsonLd(meta, sections, site))}</script>
    <script type="application/ld+json">${scriptJson({ "@context": "https://schema.org", ...breadcrumbLd([{ name: site.title, url: site.siteUrl }, { name: "Starter stacks", url: `${String(site.siteUrl).replace(/\/+$/, "")}/#stacks` }, { name: meta.title, url: stackPageUrl(site, meta.id) }]) })}</script>
  </head>
  <body>
    <a class="skip-link" href="#content">Skip to stack</a>
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
    <main class="section entry-page stack-page" id="content">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../../#catalog">Catalog</a> <span aria-hidden="true">/</span>
        <a href="../../#stacks">Stacks</a> <span aria-hidden="true">/</span>
        <span aria-current="page">${esc(meta.title)}</span>
      </nav>
      <h1>${esc(meta.title)}</h1>
      <div class="entry-lead"><p>${esc(meta.task)}</p>${leadHtml}</div>
      <section class="owes" aria-labelledby="owes-title">
        <h2 id="owes-title">What this stack owes</h2>
        ${owesHtml(owed)}
      </section>
      ${sectionHtml}
      ${gaps}
      <p class="stack-note">Stack walked ${esc(meta.walked)}. Each licence is only as current as its entry's verified date.</p>
    </main>
    <footer class="footer">
      <p>Catalog metadata is CC0. Linked assets keep their own licences. This is the catalog's reading of each licence, not legal advice: re-check the live source before shipping.</p>
      <p class="footer-credit">${PREVIEW_CREDIT_LINE}</p>
      <p><a href="../../freshness/">Licence freshness</a> · <a href="../../data.json">data.json</a> · <a href="../../catalog.csv">CSV</a> · <a href="../../feed.xml">feed</a> · <a href="https://github.com/TMHSDigital/Free-Game-Dev-Assets/blob/main/docs/data.md">Use the data</a></p>
      <p class="footer-sponsor">${sponsorButtonHtml()}</p>
      <p class="footer-stamp">Built ${esc(stamp)} from ${total} catalog entries.</p>
    </footer>
    ${script}
  </body>
</html>
`;
}

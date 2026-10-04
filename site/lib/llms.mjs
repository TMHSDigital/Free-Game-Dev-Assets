/** Plain-text indexes of the catalog for AI assistants (llmstxt.org format). */
import { LINK_RE, sectionMarkdown, splitEntryBody } from "./markdown.mjs";
import { commercialLabel, entryPageUrl, freshnessPageUrl, stackPageUrl } from "./shared.mjs";
import { owes } from "./stacks.mjs";

/** The first paragraph of the body before its first `##`, lines joined. */
function leadParagraph(body) {
  const first = splitEntryBody(body)
    .lead.split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !p.startsWith("#"));
  return first ? first.split("\n").map((l) => l.trim()).join(" ") : "";
}

/** Markdown links made absolute: this file is read on its own, far from the repo. */
function absoluteLinks(md, resolveLink, pageUrl) {
  if (!resolveLink) return md;
  // Code spans are literal: set them aside so a link-shaped span is left
  // alone, while a link whose label is code is still rewritten.
  const spans = [];
  const out = md
    .replaceAll("\u0000", "")
    .replace(/`[^`]*`/g, (span) => `\u0000${spans.push(span) - 1}\u0000`)
    .replace(LINK_RE, (_, label, href) => {
      const r = resolveLink(href);
      return `[${label}](${r.external ? r.href : new URL(r.href, pageUrl).href})`;
    });
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => spans[Number(i)]);
}

const creditWord = (e) =>
  e.attribution_required === true ? "credit required" : e.attribution_required === false ? "no credit required" : "credit unclear";

const facts = (e) => `${e.license}; ${commercialLabel(e.commercial)}; ${creditWord(e)}; ${e.status}`;

function header(site) {
  return `# ${site.title}

> ${site.tagline}

A curated catalog of free game assets, libraries and tools. It holds links and licence metadata only; nothing is rehosted. Each licence was read at its source on the entry's verified date, and the entry page quotes it with dates. "needs-review" means a real question is open: read the entry's Notes before shipping. Deprecated entries are not listed.

Licence freshness, every entry by check date: ${freshnessPageUrl(site)}
`;
}

function groups(entries, categories) {
  return Object.entries(categories)
    .map(([cat, meta]) => ({ label: meta.label || cat, items: entries.filter((e) => e.category === cat && e.status !== "deprecated") }))
    .filter((g) => g.items.length);
}

export function llmsTxt({ entries, site, categories, stacks = [] }) {
  const out = [header(site)];
  if (stacks.length) {
    out.push(`\n## Starter stacks\n`);
    for (const s of stacks) out.push(`- [${s.meta.title}](${stackPageUrl(site, s.meta.id)}): ${s.meta.task}`);
  }
  for (const g of groups(entries, categories)) {
    out.push(`\n## ${g.label}\n`);
    for (const e of g.items) out.push(`- [${e.name}](${entryPageUrl(site, e.id)}): ${facts(e)}`);
  }
  return `${out.join("\n")}\n`;
}

export function llmsFullTxt({ entries, site, categories, bodies, resolverFor, stacks = [] }) {
  const out = [header(site)];
  if (stacks.length) {
    out.push(`\n## Starter stacks\n`);
    for (const s of stacks) {
      const credits = owes(s.picked).credits.map(
        (c) => `- ${c.entry.name}: ${c.line || "no canned credit line; see the entry page"}`
      );
      const picks = s.picked.map((p) => `- ${p.need}: ${p.entry.name} (${entryPageUrl(site, p.entry.id)}); ${facts(p.entry)}`);
      out.push(
        `### ${s.meta.title}\n\nPage: ${stackPageUrl(site, s.meta.id)}\nTask: ${s.meta.task}\nWalked: ${s.meta.walked}\n\n${picks.join("\n")}\n\nCredits to ship:${credits.length ? `\n${credits.join("\n")}` : " none"}\n`
      );
    }
  }
  for (const g of groups(entries, categories)) {
    out.push(`\n## ${g.label}\n`);
    for (const e of g.items) {
      const body = bodies.get(e.id) || "";
      const page = entryPageUrl(site, e.id);
      const resolveLink = resolverFor ? resolverFor(e) : null;
      const lead = absoluteLinks(leadParagraph(body) || e.summary || "", resolveLink, page);
      const notesMd = sectionMarkdown(body, "Notes");
      const notes = notesMd ? absoluteLinks(notesMd, resolveLink, page) : null;
      out.push(
        `### ${e.name}\n\nPage: ${page}\nSource: ${e.url}\nLicence: ${facts(e)}; verified ${e.verified}\n\n${lead}${notes ? `\n\n${notes}` : ""}\n`
      );
    }
  }
  return `${out.join("\n")}\n`;
}

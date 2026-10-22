/**
 * Flat exports of the catalog: catalog.csv for spreadsheets, feed.xml (Atom)
 * for readers and sitemap.xml for crawlers. data.json stays the full
 * machine-readable catalog.
 */
import { esc } from "./shared.mjs";

/**
 * sitemap.xml. Every URL carries a lastmod that is never earlier than the
 * last content change: the build date for the home and freshness pages, which
 * change every build by design; for entries and stacks the later of the
 * catalog date (`verified`, `walked`) and the file's last commit date from
 * `modified` (repo path => YYYY-MM-DD), falling back to the build date.
 */
export function sitemapXml({ site, entries, stacks = [], stamp, modified = new Map() }) {
  const base = String(site.siteUrl).replace(/\/+$/, "");
  const latest = (...dates) => dates.filter(Boolean).sort().pop() || stamp;
  const url = (loc, lastmod) => `  <url><loc>${esc(loc)}</loc><lastmod>${esc(lastmod)}</lastmod></url>`;
  const urls = [
    url(`${base}/`, stamp),
    url(`${base}/freshness/`, stamp),
    ...stacks.map((s) => url(`${base}/stack/${s.meta.id}/`, latest(s.meta.walked, modified.get(s.rel)))),
    ...entries.map((e) => url(`${base}/entry/${e.id}/`, latest(e.verified, modified.get(e.path)))),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

const CSV_COLUMNS = [
  "id",
  "name",
  "url",
  "category",
  "license",
  "license_spdx",
  "commercial",
  "attribution_required",
  "formats",
  "tags",
  "verified",
  "status",
  "page",
];

/**
 * One CSV field, quoted when it holds a comma, quote or line break. A field
 * a spreadsheet would read as a formula (= + - @, tab, CR) gets a leading
 * apostrophe first (OWASP CSV injection guidance).
 */
export function csvField(value) {
  let text = Array.isArray(value) ? value.join("; ") : value === undefined || value === null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function catalogCsv(entries, siteUrl) {
  const base = siteUrl.replace(/\/+$/, "");
  const rows = entries.map((e) =>
    CSV_COLUMNS.map((col) => csvField(col === "page" ? `${base}/${e.page}` : e[col])).join(",")
  );
  return `${CSV_COLUMNS.join(",")}\r\n${rows.join("\r\n")}\r\n`;
}

/**
 * Homepage JSON-LD: the site (with its ?q= search) and the catalog as a
 * Dataset, so the CSV and JSON exports can surface in dataset search.
 */
export function homeJsonLd({ site, generatedAt, total }) {
  const base = site.siteUrl.replace(/\/+$/, "");
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.title,
      url: `${base}/`,
      description: site.tagline,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${base}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: site.title,
      description: `${site.tagline} ${total} sources, each with its licence as the source states it and the date it was read there.`,
      url: `${base}/`,
      license: "https://creativecommons.org/publicdomain/zero/1.0/",
      isAccessibleForFree: true,
      dateModified: generatedAt.slice(0, 10),
      distribution: [
        { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${base}/catalog.csv` },
        { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${base}/data.json` },
      ],
    },
  ];
}

/**
 * Atom feed of the most recently verified entries. Entries carry no "added"
 * date, so `verified` (the day the licence was last read from the source) is
 * the only honest timestamp.
 */
export function atomFeed({ entries, site, generatedAt, limit = 40 }) {
  const base = site.siteUrl.replace(/\/+$/, "");
  const recent = entries
    .filter((e) => e.status !== "deprecated" && e.verified)
    .sort((a, b) => b.verified.localeCompare(a.verified) || a.name.localeCompare(b.name))
    .slice(0, limit);
  const items = recent.map((e) => {
    const link = `${base}/${e.page}`;
    return [
      "  <entry>",
      `    <id>${esc(link)}</id>`,
      `    <title>${esc(e.name)}</title>`,
      `    <link href="${esc(link)}" />`,
      `    <updated>${esc(e.verified)}T00:00:00Z</updated>`,
      `    <summary>${esc(`${e.license}. ${e.summary || ""}`.trim())}</summary>`,
      "  </entry>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <id>${esc(base)}/</id>`,
    `  <title>${esc(site.title)}: recently verified</title>`,
    `  <subtitle>${esc(site.tagline)}</subtitle>`,
    // RFC 4287 4.1.1: a feed-level author covers every entry.
    `  <author><name>${esc(site.title)}</name><uri>${esc(base)}/</uri></author>`,
    `  <link href="${esc(base)}/" />`,
    `  <link rel="self" href="${esc(base)}/feed.xml" />`,
    `  <updated>${esc(generatedAt)}</updated>`,
    ...items,
    "</feed>",
    "",
  ].join("\n");
}

/**
 * Flat exports of the catalog: catalog.csv for spreadsheets, feed.xml (Atom)
 * for readers and sitemap.xml for crawlers. data.json stays the full
 * machine-readable catalog.
 */
import { esc, isListed } from "./shared.mjs";

/**
 * The folders whose files get a page with a lastmod: catalog entries, stacks
 * and the docs/ guides. build.mjs runs one `git log` over them.
 */
export const DATED_PATHS = ["catalog", "stacks", "docs"];

/**
 * Repo path => YYYY-MM-DD of its last commit, from
 * `git log --format=%x00%cs --name-only` output (newest commit first, so
 * the first date seen for a file is its latest).
 */
export function commitDatesFromLog(out) {
  const dates = new Map();
  let date = null;
  for (const line of String(out).split("\n")) {
    if (line.startsWith("\0")) {
      date = line.slice(1).trim();
      continue;
    }
    const file = line.trim();
    if (file && date && !dates.has(file)) dates.set(file, date);
  }
  return dates;
}

/**
 * sitemap.xml. Every URL carries a lastmod that is never earlier than the
 * last content change: the build date for the home and freshness pages, which
 * change every build by design; for entries and stacks the later of the
 * catalog date (`verified`, `walked`) and the file's last commit date from
 * `modified` (repo path => YYYY-MM-DD), falling back to the build date.
 */
export function sitemapXml({ site, entries, stacks = [], stamp, modified = new Map(), categories = [], guides = [] }) {
  const base = String(site.siteUrl).replace(/\/+$/, "");
  const latest = (...dates) => dates.filter(Boolean).sort().pop() || stamp;
  const url = (loc, lastmod) => `  <url><loc>${esc(loc)}</loc><lastmod>${esc(lastmod)}</lastmod></url>`;
  const urls = [
    url(`${base}/`, stamp),
    url(`${base}/freshness/`, stamp),
    ...categories.map((c) => url(`${base}/category/${c.id}/`, c.lastmod || stamp)),
    ...guides.map((g) => url(`${base}/guide/${g.id}/`, modified.get(g.path) || stamp)),
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
  "added",
  "verified",
  "status",
  "page",
  // Appended, not inserted, so a reader that indexes columns keeps working.
  "subcategories",
  "publisher",
  "attribution_string",
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

/** The two Atom feeds: new sources (by `added`) and licence re-reads (by `verified`). */
export const FEEDS = {
  added: { file: "feed.xml", title: "new sources", what: "entries by the day they joined the catalog" },
  verified: { file: "reverified.xml", title: "recently verified", what: "entries by the day their licence was last read at the source" },
};

/**
 * Atom feed of the most recent entries by `kind`: "added" (new sources,
 * feed.xml) or "verified" (licence re-reads, reverified.xml). Two feeds, so
 * a re-verification sweep of old entries cannot bury the new ones.
 */
export function atomFeed({ entries, site, generatedAt, limit = 40, kind = "added", category = null }) {
  const spec = FEEDS[kind];
  if (!spec) throw new Error(`atomFeed: unknown kind "${kind}"`);
  const base = site.siteUrl.replace(/\/+$/, "");
  // A category feed (category/<id>/feed.xml): new sources in that category only.
  const file = category ? `category/${category.id}/feed.xml` : spec.file;
  const home = category ? `${base}/category/${category.id}/` : `${base}/`;
  const feedTitle = category ? `${spec.title} in ${category.label}` : spec.title;
  const feedId = category ? `${base}/${file}` : `${base}/${kind === "added" ? "" : spec.file}`;
  const recent = entries
    .filter((e) => (!category || e.category === category.id) && isListed(e) && e[kind])
    .sort((a, b) => String(b[kind]).localeCompare(String(a[kind])) || a.name.localeCompare(b.name))
    .slice(0, limit);
  const items = recent.map((e) => {
    const link = `${base}/${e.page}`;
    return [
      "  <entry>",
      `    <id>${esc(link)}</id>`,
      `    <title>${esc(e.name)}</title>`,
      `    <link href="${esc(link)}" />`,
      `    <updated>${esc(e[kind])}T00:00:00Z</updated>`,
      `    <summary>${esc(`${e.license}. ${e.summary || ""}`.trim())}</summary>`,
      "  </entry>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <id>${esc(feedId)}</id>`,
    `  <title>${esc(site.title)}: ${esc(feedTitle)}</title>`,
    `  <subtitle>${esc(`${site.tagline} ${spec.what[0].toUpperCase()}${spec.what.slice(1)}.`)}</subtitle>`,
    // RFC 4287 4.1.1: a feed-level author covers every entry.
    `  <author><name>${esc(site.title)}</name><uri>${esc(base)}/</uri></author>`,
    `  <link href="${esc(home)}" />`,
    `  <link rel="self" href="${esc(base)}/${file}" />`,
    `  <updated>${esc(generatedAt)}</updated>`,
    ...items,
    "</feed>",
    "",
  ].join("\n");
}

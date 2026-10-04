/**
 * Flat exports of the catalog: catalog.csv for spreadsheets and feed.xml (Atom)
 * for readers. data.json stays the full machine-readable catalog.
 */
import { esc } from "./shared.mjs";

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

/** One CSV field, quoted when it holds a comma, quote or line break. */
function csvField(value) {
  const text = Array.isArray(value) ? value.join("; ") : value === undefined || value === null ? "" : String(value);
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
    `  <link href="${esc(base)}/" />`,
    `  <link rel="self" href="${esc(base)}/feed.xml" />`,
    `  <updated>${esc(generatedAt)}</updated>`,
    ...items,
    "</feed>",
    "",
  ].join("\n");
}

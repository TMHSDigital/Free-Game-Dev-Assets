/** Helpers shared by build.mjs and the page modules. */

/** Readable labels for the optional 2D/UI taxonomy. */
export const PERSPECTIVE_LABELS = {
  top_down: "top-down",
  isometric_3_4: "3/4 view",
  side_scroller: "side-scroller",
  "2d_flat": "flat UI",
};

/** What each `maintenance` value tells a reader (checks.mjs V22). */
export const MAINTENANCE_NOTES = {
  archived: "The source repository is archived: read-only, no fixes or updates.",
  inactive: "The source has had no new commits for over three years.",
};

/** What each `engine_lock` value tells a reader (checks.mjs V23). */
export const ENGINE_LOCK_NOTES = {
  unreal: "Licensed for use only in products built with Unreal Engine (Epic's UE-Only Content).",
};

/** Short badge text for each `engine_lock` value. */
export const ENGINE_LOCK_LABELS = { unreal: "UE only" };

/** One-line meaning of each status, matching the homepage legend. */
export const STATUS_NOTES = {
  active: "Licence spot-checked at the source; the entry carries dated evidence.",
  "needs-review": "Useful, but a real question is open. Verify before you ship.",
  deprecated: "Kept for history only.",
};

/** Age buckets for the verified-date cue. Days. */
const VERIFIED_FRESH_DAYS = 180;
const VERIFIED_AGING_DAYS = 365;

/** A real calendar date in strict YYYY-MM-DD form, independent of local time. */
export function isRealDate(value) {
  if (typeof value !== "string" || value.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(0);
  // Unlike Date.UTC, this preserves years 0000-0099.
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function verifiedAge(verified, now) {
  if (!isRealDate(verified)) return { days: null, bucket: "unknown" };
  const t = Date.parse(`${verified}T00:00:00Z`);
  if (Number.isNaN(t)) return { days: null, bucket: "unknown" };
  const days = Math.max(0, Math.floor((now - t) / 86400000));
  const bucket =
    days <= VERIFIED_FRESH_DAYS ? "fresh" : days <= VERIFIED_AGING_DAYS ? "aging" : "stale";
  return { days, bucket };
}

export function esc(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function commercialLabel(v) {
  if (v === true) return "commercial OK";
  if (v === false) return "non-commercial";
  if (v === "varies") return "per-file review";
  return "commercial ?";
}

/**
 * The newest date a check may accept as "not in the future": tomorrow in UTC.
 * A contributor east of UTC who writes their local date before UTC midnight
 * has not written a future date.
 */
export function latestAllowedDate(now = Date.now()) {
  return new Date(now + 86400000).toISOString().slice(0, 10);
}

/**
 * The link schemes the catalog treats as external. validate, the build's link
 * resolver and the page checks all use this one rule, so a URL is accepted or
 * rejected the same way everywhere.
 */
export const EXTERNAL_SCHEME_RE = /^(https?:|mailto:)/i;

/** Any URL scheme at all (`ftp:`, `data:`, `javascript:`), for naming the unsupported one. */
export const ANY_SCHEME_RE = /^([a-z][a-z0-9+.-]*):/i;

/** Absolute URL of an entry's page. */
export function entryPageUrl(site, id) {
  return `${String(site.siteUrl).replace(/\/+$/, "")}/entry/${id}/`;
}

/** A YAML scalar without its quotes, with the quote escapes undone. */
export function unquoteScalar(v) {
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    return v.slice(1, -1).replace(/\\(["\\])/g, "$1");
  }
  if (v.length >= 2 && v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replaceAll("''", "'");
  return v;
}

/** Absolute URL of a starter stack's page. */
export function stackPageUrl(site, id) {
  return `${String(site.siteUrl).replace(/\/+$/, "")}/stack/${id}/`;
}

/** Absolute URL of the licence freshness page. */
export function freshnessPageUrl(site) {
  return `${String(site.siteUrl).replace(/\/+$/, "")}/freshness/`;
}

/**
 * GitHub Sponsors link for the nav and footer. A plain link, not GitHub's
 * iframe button: the iframe fetched a whole GitHub document (with its cookies)
 * twice per page before the catalog had painted, and told GitHub about every
 * page view on a site that promises no analytics. The heart is the Octicons
 * "heart" glyph (MIT).
 */
export function sponsorButtonHtml() {
  return (
    '<a class="sponsor-button" href="https://github.com/sponsors/TMHSDigital" rel="noopener noreferrer">' +
    '<svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" focusable="false"><path fill="currentColor" d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"/></svg>' +
    "Sponsor</a>"
  );
}

/**
 * `text` cut to at most `max` characters: whole if it fits, else at the last
 * sentence end that fits, else at the last word break with an ellipsis.
 */
export function clipText(text, max) {
  const s = String(text).trim();
  if (s.length <= max) return s;
  const head = s.slice(0, max);
  let sentence = -1;
  for (const m of s.matchAll(/[.!?](?=\s)/g)) if (m.index < max) sentence = m.index;
  if (sentence >= Math.floor(max / 3)) return head.slice(0, sentence + 1);
  const cut = head.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > Math.floor(max / 2) ? cut.slice(0, space) : cut).replace(/[\s,;:]+$/, "")}…`;
}

/** Search-result limits (Google truncates around these). */
export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

/**
 * An entry page's `<title>`: "name · licence", the name alone when that is
 * too long, and the site name nowhere (og:site_name carries it). The licence
 * is the part a searcher came for, so it is never the part that gets cut.
 */
export function seoTitle(name, license, max = SEO_TITLE_MAX) {
  const full = `${name} · ${license}`;
  if (full.length <= max) return full;
  return clipText(String(name), max);
}

/**
 * An entry page's meta description: the licence, the commercial stance and
 * the credit requirement first, then as much of the summary as fits.
 */
export function seoDescription(entry, max = SEO_DESCRIPTION_MAX - 5) {
  const stance =
    entry.commercial === true
      ? "commercial use OK"
      : entry.commercial === false
        ? "non-commercial only"
        : entry.commercial === "varies"
          ? "commercial use varies per file"
          : "commercial use unclear";
  const credit =
    entry.attribution_required === true
      ? "credit required"
      : entry.attribution_required === false
        ? "no credit needed"
        : "credit unclear";
  const lead = `${entry.license}, ${stance}, ${credit}.`;
  const summary = String(entry.summary || "").trim();
  if (!summary) return clipText(lead, max);
  const first = summary.split(/(?<=[.!?])\s+/)[0];
  return clipText(`${lead} ${first}`, max);
}

/** Self-hosted fonts (site/public/fonts/, OFL). The body face and the mono face are preloaded; the italic is not. */
export const FONT_FILES = ["fonts/public-sans.woff2", "fonts/ibm-plex-mono-400.woff2"];

/** Icon, font preloads and stylesheet, resolved against `root`. Every page type shares them. */
export function headAssetsHtml(root = "./") {
  return [
    `<link rel="icon" href="${esc(root)}favicon.svg" type="image/svg+xml" />`,
    ...FONT_FILES.map((f) => `<link rel="preload" href="${esc(root)}${f}" as="font" type="font/woff2" crossorigin />`),
    `<link rel="stylesheet" href="${esc(root)}styles.css" />`,
  ];
}

/** Social preview image, a first-party screenshot copied into dist by the build. */
export const OG_CARD_NAME = "og-card.png";

/**
 * The <head> lines every page type shares: canonical, sitemap and feed
 * discovery, theme colours for both schemes, Open Graph and Twitter cards.
 * One helper so an entry page cannot ship a thinner head than the home page.
 * `<title>` and `<meta name="description">` stay with each page. `root` is the
 * page's path back to the site root ("./", "../", "../../"): the icon, the
 * self-hosted font preloads and the stylesheet are resolved against it.
 */
export function baseHeadHtml({ site, title, description, url, type = "website", hasCard, indent = "    ", root = "./" }) {
  const base = String(site.siteUrl).replace(/\/+$/, "");
  const card = `${base}/${OG_CARD_NAME}`;
  const cardMeta = hasCard
    ? [
        `<meta property="og:image" content="${esc(card)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${esc(`${site.title}: ${site.tagline}`)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:image" content="${esc(card)}" />`,
      ]
    : [`<meta name="twitter:card" content="summary" />`];
  return [
    `<link rel="canonical" href="${esc(url)}" />`,
    // robots.txt is only read at a host's root, so under a project Pages path
    // its Sitemap line is never seen; point at the sitemap from the page too.
    `<link rel="sitemap" type="application/xml" href="${esc(base)}/sitemap.xml" />`,
    `<link rel="alternate" type="application/atom+xml" title="${esc(site.title)}: new sources" href="${esc(base)}/feed.xml" />`,
    `<link rel="alternate" type="application/atom+xml" title="${esc(site.title)}: recently verified" href="${esc(base)}/reverified.xml" />`,
    `<meta name="theme-color" content="#1a4d3e" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#0f1216" media="(prefers-color-scheme: dark)" />`,
    `<meta property="og:type" content="${esc(type)}" />`,
    `<meta property="og:site_name" content="${esc(site.title)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    ...cardMeta,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    ...headAssetsHtml(root),
  ].join(`\n${indent}`);
}

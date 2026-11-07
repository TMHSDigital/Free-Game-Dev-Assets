/** Helpers shared by build.mjs and the page modules. */

/**
 * The `camera_perspective` vocabulary, its one source (#222): the short label
 * on cards, the words search answers to, and the camera-view filter option.
 * validate (V12), search, cards and the filter all read it from here.
 */
/**
 * Whether an entry is listed: shown in search, counted in "N sources", fed
 * to the exports and the link checks. Deprecated entries keep their pages
 * but are not listed (#257). The one place the rule lives.
 */
export const isListed = (entry) => entry.status !== "deprecated";

export const PERSPECTIVES = {
  top_down: { label: "top-down", search: "top-down", option: "Top-down, straight down" },
  // A 3/4 pack is what most people mean by a top-down RPG, so it answers "top down" too.
  isometric_3_4: { label: "3/4 view", search: "3/4 view top-down", option: "3/4 top-down, walls visible" },
  side_scroller: { label: "side-scroller", search: "side-scroller", option: "Side-scroller" },
  "2d_flat": { label: "flat UI", search: "flat ui", option: "Flat UI" },
};

/** Readable labels for the optional 2D/UI taxonomy. */
export const PERSPECTIVE_LABELS = Object.fromEntries(Object.entries(PERSPECTIVES).map(([k, v]) => [k, v.label]));

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

/** Age buckets for the verified-date cue, in days. The one place these numbers live. */
export const VERIFIED_FRESH_DAYS = 180;
export const VERIFIED_AGING_DAYS = 365;

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
/** The licence value as the start of a sentence: catalog vocabulary words become prose. */
export function licencePhrase(license) {
  const v = String(license);
  return { custom: "Custom licence", varies: "Mixed licences, per file", unknown: "Licence unknown", "public-domain": "Public domain" }[v] || v;
}

/** schema.org BreadcrumbList from [{ name, url }], in order from the site root. */
export function breadcrumbLd(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

/**
 * `scope` is the engine an entry is made for when it only works there
 * (entry-page.mjs derives it from formats); `limits` is the entry's own
 * restriction line. Both lead the description, so a search result never
 * reads as unrestricted.
 */
export function seoDescription(entry, max = SEO_DESCRIPTION_MAX - 5, { scope = null } = {}) {
  const stance =
    entry.commercial === true
      ? "commercial use OK"
      : entry.commercial === false
        ? "non-commercial only"
        : entry.commercial === "varies"
          ? "commercial use varies per file"
          : "commercial use unclear";
  // A per-file source promises nothing about credit for the file you pick.
  const credit =
    entry.commercial === "varies"
      ? "credit varies per file"
      : entry.attribution_required === true
        ? "credit required"
        : entry.attribution_required === false
          ? "no credit needed"
          : "credit unclear";
  const scopeText = entry.engine_lock ? ` ${ENGINE_LOCK_LABELS[entry.engine_lock] || entry.engine_lock}.` : scope ? ` For ${scope} only.` : "";
  const limitsText = entry.limits ? ` ${entry.limits}.` : "";
  const lead = `${licencePhrase(entry.license)}, ${stance}, ${credit}.${scopeText}${limitsText}`;
  const summary = String(entry.summary || "").trim();
  if (!summary) return clipText(lead, max);
  const first = summary.split(/(?<=[.!?])\s+/)[0];
  return clipText(`${lead} ${first}`, max);
}

/** The commercial-use colour an entry row carries (`--edge`). */
export function edgeVar(entry) {
  if (entry.commercial === true) return "var(--ok)";
  if (entry.commercial === false) return "var(--danger)";
  if (entry.commercial === "varies") return "var(--warn)";
  return "var(--unknown)";
}

/** The one-line credit every page footer carries for the publisher previews. */
export const PREVIEW_CREDIT_LINE = "Preview images belong to their publishers and are shown under each entry's licence.";

/**
 * The top bar every generated page shares. `root` is the relative path to the
 * site root from the page ("../../" for entry/, "../" for freshness/).
 * site/public/index.html keeps its own copy, since its links are in-page
 * anchors and app.js finds them by id.
 */
export function siteHeaderHtml({ root, repo }) {
  return `<header class="topbar">
      <a class="brand" href="${root}">Free Game Dev Assets</a>
      <nav class="topnav" aria-label="Primary">
        <a href="${root}#catalog">Catalog</a>
        <a href="${root}#stacks">Stacks</a>
        <a href="${root}#starters">Starters</a>
        <a href="${root}#guides">Guides</a>
        <a href="${esc(repo)}" rel="noopener noreferrer">GitHub</a>
        <span class="nav-sponsor">${sponsorButtonHtml()}</span>
      </nav>
    </header>`;
}

/**
 * The footer every generated page shares. `credit: false` drops the preview
 * credit on pages that show no previews; `current: "freshness"` drops the
 * link to the page the reader is on.
 */
export function siteFooterHtml({ root, stamp, total, credit = true, current = null }) {
  const links = [
    current === "freshness" ? null : `<a href="${root}freshness/">Licence freshness</a>`,
    `<a href="${root}data.json">data.json</a>`,
    `<a href="${root}catalog.csv">CSV</a>`,
    `<a href="${root}feed.xml">feed</a>`,
    `<a href="${root}guide/data/">Use the data</a>`,
  ].filter(Boolean);
  return `<footer class="footer">
      <p>Catalog metadata is CC0. Linked assets keep their own licences. This is the catalog's reading of each licence, not legal advice: re-check the live source before shipping.</p>
${credit ? `      <p class="footer-credit">${PREVIEW_CREDIT_LINE}</p>\n` : ""}      <p>${links.join(" · ")}</p>
      <p class="footer-sponsor">${sponsorButtonHtml()}</p>
      <p class="footer-stamp">Built ${esc(stamp)} from ${total} listed sources.</p>
    </footer>`;
}

/** Self-hosted fonts (site/public/fonts/, OFL). The body face and the mono face are preloaded; the italic is not. */
export const FONT_FILES = ["fonts/public-sans.woff2", "fonts/ibm-plex-mono-400.woff2"];

/**
 * The lib modules the browser loads, output name in site/dist -> source in
 * site/lib. build.mjs copies exactly these, and lib.test.mjs checks that none
 * of them (or any site/public script) imports from node:.
 */
export const BROWSER_MODULES = {
  "owes.js": "owes.mjs", // the shortlist's CREDITS file, same code as the stack pages
  "search.js": "search.mjs", // the catalog search and the 404 page's guesses
  "cards.mjs": "cards.mjs", // the entry card template, for app.js and the category pages
  "shared.mjs": "shared.mjs",
};

/**
 * Every ES module each page type loads, entry scripts and their imports, as
 * served from dist. The head preloads the whole set so the browser fetches
 * them in parallel instead of discovering each import one round trip later.
 * lib.test.mjs walks the real import graph and fails if a list drifts.
 */
export const PAGE_MODULES = {
  home: ["app.js", "search.js", "cards.mjs", "shared.mjs", "views.js", "shortlist.js", "owes.js"],
  entry: ["shortlist.js", "owes.js"],
  category: ["category.js", "views.js", "shortlist.js", "owes.js"],
  notFound: ["not-found.js", "search.js", "shared.mjs"],
};

/**
 * The OpenSearch description (opensearch.xml): lets a browser add the catalog
 * as a search engine. A search opens the homepage with `?q=`, which the page
 * already reads (search.mjs readState).
 */
/** A title cut at a word to OpenSearch's 16-character ShortName limit. */
function shortName(title) {
  let out = "";
  for (const word of String(title).split(/\s+/)) {
    const next = out ? `${out} ${word}` : word;
    if (next.length > 16) break;
    out = next;
  }
  return out || String(title).slice(0, 16);
}

export function opensearchXml(site) {
  const base = String(site.siteUrl).replace(/\/+$/, "");
  return `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>${esc(shortName(site.title))}</ShortName>
  <Description>${esc(`Search ${site.title}: ${site.tagline}`.slice(0, 1024))}</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/svg+xml">${esc(base)}/favicon.svg</Image>
  <Url type="text/html" method="get" template="${esc(base)}/?q={searchTerms}#catalog" />
  <Url type="application/opensearchdescription+xml" rel="self" template="${esc(base)}/opensearch.xml" />
  <moz:SearchForm>${esc(base)}/</moz:SearchForm>
</OpenSearchDescription>
`;
}

/** The homepage's <link> to opensearch.xml. */
export function opensearchLinkHtml(site) {
  return `<link rel="search" type="application/opensearchdescription+xml" title="${esc(site.title)}" href="${esc(String(site.siteUrl).replace(/\/+$/, ""))}/opensearch.xml" />`;
}

/**
 * The Content-Security-Policy every page carries. Pages cannot set response
 * headers, so it is a <meta> tag, first in <head>. Scripts, fonts, images and
 * requests are same-origin only; inline styles stay allowed for the few
 * style="--var: ..." attributes; JSON-LD blocks are data, not script, so the
 * policy does not touch them. frame-ancestors cannot be set from a <meta>.
 */
export const CSP =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'";
export const CSP_META = `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`;

/** The CSP, icon, font preloads and stylesheet, resolved against `root`. Every page type shares them. */
export function headAssetsHtml(root = "./") {
  return [
    CSP_META,
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
export function baseHeadHtml({ site, title, description, url, type = "website", hasCard, indent = "    ", root = "./", modules = [] }) {
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
    // The CSP comes first, before any preload or script it governs.
    ...headAssetsHtml(root),
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
    ...modules.map((m) => `<link rel="modulepreload" href="${esc(root)}${esc(m)}" />`),
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
  ].join(`\n${indent}`);
}

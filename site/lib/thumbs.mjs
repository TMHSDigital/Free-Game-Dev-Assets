/**
 * Thumbnail rules: which entries may show their publisher's preview image,
 * where that image is found, and when a stored one needs refreshing.
 *
 * Pure and browser-safe (no node: imports): site/thumbs.mjs and the
 * validator use it on the server, and the build copies nothing from here to
 * the browser, but keeping it pure keeps it testable.
 */

/** Licences that allow a resized copy of the publisher's preview to be redistributed. An explicit allowlist, not a prefix match. */
export const PREVIEW_LICENSES = new Set([
  "CC0",
  "Unlicense",
  "public-domain",
  "CC-BY",
  "CC-BY-3.0",
  "CC-BY-4.0",
  "CC-BY-SA",
  "CC-BY-SA-3.0",
  "CC-BY-SA-4.0",
  "MIT",
  "ISC",
  "BSD",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "BSD-3-Clause-Clear",
  "Apache-2.0",
  "MPL-2.0",
  "SIL OFL",
  "GPL-2.0",
  "GPL-2.0-only",
  "GPL-2.0-or-later",
  "GPL-3.0",
  "GPL-3.0-only",
  "GPL-3.0-or-later",
  "LGPL-3.0",
  "CDLA-Permissive-2.0",
]);

/** Hosts whose og:image is a social card or a logo, never an asset preview. */
export const SKIP_HOSTS = new Set(["github.com", "www.github.com", "fonts.google.com"]);

/**
 * Categories where the page's og:image is the project's logo, splash screen
 * or social card rather than the asset. The program's or font's licence does
 * not cover that artwork, so these entries only get a thumbnail from a
 * maintainer-checked `preview:` URL.
 */
export const LOGO_CATEGORIES = new Set(["tools", "fonts"]);

/** Licences whose terms require naming the creator wherever the work is shown. */
export function isAttributionLicence(license) {
  return /^CC-BY/.test(String(license));
}

/**
 * True for hosts a fetch from CI must never reach: localhost, local-only
 * suffixes and IP literals (a public catalog source is named by DNS).
 */
export function isPrivateHost(hostname) {
  const h = String(hostname).toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "" || h === "localhost" || /\.(localhost|local|internal|lan)$/.test(h)) return true;
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(h) || h.includes(":");
}

/** An https URL on a public host, or null. http is upgraded to https; anything else is refused. */
export function safeImageUrl(raw) {
  let u;
  try {
    u = new URL(String(raw));
  } catch {
    return null;
  }
  if (u.protocol === "http:") u.protocol = "https:";
  if (u.protocol !== "https:" || u.username || u.password || isPrivateHost(u.hostname)) return null;
  return u.href;
}

/** The image format from its first bytes (png, jpeg, gif, webp), or null. Checked before a converter sees the file. */
export function sniffImage(bytes) {
  const b = bytes;
  if (!b || b.length < 12) return null;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "png";
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpeg";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return "gif";
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  return null;
}

function hostOf(url) {
  try {
    return new URL(String(url)).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Whether an entry may carry a thumbnail. `preview: none` opts out; a
 * `preview:` URL overrides only the host rule, never status or licence.
 */
export function previewEligibility(entry) {
  const preview = entry.preview === undefined || entry.preview === null ? "" : String(entry.preview);
  if (preview === "none") return { ok: false, reason: "preview: none" };
  if (entry.status !== "active") return { ok: false, reason: `status is ${entry.status}` };
  if (!PREVIEW_LICENSES.has(String(entry.license))) {
    return { ok: false, reason: `licence ${entry.license} is not in the preview allowlist` };
  }
  const pinned = /^https:\/\//.test(preview);
  if (LOGO_CATEGORIES.has(String(entry.category)) && !pinned) {
    return {
      ok: false,
      reason: `category ${entry.category}: the page image is a logo, splash or social card that the ${entry.license} licence does not cover; pin a checked image with preview:`,
    };
  }
  if (isAttributionLicence(entry.license) && !entry.attribution_string && !entry.publisher) {
    return { ok: false, reason: `licence ${entry.license} needs a creator to credit; set attribution_string or publisher` };
  }
  const host = hostOf(entry.url);
  if (SKIP_HOSTS.has(host) && !pinned) return { ok: false, reason: `host ${host} is skipped` };
  return { ok: true, reason: null };
}

const META_RE = /<meta\b[^>]*>/gi;
const ATTR_RE = /([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g;

function attrsOf(tag) {
  const out = {};
  for (const m of tag.matchAll(ATTR_RE)) out[m[1].toLowerCase()] = m[3] ?? m[4] ?? "";
  return out;
}

const decodeEntities = (s) => s.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");

/** The page's og:image (then twitter:image), absolute, or null. */
export function imageUrlFromHtml(html, pageUrl) {
  const found = { og: null, twitter: null };
  for (const m of String(html).matchAll(META_RE)) {
    const a = attrsOf(m[0]);
    const key = (a.property || a.name || "").toLowerCase();
    if (!a.content) continue;
    if (key === "og:image" || key === "og:image:url" || key === "og:image:secure_url") {
      if (!found.og) found.og = a.content;
    } else if (key === "twitter:image" || key === "twitter:image:src") {
      if (!found.twitter) found.twitter = a.content;
    }
  }
  const raw = found.og || found.twitter;
  if (!raw) return null;
  try {
    const abs = new URL(decodeEntities(raw).trim(), pageUrl);
    return /^https?:$/.test(abs.protocol) ? safeImageUrl(abs.href) : null;
  } catch {
    return null;
  }
}

/** Ids whose image bytes are shared by three or more records: a logo, not a preview. Pinned records are exempt. */
export function sharedImageIds(records) {
  const byHash = new Map();
  for (const [id, rec] of Object.entries(records || {})) {
    if (!rec || !rec.hash || rec.pinned) continue;
    if (!byHash.has(rec.hash)) byHash.set(rec.hash, []);
    byHash.get(rec.hash).push(id);
  }
  const out = new Set();
  for (const ids of byHash.values()) if (ids.length >= 3) for (const id of ids) out.add(id);
  return out;
}

const DAY = 86400000;

/**
 * Whether a stored record is missing, forced, under a different licence,
 * older than maxAgeDays, or no longer describes the entry: its `url` moved,
 * a `preview:` pin was added, removed or changed. Pass `url` and
 * `preview` to get the last three checks.
 */
export function needsFetch(record, { license, today, force = false, maxAgeDays = 180, url, preview }) {
  if (!record || force) return true;
  if (record.license !== license) return true;
  if (url !== undefined && record.source !== url) return true;
  if (preview !== undefined) {
    const pinned = /^https:\/\//.test(preview || "");
    if (Boolean(record.pinned) !== pinned) return true;
    if (pinned && record.image !== preview) return true;
  }
  const fetched = Date.parse(`${record.fetched}T00:00:00Z`);
  const now = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(fetched) || Number.isNaN(now)) return true;
  return now - fetched > maxAgeDays * DAY;
}

/** Consecutive failed refreshes after which a stored image is dropped. */
export const MAX_FAILURES = 3;

/**
 * After a failed refresh: the record to keep (with its failure count raised),
 * or null when it should be dropped because the source has failed
 * MAX_FAILURES times in a row or the image is older than twice maxAgeDays.
 */
export function afterFailure(record, { today, maxAgeDays = 180 }) {
  if (!record) return null;
  const failures = (Number(record.failures) || 0) + 1;
  const fetched = Date.parse(`${record.fetched}T00:00:00Z`);
  const now = Date.parse(`${today}T00:00:00Z`);
  const ancient = Number.isNaN(fetched) || Number.isNaN(now) || now - fetched > 2 * maxAgeDays * DAY;
  if (failures >= MAX_FAILURES || ancient) return null;
  return { ...record, failures };
}

/** Width and height of a WebP file from its header (VP8, VP8L or VP8X), or null. */
export function webpSize(buf) {
  if (!buf || buf.length < 25) return null;
  if (buf.toString("latin1", 0, 4) !== "RIFF" || buf.toString("latin1", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("latin1", 12, 16);
  if (chunk === "VP8X") {
    if (buf.length < 30) return null;
    const width = (buf[24] | (buf[25] << 8) | (buf[26] << 16)) + 1;
    const height = (buf[27] | (buf[28] << 8) | (buf[29] << 16)) + 1;
    return { width, height };
  }
  if (chunk === "VP8L") {
    if (buf[20] !== 0x2f) return null;
    const bits = buf[21] | (buf[22] << 8) | (buf[23] << 16) | (buf[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8 ") {
    if (buf.length < 30 || buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) return null;
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  return null;
}

/** The publisher when recorded, else the source hostname without www. */
export function publisherKey(entry) {
  if (entry.publisher) return String(entry.publisher);
  return hostOf(entry.url).replace(/^www\./, "");
}

/**
 * The credit line shown under a preview image. For attribution licences the
 * recorded credit line comes first, then the publisher: CC-BY requires the
 * creator to be named wherever the work is shown.
 */
export function previewCredit(entry) {
  const licence = String(entry.license);
  if (isAttributionLicence(licence)) {
    const creator = entry.attribution_string ? String(entry.attribution_string) : entry.publisher ? String(entry.publisher) : "";
    if (creator) return `${creator.replace(/[.\s]+$/, "")}. Preview image shown under ${licence}`;
  }
  const from = entry.publisher ? String(entry.publisher) : "the source page";
  return `Preview image from ${from}, shown under ${licence}`;
}

/**
 * The hero filmstrip: active entries with a thumbnail from the card-view
 * categories, newest check first, one per publisher.
 */
export function filmstripPick(entries, { count = 9, cardCategories = [] } = {}) {
  const cats = new Set(cardCategories);
  const pool = entries
    .filter((e) => e.status === "active" && e.thumb && cats.has(e.category))
    .sort((a, b) => String(b.verified || "").localeCompare(String(a.verified || "")) || a.name.localeCompare(b.name));
  const seen = new Set();
  const out = [];
  for (const e of pool) {
    const key = publisherKey(e);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
    if (out.length >= count) break;
  }
  return out;
}

/** Dist-relative path of an entry's thumbnail. */
export function thumbRelPath(id) {
  return `thumbs/${id}.webp`;
}

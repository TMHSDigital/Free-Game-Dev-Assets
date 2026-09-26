/** Helpers shared by build.mjs and the page modules. */

/** Readable labels for the optional 2D/UI taxonomy. */
export const PERSPECTIVE_LABELS = {
  top_down: "top-down",
  isometric_3_4: "3/4 view",
  side_scroller: "side-scroller",
  "2d_flat": "flat UI",
};

/** One-line meaning of each status, matching the homepage legend. */
export const STATUS_NOTES = {
  active: "License spot-checked at the source; the entry carries dated evidence.",
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

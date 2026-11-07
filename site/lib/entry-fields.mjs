/**
 * Which frontmatter fields reach data.json, and how. normalizeEntry gives
 * the core fields (always present, with fallbacks) and the optional ones
 * from OPTIONAL_FIELDS; lib.test.mjs checks that every key
 * validate knows (checks.mjs KNOWN_KEYS) is one or the other, or listed in
 * NOT_EXPORTED with a reason, so a new field cannot pass validate and then
 * silently never reach the site.
 */

/** Always in data.json, normalised by normalizeEntry. */
export const CORE_FIELDS = [
  "id", "name", "url", "category", "subcategories", "license", "commercial",
  "attribution_required", "formats", "tags", "added", "verified", "status",
];

/** In data.json only when set: `string` fields are stringified, `list` fields kept as arrays. */
export const OPTIONAL_FIELDS = [
  { key: "grid_dimensions", type: "string" },
  { key: "camera_perspective", type: "string" },
  { key: "hardware_tags", type: "list" },
  { key: "attribution_string", type: "string" },
  { key: "publisher", type: "string" },
  { key: "license_spdx", type: "string" },
  { key: "maintenance", type: "string" },
  { key: "engine_lock", type: "string" },
  { key: "ue_versions", type: "string" },
  { key: "limits", type: "string" },
];

/**
 * The fields a page cannot be written without. validate requires every
 * core field (checks.mjs REQUIRED_KEYS); a local build stops on these.
 */
export const RENDER_REQUIRED = ["id", "name", "url", "category", "license", "status"];

/** Known keys deliberately left out of data.json, with why. */
export const NOT_EXPORTED = {
  // An instruction to the thumbnail script; the result is exported as `thumb`.
  preview: "used by site/thumbs.mjs; its result is the entry's `thumb`",
};

const text = (v) => (v === undefined || v === null ? "" : String(v));
const list = (v) => (Array.isArray(v) ? v : []);

/**
 * One entry's frontmatter as every script reads it (#256): the core fields
 * with one set of fallbacks (a missing string is "", never "undefined"; a
 * list that is not a list is []; `commercial` and `attribution_required`
 * that are not a real boolean, or "varies", read as "unknown"), the
 * optional fields when set, `preview` when set, and `path` (the repo path).
 * build, check-links, reverify-batch and thumbs each take what they need.
 */
export function normalizeEntry(meta, rel) {
  return {
    id: text(meta.id),
    name: text(meta.name),
    url: text(meta.url),
    category: text(meta.category),
    subcategories: list(meta.subcategories),
    license: text(meta.license),
    commercial: meta.commercial === true || meta.commercial === false || meta.commercial === "varies" ? meta.commercial : "unknown",
    attribution_required: meta.attribution_required === true || meta.attribution_required === false ? meta.attribution_required : "unknown",
    formats: list(meta.formats),
    tags: list(meta.tags),
    added: meta.added ? String(meta.added) : null,
    verified: meta.verified ? String(meta.verified) : null,
    status: text(meta.status),
    path: rel,
    ...optionalFields(meta),
    ...(meta.preview === undefined || meta.preview === null ? {} : { preview: String(meta.preview) }),
  };
}

/** The optional fields of one entry's frontmatter, as data.json carries them. */
export function optionalFields(meta) {
  const out = {};
  for (const { key, type } of OPTIONAL_FIELDS) {
    const v = meta[key];
    if (type === "list") {
      if (Array.isArray(v)) out[key] = v;
    } else if (v) {
      out[key] = String(v);
    }
  }
  return out;
}

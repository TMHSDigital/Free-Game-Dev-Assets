/**
 * Which frontmatter fields reach data.json, and how. build.mjs writes the
 * core fields one by one (they are always present, with fallbacks) and the
 * optional ones from OPTIONAL_FIELDS; lib.test.mjs checks that every key
 * validate knows (checks.mjs KNOWN_KEYS) is one or the other, or listed in
 * NOT_EXPORTED with a reason, so a new field cannot pass validate and then
 * silently never reach the site.
 */

/** Always in data.json, normalised by build.mjs loadEntries. */
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

/** Known keys deliberately left out of data.json, with why. */
export const NOT_EXPORTED = {
  // An instruction to the thumbnail script; the result is exported as `thumb`.
  preview: "used by site/thumbs.mjs; its result is the entry's `thumb`",
};

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

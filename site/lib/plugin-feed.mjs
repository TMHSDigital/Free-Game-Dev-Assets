/**
 * plugin-feed.json: a slim, versioned copy of the catalog for editor plugins
 * (the Godot plugin first, #116 / #277). It carries what a plugin lists,
 * filters and credits, with the site's engine-fit logic already applied, so
 * no plugin has to port search.mjs or fetch the full data.json.
 *
 * `format` goes up only on a breaking change (a removed, renamed or retyped
 * field). New fields can appear at any time; plugins ignore keys they do not
 * know. Optional fields are always present, as null when unset, so a plugin
 * never has to tell "missing" from "empty".
 */
import { ENGINES, engineRank, worksInEngine } from "./search.mjs";
import { isListed } from "./shared.mjs";

export const PLUGIN_FEED_FORMAT = 1;

/**
 * Gzipped size the build warns above, so the feed stays slim. Gzipped because
 * that is what a plugin downloads: GitHub Pages serves JSON gzipped and
 * Godot's HTTPRequest accepts gzip by default. The summaries are most of the
 * raw size and the plugin's details panel needs them.
 */
export const PLUGIN_FEED_BUDGET_GZIP_BYTES = 100 * 1024;

const ENGINE_IDS = Object.keys(ENGINES);

/** One entry as plugins see it. */
export function pluginEntry(e) {
  return {
    id: e.id,
    name: e.name,
    url: e.url,
    page: e.page,
    category: e.category,
    license: e.license,
    license_spdx: e.license_spdx || null,
    licenseFamily: e.licenseFamily,
    // "notice" means carry the licence text with the files (MIT, OFL...),
    // which owes.mjs lists apart from credits-screen lines.
    attributionClass: e.attributionClass,
    commercial: e.commercial,
    attribution_required: e.attribution_required,
    // The recorded credit line, or null: the site's CREDITS export prints
    // "no canned credit line; see the entry" then, and so should a plugin.
    credit_line: e.attribution_string || null,
    formats: e.formats || [],
    tags: e.tags || [],
    publisher: e.publisher || null,
    status: e.status,
    verified: e.verified || null,
    summary: e.summary || "",
    // Engines the entry can be used in (not locked out by licence or format).
    works_in: ENGINE_IDS.filter((k) => worksInEngine(e, k)),
    // Engines the entry is made for (tagged, native format or locked to it):
    // the site sorts these first when that engine is chosen.
    made_for: ENGINE_IDS.filter((k) => engineRank(e, k) === 0),
  };
}

/** The whole feed: listed entries only (active and needs-review), as the site shows. */
export function pluginFeed({ entries, version, generatedAt, site, categories, licenseFamilies }) {
  return {
    format: PLUGIN_FEED_FORMAT,
    version,
    generatedAt,
    siteUrl: site.siteUrl,
    categories: Object.fromEntries(Object.entries(categories).map(([id, c]) => [id, c.label || id])),
    licenseFamilies,
    engines: Object.fromEntries(ENGINE_IDS.map((k) => [k, ENGINES[k].label])),
    entries: entries.filter(isListed).map(pluginEntry),
  };
}

/**
 * The catalog page's search, filter and URL logic, and the 404 page's
 * closest-entry guess, as pure functions. The build copies this file into
 * site/dist as search.js; app.js and not-found.js import it there, and
 * lib.test.mjs tests it here.
 */

// Searchable words per perspective. A 3/4 pack is what most people mean by a top-down
// RPG, so it answers "top down" too.
export const PERSPECTIVE_SEARCH = {
  top_down: "top-down",
  isometric_3_4: "3/4 view top-down",
  side_scroller: "side-scroller",
  "2d_flat": "flat ui",
};

// Hyphens and underscores read as spaces: "first person" finds the "first-person" tag.
export function normalize(text) {
  return String(text).toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Hyphenated compounds written as one word: "low-poly sci-fi" gives
 * "lowpoly scifi", so a reader who types the joined form finds them too.
 */
export function joinedCompounds(text) {
  const out = [];
  for (const m of String(text).toLowerCase().matchAll(/[\p{L}\p{N}]+(?:[-_][\p{L}\p{N}]+)+/gu)) out.push(m[0].replace(/[-_]/g, ""));
  return out.join(" ");
}

/**
 * An entry's searchable text in three fields. Name, publisher and tags are
 * what a reader means by a word, so a hit there ranks above one in the other
 * metadata, which ranks above a summary-only hit. Tags no longer repeat the
 * publisher or licence (V19, V21), so those fields are searched directly.
 */
export const FIELD_WEIGHTS = [3, 2, 1];
export function searchFields(e) {
  const field = (text) => normalize(`${text} ${joinedCompounds(text)}`);
  return [
    field([e.name, e.publisher || "", ...(e.tags || [])].join(" ")),
    field([e.license, e.category, PERSPECTIVE_SEARCH[e.camera_perspective] || "", ...(e.formats || []), ...(e.subcategories || [])].join(" ")),
    field(e.summary || ""),
  ];
}

/**
 * A few words readers use for the same thing as the catalog's own wording.
 * A query word also matches each listed phrase (normalised text, so a phrase
 * may hold a space).
 */
export const SYNONYMS = {
  sfx: ["sound effect"],
  bgm: ["music"],
  model: ["mesh"],
  mesh: ["model"],
  tileset: ["tilemap", "tile set"],
  tilemap: ["tileset", "tile map"],
};

/**
 * One test per query word. A word matches at the start of a word in the
 * text, never inside one: "ui" finds "UI kit" but not "build", "art" finds
 * "artwork" but not "earth". A plural query word also matches its singular,
 * since tags are stored one way: "buttons" finds the "button" tag. Each form
 * also matches its SYNONYMS.
 */
export function wordTest(word) {
  const forms = [word];
  if (word.length > 3 && word.endsWith("s")) forms.push(word.slice(0, -1));
  for (const f of [...forms]) forms.push(...(SYNONYMS[f] || []));
  const alt = forms.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])(?:${alt})`, "u");
}

export function queryTests(q) {
  return normalize(q).split(" ").filter(Boolean).map(wordTest);
}

/**
 * 0 when the entry misses any query word. Every word must match somewhere,
 * in any order, so "top down" and "arms fps" work. Each word scores by the
 * best field it matched in, so name and tag hits rank first.
 */
export function scoreFields(fields, tests) {
  if (!tests.length) return 1;
  let score = 0;
  for (const re of tests) {
    const i = fields.findIndex((f) => re.test(f));
    if (i === -1) return 0;
    score += FIELD_WEIGHTS[i];
  }
  return score;
}

/** Every filter except the category and the search words. */
export function passesFilters(entry, state, formatGroups = {}) {
  if (entry.status === "active" && !state.active) return false;
  if (entry.status === "needs-review" && !state.review) return false;
  if (entry.status === "deprecated" && !state.deprecated) return false;
  if (state.commercialOnly && entry.commercial !== true && entry.commercial !== "varies") return false;
  if (state.noAttr && entry.attribution_required !== false) return false;
  if (state.perspective !== "any" && entry.camera_perspective !== state.perspective) return false;
  if (state.license !== "any" && entry.licenseFamily !== state.license) return false;
  if (state.engine && state.engine !== "any" && !worksInEngine(entry, state.engine)) return false;
  if (state.format !== "any") {
    const wanted = formatGroups[state.format]?.formats || [];
    if (!(entry.formats || []).some((f) => wanted.includes(f))) return false;
  }
  return true;
}

/** Choice params: URL key -> state field. `allowed` supplies each field's legal values. */
/**
 * The engine filter. An entry is hidden when it only works in another
 * engine: its licence is locked to one (engine_lock), or everything it
 * ships is native to one (nativeEngines). Entries made for the chosen
 * engine sort first. Everything else is engine-agnostic and stays listed.
 *
 * `formats` are the engine-native formats: a project, addon, plugin or
 * shader that only that engine opens.
 */
export const ENGINES = {
  godot: { label: "Godot", tags: ["godot", "godot-4"], formats: ["Godot", "godot-addon", "gdextension", "gdshader"] },
  unity: { label: "Unity", tags: ["unity"], formats: ["Unity"] },
  unreal: { label: "Unreal Engine", tags: ["unreal-engine", "unreal"], formats: ["Unreal", "unreal-plugin"] },
};

/**
 * Formats that ride along with an engine-native one without making an entry
 * portable: an Unreal plugin's C++ source, the Godot editor's desktop app.
 */
const ENGINE_COMPANION_FORMATS = new Set(["C++", "desktop-app"]);

/**
 * The engines an entry is native to, or [] when it is engine-agnostic.
 * Plugins and addons (godot-addon, gdextension, unreal-plugin) make an
 * entry native whatever else it lists, since the files only load in that
 * engine. Otherwise an entry is native only when every format it lists
 * belongs to an engine: [WAV, Godot] is a sound pack with a Godot demo,
 * usable anywhere, while [gdshader, Godot] is a Godot project.
 */
export function nativeEngines(entry) {
  const formats = entry.formats || [];
  const engines = Object.keys(ENGINES).filter((k) => formats.some((f) => ENGINES[k].formats.includes(f)));
  if (!engines.length) return [];
  if (formats.some((f) => ["godot-addon", "gdextension", "unreal-plugin"].includes(f))) return engines;
  const portable = formats.some((f) => !ENGINE_COMPANION_FORMATS.has(f) && !Object.values(ENGINES).some((e) => e.formats.includes(f)));
  return portable ? [] : engines;
}

/** False when the entry only works in an engine other than `engine`: by licence (engine_lock) or by format. */
export function worksInEngine(entry, engine) {
  if (!ENGINES[engine]) return true;
  if (entry.engine_lock && entry.engine_lock !== engine) return false;
  const native = nativeEngines(entry);
  return !native.length || native.includes(engine);
}

/** 0 when an entry is made for `engine` (tagged for it, native to it or locked to it), else 1. */
export function engineRank(entry, engine) {
  const e = ENGINES[engine];
  if (!e) return 0;
  if (entry.engine_lock === engine) return 0;
  if ((entry.formats || []).some((f) => e.formats.includes(f))) return 0;
  return (entry.tags || []).some((t) => e.tags.includes(t)) ? 0 : 1;
}

/** The catalog's sort orders, by `sort` value. Ties fall back to the name. */
export const SORTS = {
  name: (a, b) => a.name.localeCompare(b.name),
  license: (a, b) =>
    (a.licenseRank ?? 3) - (b.licenseRank ?? 3) ||
    a.license.localeCompare(b.license) ||
    a.name.localeCompare(b.name),
  verified: (a, b) =>
    String(b.verified || "").localeCompare(String(a.verified || "")) ||
    a.name.localeCompare(b.name),
  added: (a, b) =>
    String(b.added || "").localeCompare(String(a.added || "")) ||
    a.name.localeCompare(b.name),
};

/** The chosen sort as a comparator, with entries made for the chosen engine first. */
export function sorterFor(state) {
  const by = SORTS[state.sort] || SORTS.name;
  if (!state.engine || state.engine === "any") return by;
  return (a, b) => engineRank(a, state.engine) - engineRank(b, state.engine) || by(a, b);
}

/**
 * Grouping by category is only meaningful under the default sort with no
 * category filter: sorting by date or licence inside category buckets would
 * hide the order the reader asked for.
 */
export function shouldGroup(state) {
  return state.sort === "name" && state.category === "all";
}

/**
 * One pass over the catalog for the current state. `passes(entry)` applies
 * every filter but the category; `score(entry)` is the search score (0 is no
 * match, 1 when there is no query); `hasQuery` says a search is active.
 *
 * The pool is what passes every filter but the category, and the chip counts
 * are taken from it: counting with the category applied would make every
 * chip read 0 except the selected one. Under the default sort a search ranks
 * by score, ties by name; otherwise the chosen sort applies.
 */
export function computeResults(entries, state, { passes, score, hasQuery }) {
  const scores = new Map();
  const pool = [];
  for (const e of entries) {
    if (!passes(e)) continue;
    const s = score(e);
    if (!s) continue;
    scores.set(e.id, s);
    pool.push(e);
  }
  const counts = new Map();
  for (const e of pool) counts.set(e.category, (counts.get(e.category) || 0) + 1);
  const list = state.category === "all" ? pool.slice() : pool.filter((e) => e.category === state.category);
  const ranked = state.sort === "name" && hasQuery;
  if (ranked) {
    // Equal scores fall back to the name sort, engine picks first.
    const tie = sorterFor({ ...state, sort: "name" });
    list.sort((a, b) => scores.get(b.id) - scores.get(a.id) || tie(a, b));
  } else list.sort(sorterFor(state));
  return { list, counts, total: pool.length, ranked };
}

/**
 * When this key changes, app.js re-places every card. Under a plain sort
 * the order of all cards depends only on the grouping, the sort and the
 * engine (filters just toggle visibility); a ranked search reorders on every
 * new result list.
 */
export function placementKey(state, { ranked, group, list }) {
  if (ranked) return `rank:${group}:${list.map((e) => e.id).join(",")}`;
  return `${group ? "group" : "flat"}:${state.sort}:${state.engine || "any"}`;
}

const CHOICES = [
  ["cat", "category"],
  ["sort", "sort"],
  ["view", "perspective"],
  ["licence", "license"],
  ["format", "format"],
  ["engine", "engine"],
];
/** On/off params: URL key -> state field, written as 1 or 0. */
const SWITCHES = [
  ["active", "active"],
  ["review", "review"],
  ["deprecated", "deprecated"],
  ["commercial", "commercialOnly"],
  ["noattr", "noAttr"],
];

/**
 * State from a query string. A hand-edited or stale link can carry values the
 * page has no control for; each one falls back to its default, and the page
 * then rewrites the URL without it.
 */
/** Longest search query kept from a URL or the search box. */
export const MAX_QUERY = 200;

export function readState(search, defaults, allowed) {
  const p = new URLSearchParams(search);
  const state = { ...defaults };
  for (const [key, field] of CHOICES) {
    const v = p.get(key);
    if (v !== null && (allowed[field] || []).includes(v)) state[field] = v;
  }
  // A shared link cannot paste a novel into the search box and the chips.
  if (p.has("q")) state.q = p.get("q").slice(0, MAX_QUERY);
  for (const [key, field] of SWITCHES) {
    const v = p.get(key);
    if (v === "1" || v === "0") state[field] = v === "1";
  }
  return state;
}

/** The query string for a state: only what differs from the defaults. */
export function stateQuery(state, defaults) {
  const p = new URLSearchParams();
  const field = Object.fromEntries(CHOICES);
  if (state.category !== defaults.category) p.set("cat", state.category);
  if (state.q.trim()) p.set("q", state.q.trim());
  for (const key of ["sort", "view", "licence", "format", "engine"]) {
    if (state[field[key]] !== defaults[field[key]]) p.set(key, state[field[key]]);
  }
  for (const [key, f] of SWITCHES) {
    if (state[f] !== defaults[f]) p.set(key, state[f] ? "1" : "0");
  }
  return p.toString();
}

/* ---------------------------------------------------------------- 404 page */

/** Site sections whose pages live at <section>/<id>/. */
const SECTIONS = /^(entry|stack|category|guide)\//;

function missRest(pathname, rootPath) {
  let rest = pathname;
  try {
    rest = decodeURIComponent(rest);
  } catch {
    // A malformed escape: match on the raw path.
  }
  return rest.startsWith(rootPath) ? rest.slice(rootPath.length) : rest;
}

/** The words of a missed address, relative to the site root, as a slug. */
export function missSlug(pathname, rootPath) {
  return slugOf(missRest(pathname, rootPath).replace(SECTIONS, "").replace(/(index)?\.html?$/, ""));
}

/** The section a missed address was in: "entry", "stack", "category", "guide", or "" for anything else. */
export function missSection(pathname, rootPath) {
  return missRest(pathname, rootPath).match(SECTIONS)?.[1] || "";
}

export const slugOf = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** Letter pairs, so a dropped or swapped letter still leaves most in common. */
function pairs(text) {
  const out = new Map();
  for (let i = 0; i < text.length - 1; i++) {
    const p = text.slice(i, i + 2);
    out.set(p, (out.get(p) || 0) + 1);
  }
  return out;
}

/** Dice coefficient over letter pairs: 1 is identical, 0 shares nothing. */
export function similarity(a, b) {
  const pa = pairs(a);
  const pb = pairs(b);
  let shared = 0;
  let total = 0;
  for (const n of pa.values()) total += n;
  for (const [p, n] of pb) {
    total += n;
    shared += Math.min(n, pa.get(p) || 0);
  }
  return total ? (2 * shared) / total : 0;
}

/**
 * Up to `limit` entries closest to a slug. Deprecated entries still have
 * pages, but a live one is the better guess. A one-word slug ("kenny") is
 * also matched against each word of a name, so a misspelt publisher finds
 * "Kenney UI Pack" instead of drowning in the pack's other letters.
 */
export function closestEntries(slug, entries, { minScore = 0.4, limit = 5 } = {}) {
  const oneWord = !slug.includes("-");
  return entries
    .map((e) => {
      const nameSlug = slugOf(e.name);
      const candidates = [e.id, nameSlug];
      if (oneWord) for (const word of nameSlug.split("-")) if (word.length >= 3) candidates.push(word);
      return {
        entry: e,
        score: Math.max(...candidates.map((c) => similarity(slug, c))) - (e.status === "deprecated" ? 0.1 : 0),
      };
    })
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map((m) => m.entry);
}

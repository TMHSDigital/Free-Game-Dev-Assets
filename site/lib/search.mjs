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
 * An entry's searchable text in three fields. Name, publisher and tags are
 * what a reader means by a word, so a hit there ranks above one in the other
 * metadata, which ranks above a summary-only hit. Tags no longer repeat the
 * publisher or licence (V19, V21), so those fields are searched directly.
 */
export const FIELD_WEIGHTS = [3, 2, 1];
export function searchFields(e) {
  return [
    normalize([e.name, e.publisher || "", ...(e.tags || [])].join(" ")),
    normalize(
      [e.license, e.category, PERSPECTIVE_SEARCH[e.camera_perspective] || "", ...(e.formats || []), ...(e.subcategories || [])].join(" ")
    ),
    normalize(e.summary || ""),
  ];
}

/**
 * One test per query word. A word matches at the start of a word in the
 * text, never inside one: "ui" finds "UI kit" but not "build", "art" finds
 * "artwork" but not "earth". A plural query word also matches its singular,
 * since tags are stored one way: "buttons" finds the "button" tag.
 */
export function wordTest(word) {
  const forms = [word];
  if (word.length > 3 && word.endsWith("s")) forms.push(word.slice(0, -1));
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
  if (state.format !== "any") {
    const wanted = formatGroups[state.format]?.formats || [];
    if (!(entry.formats || []).some((f) => wanted.includes(f))) return false;
  }
  return true;
}

/** Choice params: URL key -> state field. `allowed` supplies each field's legal values. */
const CHOICES = [
  ["cat", "category"],
  ["sort", "sort"],
  ["view", "perspective"],
  ["licence", "license"],
  ["format", "format"],
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
export function readState(search, defaults, allowed) {
  const p = new URLSearchParams(search);
  const state = { ...defaults };
  for (const [key, field] of CHOICES) {
    const v = p.get(key);
    if (v !== null && (allowed[field] || []).includes(v)) state[field] = v;
  }
  if (p.has("q")) state.q = p.get("q");
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
  for (const key of ["sort", "view", "licence", "format"]) {
    if (state[field[key]] !== defaults[field[key]]) p.set(key, state[field[key]]);
  }
  for (const [key, f] of SWITCHES) {
    if (state[f] !== defaults[f]) p.set(key, state[f] ? "1" : "0");
  }
  return p.toString();
}

/* ---------------------------------------------------------------- 404 page */

/** The words of a missed address, relative to the site root, as a slug. */
export function missSlug(pathname, rootPath) {
  let rest = pathname;
  try {
    rest = decodeURIComponent(rest);
  } catch {
    // A malformed escape: match on the raw path.
  }
  if (rest.startsWith(rootPath)) rest = rest.slice(rootPath.length);
  return slugOf(rest.replace(/^(entry|stack)\//, "").replace(/(index)?\.html?$/, ""));
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

/** Up to `limit` entries closest to a slug. Deprecated entries still have pages, but a live one is the better guess. */
export function closestEntries(slug, entries, { minScore = 0.4, limit = 5 } = {}) {
  return entries
    .map((e) => ({
      entry: e,
      score: Math.max(similarity(slug, e.id), similarity(slug, slugOf(e.name))) - (e.status === "deprecated" ? 0.1 : 0),
    }))
    .filter((m) => m.score >= minScore)
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map((m) => m.entry);
}

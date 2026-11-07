/**
 * The credits audit (#187): match the lines of a pasted credits file or URL
 * list to catalog entries, so a developer can see what an existing pile of
 * assets owes. Pure and browser-safe (served as credits-audit.js).
 *
 * A line matches by URL first: the entry whose own url is the longest prefix
 * of a URL on the line. A URL on a site with catalog entries but no prefix
 * match lists that site's entries as candidates. A line with no URL matches
 * an entry whose name it contains as whole words, or else the entries of a
 * publisher it names (five characters or more, so "Kit" does not match
 * everything).
 */

/**
 * A URL reduced for comparison: host without www., path without a trailing
 * slash, no fragment. `query` is kept apart: an entry whose url carries one
 * is a filtered listing (`/assets?series=...`), which matches only itself.
 */
export function urlKey(raw) {
  let u;
  try {
    u = new URL(String(raw).trim());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  let path = u.pathname;
  try {
    path = decodeURIComponent(path);
  } catch {
    // A malformed escape is compared as written.
  }
  path = path.replace(/\/+$/, "").toLowerCase();
  return { host, path, query: u.search, key: `${host}${path}` };
}

const URL_RE = /https?:\/\/[^\s<>"'`)\]]+/g;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** An index of entries by URL key and by host, built once per audit. */
export function auditIndex(entries) {
  const byHost = new Map();
  const keyed = [];
  for (const e of entries) {
    const k = urlKey(e.url);
    if (!k) continue;
    keyed.push({ entry: e, ...k });
    if (!byHost.has(k.host)) byHost.set(k.host, []);
    byHost.get(k.host).push(e);
  }
  // Names and publishers, five characters or more, as whole words.
  const wordRe = (text) => new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRe(text.trim().toLowerCase())}(?![\\p{L}\\p{N}])`, "u");
  const named = entries.filter((e) => String(e.name || "").trim().length >= 5).map((e) => ({ entry: e, re: wordRe(e.name) }));
  const byPublisher = new Map();
  for (const e of entries) {
    const p = String(e.publisher || "").trim();
    if (p.length < 5) continue;
    if (!byPublisher.has(p)) byPublisher.set(p, []);
    byPublisher.get(p).push(e);
  }
  const publishers = [...byPublisher].map(([name, list]) => ({ entries: list, re: wordRe(name) }));
  return { keyed, byHost, named, publishers };
}

/**
 * One verdict per non-empty line: `{ line, via, entries }` where `via` is
 * "url" (a confident match), "site" (candidates on the same site), "name",
 * or "none".
 */
export function auditLines(text, index) {
  const out = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const urls = (line.match(URL_RE) || []).map((u) => u.replace(/[.,;:!?]+$/, ""));
    let verdict = null;
    for (const u of urls) {
      const k = urlKey(u);
      if (!k) continue;
      const hits = index.keyed.filter((c) =>
        c.host === k.host && (c.query ? c.path === k.path && c.query === k.query : k.path === c.path || k.path.startsWith(`${c.path}/`) || c.path === "")
      );
      if (hits.length) {
        const best = Math.max(...hits.map((h) => h.path.length));
        verdict = { line, via: "url", entries: hits.filter((h) => h.path.length === best).map((h) => h.entry) };
        break;
      }
      const site = index.byHost.get(k.host);
      if (site && !verdict) verdict = { line, via: "site", entries: site };
    }
    if (!verdict && !urls.length) {
      const lower = line.toLowerCase();
      const hits = index.named.filter((n) => n.re.test(lower)).map((n) => n.entry);
      if (hits.length) verdict = { line, via: "name", entries: hits };
      else {
        // A publisher named on the line: their entries are the candidates.
        const pubs = (index.publishers || []).filter((p) => p.re.test(lower)).flatMap((p) => p.entries);
        if (pubs.length) verdict = { line, via: "name", entries: pubs };
      }
    }
    out.push(verdict || { line, via: "none", entries: [] });
  }
  return out;
}

/** The entries an audit settled on (url and name matches, each once), for owes() and CREDITS.md. */
export function auditedEntries(verdicts) {
  const seen = new Map();
  for (const v of verdicts) {
    if ((v.via === "url" || v.via === "name") && v.entries.length === 1) seen.set(v.entries[0].id, v.entries[0]);
  }
  return [...seen.values()];
}

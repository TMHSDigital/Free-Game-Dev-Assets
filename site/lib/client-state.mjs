/**
 * Pure helpers the browser scripts share, kept here so the tests can reach
 * them (#263): the stored shortlist, HTML escaping for pages that do not
 * load shared.mjs, and the entry page's "back to results" link. Served as
 * client-state.js.
 */

/**
 * The shortlist ids stored as JSON. Anything but an array of strings reads
 * as empty or loses its bad items. With `byId` (the catalog), ids no longer
 * in it drop out; `byId` must have no prototype, so "constructor" is not an
 * entry.
 */
export function parseShortlist(raw, byId = null) {
  let ids;
  try {
    ids = JSON.parse(raw || "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(ids)) return [];
  ids = ids.filter((id) => typeof id === "string");
  return byId ? ids.filter((id) => byId[id]) : ids;
}

/** The same five replacements as esc() in shared.mjs (a test keeps them equal). */
export function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Where an entry page's "Catalog" link goes: back to the search the
 * homepage stored (`qs`, a query string), or null to keep the built link.
 * Only URL-encoded key=value pairs are accepted.
 */
export function backLinkHref(qs) {
  if (!qs || !/^[\w.~%+=&-]+$/.test(qs)) return null;
  return `../../?${qs}#catalog`;
}

/** An OPML bundle of the change feeds of `entries`, for a feed reader to import in one step. */
export function changesOpml(entries, siteUrl, title = "Free Game Dev Assets: licence changes") {
  const base = String(siteUrl).replace(/\/+$/, "");
  const esx = (s) => escapeHtml(s);
  return `<?xml version="1.0" encoding="utf-8"?>
<opml version="2.0">
  <head><title>${esx(title)}</title></head>
  <body>
${entries.map((e) => `    <outline type="rss" text="${esx(e.name)}" title="${esx(e.name)}" xmlUrl="${esx(`${base}/entry/${e.id}/changes.xml`)}" htmlUrl="${esx(`${base}/entry/${e.id}/`)}" />`).join("\n")}
  </body>
</opml>
`;
}

/**
 * Licence changes per entry, from git history (#186): when an entry's
 * `license`, `commercial`, `attribution_required` or `status` changed, and
 * from what to what. The build publishes them as one Atom feed per entry
 * (entry/<id>/changes.xml), and the shortlist bundles its entries' feeds
 * as OPML, so a reader can follow the terms of the assets their game uses.
 * Pure; build.mjs runs git.
 */
import { esc } from "./shared.mjs";

export const WATCHED_FIELDS = ["license", "commercial", "attribution_required", "status"];
const FIELD_RE = new RegExp(`^([+-])(${WATCHED_FIELDS.join("|")}):\\s*(.*?)\\s*$`);

/**
 * Entry id => [{ date, commit, field, from, to }], oldest first, from
 * `git log --reverse -p -M --unified=0 --format=%x00%H %cs -- catalog`.
 * Entries are keyed by file name, so a category move keeps its history. A
 * file's first commit is its creation, not a change, and is skipped.
 */
export function changeEventsFromLog(log) {
  const events = new Map();
  const seen = new Set();
  let commit = null;
  let date = null;
  let id = null;
  let isNew = false;
  let removed = {};
  const flush = () => {
    removed = {};
  };
  for (const line of String(log).split("\n")) {
    if (line.startsWith("\0")) {
      [commit, date] = line.slice(1).trim().split(" ");
      id = null;
      flush();
      continue;
    }
    if (line.startsWith("diff --git ")) {
      const m = line.match(/ b\/catalog\/[^/]+\/([^/]+)\.md$/);
      id = m && m[1] !== "README" && m[1] !== "TEMPLATE" ? m[1] : null;
      isNew = Boolean(id) && !seen.has(id);
      if (id) seen.add(id);
      flush();
      continue;
    }
    if (!id || isNew) continue;
    const m = line.match(FIELD_RE);
    if (!m) continue;
    const [, sign, field, value] = m;
    if (sign === "-") removed[field] = value;
    else if (field in removed && removed[field] !== value) {
      if (!events.has(id)) events.set(id, []);
      events.get(id).push({ date, commit, field, from: removed[field], to: value });
      delete removed[field];
    }
  }
  return events;
}

const LABEL = { license: "Licence", commercial: "Commercial use", attribution_required: "Credit required", status: "Status" };

/** One entry's changes.xml: newest change first; an entry with none is a valid, empty feed. */
export function changesFeedXml({ entry, events = [], siteUrl, generatedAt }) {
  const base = String(siteUrl).replace(/\/+$/, "");
  const page = `${base}/entry/${entry.id}/`;
  const feedUrl = `${page}changes.xml`;
  const items = [...events].reverse().map((e) => {
    const title = `${entry.name}: ${LABEL[e.field] || e.field} ${e.from} → ${e.to}`;
    return `  <entry>
    <id>${esc(`${feedUrl}#${e.commit}-${e.field}`)}</id>
    <title>${esc(title)}</title>
    <updated>${esc(e.date)}T00:00:00Z</updated>
    <link href="${esc(page)}" />
    <summary>${esc(`${title}, recorded ${e.date}. The entry page quotes the source.`)}</summary>
  </entry>`;
  });
  const updated = events.length ? `${events[events.length - 1].date}T00:00:00Z` : generatedAt;
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${esc(feedUrl)}</id>
  <title>${esc(`${entry.name}: licence changes`)}</title>
  <subtitle>Changes to the licence, commercial use, credit requirement or status recorded for this source.</subtitle>
  <updated>${esc(updated)}</updated>
  <link rel="self" href="${esc(feedUrl)}" />
  <link href="${esc(page)}" />
${items.join("\n")}
</feed>
`;
}

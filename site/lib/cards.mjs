/**
 * The one entry template: the homepage, the category and stack pages and
 * app.js all render an entry through entryCardHtml, so the prerender and the
 * hydrated page can never drift apart. Cards and List are the same markup
 * under a `data-view` attribute; CSS does the rest.
 *
 * Browser-safe: this file and shared.mjs are copied into dist as modules, so
 * neither may import anything from node:.
 */
import { commercialLabel, edgeVar, ENGINE_LOCK_LABELS, ENGINE_LOCK_NOTES, esc, MAINTENANCE_NOTES, PERSPECTIVE_LABELS, verifiedAge } from "./shared.mjs";

export { commercialLabel, edgeVar, ENGINE_LOCK_LABELS, ENGINE_LOCK_NOTES, MAINTENANCE_NOTES, PERSPECTIVE_LABELS, verifiedAge };
export const escapeHtml = esc;

/** How many entries a category shows on the homepage before "Show all". */
export const CARD_LIMIT = 6;
export const LIST_LIMIT = 8;

/** The typographic tile for an entry with no permitted image: name and a short note on an editor-style checker. */
export function tileHtml(entry, label = entry.category) {
  return (
    `<div class="entry-tile" data-cat="${esc(entry.category)}" aria-hidden="true">` +
    `<span class="entry-tile-name">${esc(entry.name)}</span>` +
    `<span class="entry-tile-note">${esc(label)} · ${esc(entry.license)}</span>` +
    `</div>`
  );
}

/** The entry's thumbnail image, or its tile. `root` is the page's path to the site root. */
export function thumbHtml(entry, root = "", label) {
  const t = entry.thumb;
  if (t && t.path) {
    return `<img class="entry-thumb-img" src="${esc(root)}${esc(t.path)}" width="${Number(t.width) || 640}" height="${Number(t.height) || 400}" alt="" loading="lazy" decoding="async">`;
  }
  return tileHtml(entry, label);
}

function maintenanceFlagHtml(entry) {
  if (!entry.maintenance) return "";
  return ` <span class="maintenance-flag" title="${esc(MAINTENANCE_NOTES[entry.maintenance] || "")}">${esc(entry.maintenance)}</span>`;
}

function engineLockFlagHtml(entry) {
  if (!entry.engine_lock) return "";
  return ` <span class="engine-flag" title="${esc(ENGINE_LOCK_NOTES[entry.engine_lock] || "")}">${esc(ENGINE_LOCK_LABELS[entry.engine_lock] || entry.engine_lock)}</span>`;
}

/**
 * One entry. The card is an <article> with a real heading link (a permalink
 * that keeps heading navigation working), never a <button>. `lead` goes above
 * the heading and `trail` after the meta line: the stack pages use them for
 * the need and the reason behind a pick.
 */
export function entryCardHtml(entry, { root = "", repo, now, view = "list", lead = "", trail = "", label } = {}) {
  const age = verifiedAge(entry.verified, now);
  const ageText = age.days === null ? "verified date unknown" : `verified ${entry.verified} (${age.days}d ago)`;
  const flags = [entry.status, commercialLabel(entry.commercial), entry.license].map(esc).join(" &middot; ");
  const formats = (entry.formats || [])
    .slice(0, 3)
    .map((f) => `<span>${esc(f)}</span>`)
    .join("");
  const taxonomy = [
    entry.grid_dimensions ? `<span class="tax">${esc(entry.grid_dimensions)}</span>` : "",
    entry.camera_perspective ? `<span class="tax">${esc(PERSPECTIVE_LABELS[entry.camera_perspective] || entry.camera_perspective)}</span>` : "",
  ].join("");
  return `<article class="entry-card" data-view="${esc(view)}" id="entry-${esc(entry.id)}" data-id="${esc(entry.id)}" data-cat="${esc(entry.category)}" data-status="${esc(entry.status)}" style="--edge:${edgeVar(entry)}">
  <div class="entry-thumb">${thumbHtml(entry, root, label)}</div>
  <div class="entry-body">
    ${lead}<div class="entry-top">
      <h4><a class="entry-link" href="${esc(root)}entry/${esc(entry.id)}/" data-id="${esc(entry.id)}">${esc(entry.name)}</a></h4>
      <span class="entry-flags">${flags}${maintenanceFlagHtml(entry)}${engineLockFlagHtml(entry)}</span>
    </div>
    <p>${esc(entry.summary || "")}</p>
    <div class="meta-line">
      <span>${esc(entry.category)}</span>${formats}${taxonomy}
      <span class="verified is-${age.bucket}" title="Licence last checked at the source">${esc(ageText)}</span>
    </div>
    ${trail}<div class="entry-links">
      <a href="${esc(entry.url)}" rel="noopener noreferrer">Open source</a>
      <a href="${esc(`${repo}/blob/main/${entry.path}`)}" rel="noopener noreferrer">Entry and evidence</a>
      <button type="button" class="link-button shortlist-toggle" data-shortlist="${esc(entry.id)}" aria-pressed="false" data-name="${esc(entry.name)}" aria-label="Add to shortlist: ${esc(entry.name)}" hidden>Add to shortlist</button>
    </div>
  </div>
</article>`;
}

/** A category heading. The count reads as ", 77 entries" to assistive tech instead of running into the label. */
export function groupHeadingHtml({ cat, label, count, view = "list", root = "" }) {
  return (
    `<h3 class="group-heading" id="group-${esc(cat)}" data-cat="${esc(cat)}" data-view="${esc(view)}">` +
    `<span class="group-name">${esc(label)}</span>` +
    `<span class="group-count"><span class="sr-only">, </span><span class="group-n">${Number(count) || 0}</span><span class="sr-only"> entries</span></span>` +
    `<span class="group-tools"></span>` +
    `</h3>`
  );
}

/** The "Show all" link under a category's homepage preview; it leads to the static category page. */
export function groupMoreHtml({ cat, label, count, root = "" }) {
  return `<a class="group-more" data-cat="${esc(cat)}" href="${esc(root)}category/${esc(cat)}/">Show all ${Number(count) || 0} in ${esc(label)}</a>`;
}

/**
 * Entries grouped under category headings in config order. With `limit`
 * (the homepage) each category shows its first CARD_LIMIT or LIST_LIMIT
 * entries and a "Show all" link; without it (category pages) everything.
 */
export function groupedEntriesHtml(entries, categories, { root = "", repo, now, limit = true } = {}) {
  const out = [];
  for (const [cat, meta] of Object.entries(categories)) {
    const group = entries.filter((e) => e.category === cat);
    if (!group.length) continue;
    const view = meta.view === "cards" ? "cards" : "list";
    const label = meta.label || cat;
    const max = view === "cards" ? CARD_LIMIT : LIST_LIMIT;
    const shown = limit ? group.slice(0, max) : group;
    out.push(groupHeadingHtml({ cat, label, count: group.length, view, root }));
    out.push(...shown.map((e) => entryCardHtml(e, { root, repo, now, view, label })));
    if (limit && group.length > max) out.push(groupMoreHtml({ cat, label, count: group.length, root }));
  }
  return out.join("\n");
}

/**
 * The hero filmstrip: a row of square thumbnails linking to their entries,
 * so the first screen already shows what the catalog holds. The first three
 * load eagerly (they are above the fold); the rest lazily.
 */
export function filmstripHtml(entries, { root = "" } = {}) {
  if (!entries.length) return "";
  const items = entries
    .map((e, i) => {
      const t = e.thumb;
      return (
        `<li><a href="${esc(root)}entry/${esc(e.id)}/">` +
        `<img src="${esc(root)}${esc(t.path)}" width="${Number(t.width) || 640}" height="${Number(t.height) || 400}" alt="${esc(e.name)}" loading="${i < 3 ? "eager" : "lazy"}" decoding="async">` +
        `</a></li>`
      );
    })
    .join("");
  return `<ul class="filmstrip" aria-label="A few of the assets inside">${items}</ul>`;
}

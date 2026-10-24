/**
 * The reader's shortlist: entries starred on the catalog or on entry pages,
 * kept in this browser only, and exported as one CREDITS file built by the
 * same code as the stack pages' "What this stack owes" (owes.js).
 */
import { creditsFile, owes } from "./owes.js";

const KEY = "fgda:shortlist";

function load() {
  try {
    const ids = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(ids) ? ids.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function save(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    return true;
  } catch {
    // Storage can be off (private mode, blocked site data); the list then
    // lasts only as long as this page.
    return false;
  }
}

let ids = load();
const data = window.__CATALOG__;
// No prototype: a stored id like "constructor" must not look like an entry.
const byId = Object.assign(Object.create(null), data ? Object.fromEntries(data.entries.map((e) => [e.id, e])) : {});
// Entries removed from the catalog since they were starred drop out.
if (data) ids = ids.filter((id) => byId[id]);

function syncButtons() {
  for (const btn of document.querySelectorAll("[data-shortlist]")) {
    const on = ids.includes(btn.getAttribute("data-shortlist"));
    btn.hidden = false;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "On shortlist" : "Add to shortlist";
    // The accessible name starts with the visible text (WCAG 2.5.3).
    const name = btn.getAttribute("data-name");
    if (name) btn.setAttribute("aria-label", `${btn.textContent}: ${name}`);
  }
}

/** Polite announcements for shortlist changes, which happen away from the panel. */
let liveRegion = null;
function announce(message) {
  if (!liveRegion) {
    liveRegion = document.createElement("p");
    liveRegion.className = "sr-only";
    liveRegion.setAttribute("aria-live", "polite");
    document.body.append(liveRegion);
  }
  // Clear first so the same message twice is read twice.
  liveRegion.textContent = "";
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

/**
 * Where focus goes when the control that had it disappears (the panel hides
 * when the list empties): the search box, the result count, or the page heading.
 */
function focusFallback() {
  const target = document.getElementById("search") || document.getElementById("result-count") || document.querySelector("main h1");
  if (!target) return;
  if (!target.matches("input, button, a, [tabindex]")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: false });
}

function nameOf(id) {
  return byId[id]?.name || document.querySelector(`[data-shortlist="${CSS.escape(id)}"]`)?.getAttribute("data-name") || document.querySelector("main h1")?.textContent.trim() || id;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportFile(format) {
  const owed = owes(ids.map((id) => ({ need: "shortlist", entry: byId[id] })));
  const siteUrl = (data.site?.siteUrl || "").replace(/\/+$/, "");
  const text = creditsFile(owed, {
    format,
    pageUrl: (e) => (siteUrl ? `${siteUrl}/entry/${encodeURIComponent(e.id)}/` : ""),
    date: new Date().toISOString().slice(0, 10),
    source: data.site?.title || "Free Game Dev Assets",
  });
  download(format === "md" ? "CREDITS.md" : "CREDITS.txt", text, format === "md" ? "text/markdown" : "text/plain");
}

/** The panel on the catalog page. Entry pages have only the toggle. */
function renderPanel() {
  const panel = document.getElementById("shortlist");
  if (!panel || !data) return;
  panel.hidden = ids.length === 0;
  document.getElementById("shortlist-count").textContent = String(ids.length);
  document.getElementById("shortlist-items").innerHTML = ids
    .map((id) => {
      const e = byId[id];
      return `<li><a href="entry/${encodeURIComponent(id)}/">${escapeHtml(e.name)}</a> <span class="shortlist-licence">${escapeHtml(e.license)}</span>
        <button type="button" class="link-button" data-shortlist-remove="${escapeHtml(id)}">Remove<span class="sr-only"> ${escapeHtml(e.name)}</span></button></li>`;
    })
    .join("");
}

function update(next) {
  ids = next;
  const kept = save(ids);
  const note = document.getElementById("shortlist-storage");
  if (note) note.hidden = kept;
  syncButtons();
  renderPanel();
}

document.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-shortlist]");
  if (toggle) {
    // A toggle sits inside a card whose title link covers the card.
    e.preventDefault();
    const id = toggle.getAttribute("data-shortlist");
    const adding = !ids.includes(id);
    update(adding ? [...ids, id] : ids.filter((x) => x !== id));
    announce(`${adding ? "Added" : "Removed"} ${nameOf(id)} ${adding ? "to" : "from"} the shortlist (${ids.length})`);
    return;
  }
  const remove = e.target.closest("[data-shortlist-remove]");
  if (remove) {
    const id = remove.getAttribute("data-shortlist-remove");
    update(ids.filter((x) => x !== id));
    announce(`Removed ${nameOf(id)} from the shortlist (${ids.length})`);
    const panel = document.getElementById("shortlist");
    if (panel && !panel.hidden) document.getElementById("shortlist-count")?.closest("section")?.focus();
    else focusFallback();
    return;
  }
  const action = e.target.closest("[data-shortlist-action]");
  if (!action) return;
  const what = action.getAttribute("data-shortlist-action");
  if (what === "md" || what === "txt") exportFile(what);
  if (what === "clear") {
    update([]);
    announce("Shortlist cleared");
    focusFallback();
  }
});

// Another tab changed the list.
window.addEventListener("storage", (e) => {
  if (e.key !== KEY) return;
  ids = load().filter((id) => !data || byId[id]);
  syncButtons();
  renderPanel();
});

syncButtons();
renderPanel();

// app.js renders the non-previewed cards lazily; their buttons get wired here.
document.addEventListener("fgda:cards-rendered", syncButtons);

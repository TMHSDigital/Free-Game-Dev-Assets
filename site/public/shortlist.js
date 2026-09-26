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
const byId = data ? Object.fromEntries(data.entries.map((e) => [e.id, e])) : {};
// Entries removed from the catalog since they were starred drop out.
if (data) ids = ids.filter((id) => byId[id]);

function syncButtons() {
  for (const btn of document.querySelectorAll("[data-shortlist]")) {
    const on = ids.includes(btn.getAttribute("data-shortlist"));
    btn.hidden = false;
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? "On shortlist" : "Add to shortlist";
  }
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
  const siteUrl = data.site?.siteUrl || "";
  const text = creditsFile(owed, {
    format,
    pageUrl: (e) => (siteUrl ? `${siteUrl}entry/${encodeURIComponent(e.id)}/` : ""),
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
    update(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    return;
  }
  const remove = e.target.closest("[data-shortlist-remove]");
  if (remove) {
    const id = remove.getAttribute("data-shortlist-remove");
    update(ids.filter((x) => x !== id));
    document.getElementById("shortlist-count")?.closest("section")?.focus();
    return;
  }
  const action = e.target.closest("[data-shortlist-action]");
  if (!action) return;
  const what = action.getAttribute("data-shortlist-action");
  if (what === "md" || what === "txt") exportFile(what);
  if (what === "clear") update([]);
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

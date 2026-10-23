/**
 * Cards / List toggle on category headings. The same markup serves both
 * views (site/lib/cards.mjs); the toggle flips `data-view` on the heading
 * and on every card of that category. The choice is remembered per kind of
 * category: all card-default categories move together, all list-default
 * ones move together. Pages work without this script; it only adds the
 * control.
 */

const KEY = (defaultView) => `fgda:view:${defaultView}-default`;

export function readStoredView(defaultView) {
  try {
    const v = localStorage.getItem(KEY(defaultView));
    return v === "cards" || v === "list" ? v : null;
  } catch {
    return null;
  }
}

export function storeView(defaultView, view) {
  try {
    if (view === defaultView) localStorage.removeItem(KEY(defaultView));
    else localStorage.setItem(KEY(defaultView), view);
  } catch {
    // Storage can be unavailable; the view still changes for this visit.
  }
}

/** Sets a category's view on its heading and its cards. */
export function applyView(root, cat, view) {
  for (const el of root.querySelectorAll(`.group-heading[data-cat="${CSS.escape(cat)}"], .entry-card[data-cat="${CSS.escape(cat)}"]`)) {
    el.setAttribute("data-view", view);
  }
  const heading = root.querySelector(`.group-heading[data-cat="${CSS.escape(cat)}"]`);
  if (!heading) return;
  for (const btn of heading.querySelectorAll(".view-toggle button")) {
    btn.setAttribute("aria-pressed", btn.getAttribute("data-view") === view ? "true" : "false");
  }
}

function toggleHtml() {
  return (
    '<div class="view-toggle" role="group" aria-label="View">' +
    '<button type="button" data-view="cards" aria-pressed="false">Cards</button>' +
    '<button type="button" data-view="list" aria-pressed="false">List</button>' +
    "</div>"
  );
}

/**
 * Adds a toggle to every category heading under `root` and applies any
 * stored choice. `defaults` maps category id to its config view; a heading
 * whose category is not listed keeps the view it was rendered with.
 */
export function installViewToggles(root, defaults, { onChange } = {}) {
  for (const heading of root.querySelectorAll(".group-heading")) {
    const cat = heading.getAttribute("data-cat");
    const defaultView = defaults[cat] || heading.getAttribute("data-view") || "list";
    const tools = heading.querySelector(".group-tools");
    if (tools && !tools.querySelector(".view-toggle")) tools.innerHTML = toggleHtml();
    applyView(root, cat, readStoredView(defaultView) || defaultView);
    heading.addEventListener("click", (e) => {
      const btn = e.target.closest(".view-toggle button");
      if (!btn) return;
      const view = btn.getAttribute("data-view");
      storeView(defaultView, view);
      // Every category with the same default follows, so the page stays consistent.
      for (const h of root.querySelectorAll(".group-heading")) {
        const c = h.getAttribute("data-cat");
        if ((defaults[c] || h.getAttribute("data-view")) === defaultView || c === cat) applyView(root, c, view);
      }
      if (onChange) onChange({ cat, view });
    });
  }
}

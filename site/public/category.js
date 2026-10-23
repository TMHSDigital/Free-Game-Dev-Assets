/** A category page: the Cards / List toggle, nothing else. The list is complete without it. */
import { installViewToggles } from "./views.js";

(() => {
  const grid = document.getElementById("entry-grid");
  if (!grid) return;
  const defaults = {};
  for (const h of grid.querySelectorAll(".group-heading")) defaults[h.getAttribute("data-cat")] = h.getAttribute("data-view") || "list";
  installViewToggles(grid, defaults);
})();

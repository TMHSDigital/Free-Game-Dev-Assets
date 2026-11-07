/**
 * Theme choice (#111): system, light or dark, kept in this browser. Loaded
 * as a plain blocking script in <head> so the colours are right before the
 * first paint; the Content-Security-Policy allows no inline script, so this
 * file is it. The header button cycles the three choices. It also registers
 * the offline service worker (sw.js). Pages work without it.
 */
(() => {
  // This script's own URL: sw.js sits beside it at the site root.
  const here = document.currentScript ? document.currentScript.src : document.baseURI;
  const KEY = "fgda:theme";
  const CHOICES = ["system", "light", "dark"];
  const read = () => {
    try {
      const v = localStorage.getItem(KEY);
      return CHOICES.includes(v) ? v : "system";
    } catch {
      return "system";
    }
  };
  const apply = (choice) => {
    if (choice === "system") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", choice);
  };
  apply(read());

  document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      const label = (c) => `Theme: ${c}`;
      btn.hidden = false;
      btn.textContent = label(read());
      btn.addEventListener("click", () => {
        const next = CHOICES[(CHOICES.indexOf(read()) + 1) % CHOICES.length];
        try {
          if (next === "system") localStorage.removeItem(KEY);
          else localStorage.setItem(KEY, next);
        } catch {
          // Storage off: the choice lasts for this page only.
        }
        apply(next);
        btn.textContent = label(next);
      });
    }
    // Offline copy of the catalog.
    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register(new URL("sw.js", here)).catch(() => {});
    }
  });
})();

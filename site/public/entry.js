/** Entry page helpers. The page works without them. */
import { backLinkHref } from "./client-state.js";

// "Catalog" in the breadcrumb returns to the search and filters the reader
// left, which the homepage keeps in sessionStorage. Without them it goes to
// the plain catalog, as built.
(() => {
  const link = document.querySelector("[data-back-to-results]");
  if (!link) return;
  let qs = null;
  try {
    qs = sessionStorage.getItem("fgda:results");
  } catch {
    return;
  }
  // Only a query string the homepage wrote: URL-encoded key=value pairs.
  const href = backLinkHref(qs);
  if (href) link.setAttribute("href", href);
})();

/** Copy button for an entry page's credit line. */
(() => {
  const btn = document.getElementById("copy-attribution");
  if (!btn) return;
  btn.hidden = false;
  btn.addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText(btn.getAttribute("data-copy"));
      // A templated line says what to fill in (data-fill, owes.mjs fillInNote).
      status.textContent = btn.dataset.fill ? `Copied. ${btn.dataset.fill}` : "Copied";
    } catch {
      // Clipboard access can be refused; select the text so it can be
      // copied by hand rather than failing silently.
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("attribution-string"));
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      status.textContent = "Select and copy";
    }
  });
})();

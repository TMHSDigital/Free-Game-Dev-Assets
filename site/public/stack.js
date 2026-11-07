/** Copy buttons and "Add all to shortlist" on a stack page. The page works without them. */
(() => {
  for (const btn of document.querySelectorAll("button[data-copy]")) {
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      const status = btn.parentElement.querySelector(".copy-status");
      try {
        await navigator.clipboard.writeText(btn.getAttribute("data-copy"));
        // A templated line says what to fill in (data-fill, owes.mjs fillInNote).
        status.textContent = btn.dataset.fill ? `Copied. ${btn.dataset.fill}` : "Copied";
      } catch {
        // Clipboard access can be refused; select the text so it can be
        // copied by hand rather than failing silently.
        // Copy all's target is a hidden block of just the credit lines.
        const target = document.getElementById(btn.getAttribute("data-target"));
        target.hidden = false;
        const range = document.createRange();
        range.selectNodeContents(target);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        status.textContent = "Select and copy";
      }
    });
  }

  // Every pick into the shortlist (#272), under shortlist.js's storage key;
  // the catalog and other open tabs pick the change up from storage.
  const KEY = "fgda:shortlist";
  for (const btn of document.querySelectorAll("button[data-shortlist-all]")) {
    btn.hidden = false;
    btn.addEventListener("click", () => {
      const status = btn.parentElement.querySelector(".copy-status");
      const picks = btn.getAttribute("data-shortlist-all").split(",").filter(Boolean);
      try {
        let ids = JSON.parse(localStorage.getItem(KEY) || "[]");
        if (!Array.isArray(ids)) ids = [];
        ids = ids.filter((id) => typeof id === "string");
        const added = picks.filter((id) => !ids.includes(id));
        localStorage.setItem(KEY, JSON.stringify([...ids, ...added]));
        status.textContent = added.length
          ? `Added ${added.length} of ${picks.length} to your shortlist (${ids.length + added.length} in all).`
          : `All ${picks.length} are already on your shortlist.`;
      } catch {
        status.textContent = "This browser is not keeping site data, so the shortlist cannot be saved.";
      }
    });
  }
})();

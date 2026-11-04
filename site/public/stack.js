/** Copy buttons on a stack page. The page works without them. */
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
})();

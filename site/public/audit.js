/**
 * The credits audit page (#187): matches pasted lines to the catalog
 * (credits-audit.js), shows a verdict per line and what the matched sources
 * owe (owes.js), and offers the result as CREDITS.md. Everything stays in
 * the browser.
 */
import { auditIndex, auditLines, auditedEntries } from "./credits-audit.js";
import { creditsFile, owes, owesGroups } from "./owes.js";
import { escapeHtml } from "./client-state.js";

const run = () => {
  const data = window.__CATALOG__;
  const form = document.getElementById("audit-form");
  if (!data || !form) return;
  const index = auditIndex(data.entries);
  const siteUrl = String(data.site?.siteUrl || "").replace(/\/+$/, "");
  let matched = [];

  const entryLink = (e) => `<a href="../entry/${encodeURIComponent(e.id)}/">${escapeHtml(e.name)}</a>`;
  const facts = (e) => {
    const bits = [escapeHtml(e.license)];
    if (e.attribution_required === true) bits.push(e.attribution_string ? `credit: <code>${escapeHtml(e.attribution_string)}</code>` : "credit required: see the entry");
    else if (e.attribution_required === false) bits.push("no credit line");
    if (e.commercial === false) bits.push("<strong>not for commercial use</strong>");
    if (e.commercial === "varies") bits.push("check each file");
    if (e.engine_lock) bits.push(`<strong>locked to ${escapeHtml(e.engine_lock)}</strong>`);
    if (e.status !== "active") bits.push(`<strong>${escapeHtml(e.status)}</strong>${e.review ? `: ${escapeHtml(e.review)}` : ""}`);
    bits.push(`licence read ${escapeHtml(e.verified || "never")}`);
    return bits.join(" · ");
  };
  const verdictHtml = (v) => {
    const line = `<code>${escapeHtml(v.line.length > 140 ? `${v.line.slice(0, 140)}…` : v.line)}</code>`;
    if (v.via === "none") return `<li class="audit-none">${line}<br />Not in the catalog: check this one by hand.</li>`;
    if (v.via === "site" || v.entries.length > 1) {
      const n = v.entries.length;
      const lead = v.via !== "site" ? "More than one source matches:" : n === 1 ? "The catalog has one source on this site; is it this one?" : `The catalog has ${n} sources on this site; which one?`;
      return `<li class="audit-maybe">${line}<br />${lead} ${v.entries.slice(0, 8).map(entryLink).join(", ")}${n > 8 ? ", …" : ""}</li>`;
    }
    const e = v.entries[0];
    return `<li class="audit-match">${line}<br />${entryLink(e)}${v.via === "name" ? " (matched by name)" : ""}: ${facts(e)}</li>`;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const verdicts = auditLines(document.getElementById("audit-input").value, index);
    matched = auditedEntries(verdicts);
    document.getElementById("audit-lines").innerHTML = verdicts.map(verdictHtml).join("");
    document.getElementById("audit-owes").innerHTML = matched.length
      ? owesGroups(owes(matched.map((entry) => ({ need: "your game", entry }))))
          .map((g) => `<p><strong>${escapeHtml(g.heading)} (${g.entries.length}):</strong> ${g.entries.map(entryLink).join(", ")}</p>`)
          .join("")
      : "<p>No line matched one source for certain.</p>";
    document.getElementById("audit-download").hidden = !matched.length;
    const results = document.getElementById("audit-results");
    results.hidden = false;
    results.querySelector("h2").focus?.();
  });

  document.getElementById("audit-download").addEventListener("click", () => {
    const text = creditsFile(owes(matched.map((entry) => ({ need: "your game", entry }))), {
      format: "md",
      pageUrl: (e) => (siteUrl ? `${siteUrl}/entry/${encodeURIComponent(e.id)}/` : ""),
      date: new Date().toISOString().slice(0, 10),
      source: data.site?.title || "Free Game Dev Assets",
      madeFrom: "a credits audit",
    });
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "CREDITS.md";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
};

// data.js is deferred, so it has run by DOMContentLoaded; a module runs after it either way.
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
else run();

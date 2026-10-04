/**
 * The 404 page reads the words in the address that missed (a mistyped
 * /entry/kenny-ui/, say), suggests the closest entries and offers a catalog
 * search for the same words. The page works without it.
 */
import { closestEntries, missSlug } from "./search.js";

(() => {
  const data = window.__CATALOG__;
  const host = document.getElementById("suggestions");
  if (!data || !host) return;

  // Scripts load from the site root, so this module's own address gives
  // the root however deep the missing path was.
  const root = new URL("./", import.meta.url);
  const slug = missSlug(location.pathname, root.pathname);
  if (!slug) return;

  const matches = closestEntries(slug, data.entries);
  const words = slug.split("-").join(" ");
  if (matches.length) {
    const heading = document.createElement("h2");
    heading.textContent = "Did you mean";
    const list = document.createElement("ul");
    list.className = "stack-list";
    for (const entry of matches) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = new URL(`entry/${encodeURIComponent(entry.id)}/`, root).href;
      a.textContent = entry.name;
      const note = document.createElement("span");
      note.textContent = `${entry.license} · ${entry.category}${entry.status === "deprecated" ? " · deprecated" : ""}`;
      a.append(note);
      li.append(a);
      list.append(li);
    }
    host.append(heading, list);
  }
  const search = document.createElement("p");
  const link = document.createElement("a");
  link.href = new URL(`?q=${encodeURIComponent(words)}#catalog`, root).href;
  link.textContent = `Search the catalog for "${words}"`;
  search.append(link);
  host.append(search);
})();

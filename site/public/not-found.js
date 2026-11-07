/**
 * The 404 page reads the words in the address that missed (a mistyped
 * /entry/kenny-ui/, say), suggests the closest entries and offers a catalog
 * search for the same words. A miss under /category/, /guide/ or /stack/
 * suggests the closest category, guide or stack instead. The page works without it.
 */
import { closestEntries, missSection, missSlug } from "./search.js";

(() => {
  const data = window.__CATALOG__;
  const host = document.getElementById("suggestions");
  if (!data || !host) return;

  // Scripts load from the site root, so this module's own address gives
  // the root however deep the missing path was.
  const root = new URL("./", import.meta.url);
  const slug = missSlug(location.pathname, root.pathname);
  if (!slug) return;
  const section = missSection(location.pathname, root.pathname);

  // Pages to match against: entries by default, or the category, guide or stack list.
  let pages;
  if (section === "category") {
    pages = Object.entries(data.categories || {}).map(([id, c]) => ({ id, name: c.label || id, note: c.blurb || "", href: `category/${id}/` }));
  } else if (section === "guide") {
    pages = (data.guides || []).map((g) => ({ id: g.id, name: g.title || g.id, note: "", href: `guide/${g.id}/` }));
  } else if (section === "stack") {
    pages = (data.stacks || []).map((s) => ({ id: s.id, name: s.title || s.id, note: "", href: `stack/${s.id}/` }));
  } else {
    pages = data.entries.map((e) => ({
      id: e.id,
      name: e.name,
      status: e.status,
      note: `${e.license} · ${e.category}${e.status === "deprecated" ? " · deprecated" : ""}`,
      href: `entry/${encodeURIComponent(e.id)}/`,
    }));
  }

  const matches = closestEntries(slug, pages);
  const words = slug.split("-").join(" ");
  if (matches.length) {
    const heading = document.createElement("h2");
    heading.textContent = "Did you mean";
    const list = document.createElement("ul");
    list.className = "stack-list";
    for (const page of matches) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = new URL(page.href, root).href;
      a.textContent = page.name;
      if (page.note) {
        const note = document.createElement("span");
        note.textContent = page.note;
        a.append(note);
      }
      li.append(a);
      list.append(li);
    }
    host.append(heading, list);
  }
  // A catalog search only helps for entry-like words, not a mistyped category, guide or stack name.
  const lists = { category: ["#catalog", "Browse every category"], guide: ["#guides", "See all guides"], stack: ["#stacks", "See all stacks"] };
  if (lists[section]) {
    if (matches.length) return;
    const back = document.createElement("p");
    const link = document.createElement("a");
    link.href = new URL(lists[section][0], root).href;
    link.textContent = lists[section][1];
    back.append(link);
    host.append(back);
    return;
  }
  const search = document.createElement("p");
  const link = document.createElement("a");
  link.href = new URL(`?q=${encodeURIComponent(words)}#catalog`, root).href;
  link.textContent = `Search the catalog for "${words}"`;
  search.append(link);
  host.append(search);
})();

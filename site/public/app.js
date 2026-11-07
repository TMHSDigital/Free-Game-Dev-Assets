import { activeFilterChips, FILTER_DEFAULTS, FILTERS, gapIssueUrl, closestEntries, computeResults as computeResultsFor, passesFilters as passes, placementKey, queryTests as compileQuery, readState, scoreFields, searchFields, shouldGroup as shouldGroupFor, slugOf, sorterFor, SORTS, stateQuery, ENGINES } from "./search.js";
import { CARD_LIMIT, LIST_LIMIT, entryCardHtml, escapeHtml, groupHeadingHtml, groupMoreHtml, PERSPECTIVE_LABELS } from "./cards.mjs";
import { installViewToggles } from "./views.js";
import { catalogCsv } from "./exports.js";
import { isListed, PERSPECTIVES } from "./shared.mjs";

(() => {
  const data = window.__CATALOG__;
  if (!data) {
    // The page is prerendered, so leave what the build produced in place and
    // only say that filtering is unavailable.
    const note = document.createElement("p");
    note.className = "empty";
    note.textContent =
      "Catalog data failed to load, so search and filters are off. The list below is the full catalog as built.";
    document.querySelector("#catalog .section-head")?.append(note);
    return;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const DEFAULTS = FILTER_DEFAULTS;
  const state = { ...DEFAULTS };
  // Licence families and format groups come from the build (license-vocabulary.json, format-vocabulary.json).
  const LICENSE_FAMILIES = data.filters?.licenseFamilies || {};
  const FORMAT_GROUPS = data.filters?.formatGroups || {};

  const categoryLabels = data.categories || {};

  // The choices of each filter whose options come from data, value -> chip
  // label; a FILTERS row with fixed `options` needs nothing here (#252).
  const CHOICE_LABELS = {
    category: Object.fromEntries(Object.entries(categoryLabels).map(([k, c]) => [k, c.label || k])),
    sort: Object.fromEntries(Object.keys(SORTS).map((k) => [k, k])),
    perspective: PERSPECTIVE_LABELS,
    license: LICENSE_FAMILIES,
    engine: Object.fromEntries(Object.entries(ENGINES).map(([k, e]) => [k, e.label])),
    format: Object.fromEntries(Object.entries(FORMAT_GROUPS).map(([k, g]) => [k, g.label])),
  };
  const choicesOf = (f) => f.options || CHOICE_LABELS[f.field] || {};
  // Where a <select> option reads differently from the chip.
  const OPTION_TEXT = { perspective: Object.fromEntries(Object.entries(PERSPECTIVES).map(([k, p]) => [k, p.option])) };
  const repo = data.site.repo;
  // No prototype: "#entry-constructor" must not look like an entry.
  const byId = Object.assign(Object.create(null), Object.fromEntries(data.entries.map((e) => [e.id, e])));

  // Old permalinks (#entry-<id>) now have real pages.
  const legacy = location.hash.match(/^#entry-(.+)$/);
  let legacyId = null;
  try {
    legacyId = legacy ? decodeURIComponent(legacy[1]) : null;
  } catch {
    // A malformed escape is not an entry; the page loads as usual.
  }
  if (legacyId && byId[legacyId]) {
    location.replace(`entry/${encodeURIComponent(legacyId)}/`);
    return;
  }
  // Ages are measured at build time, like the prerendered cards and the
  // freshness line, so the page never disagrees with itself. A weekly
  // scheduled build keeps the build time recent.
  const built = Date.parse(data.generatedAt);
  const NOW = Number.isNaN(built) ? Date.now() : built;

  /* ------------------------------------------------------------ helpers */

  /* -------------------------------------------------------- url <-> state */

  /**
   * A hand-edited or stale link can carry values the page has no control
   * for. Each one falls back to its default, and apply() then rewrites the
   * URL without it.
   */
  function readUrl() {
    Object.assign(
      state,
      readState(
        location.search,
        DEFAULTS,
        Object.fromEntries(FILTERS.filter((f) => f.kind === "choice").map((f) => [f.field, [f.default, ...Object.keys(choicesOf(f))]]))
      )
    );
  }

  const RESULTS_KEY = "fgda:results";

  /**
   * Mirrors the state into the URL. A deliberate choice (a category chip, the
   * sort) pushes a history entry so Back returns to the previous view;
   * keystrokes and checkbox toggles replace, so Back is not a hundred steps
   * of typing. Both in try/catch: Safari throws past 100 calls in 30 s.
   */
  // The query string writeUrl last put in the address bar.
  let lastSearch = location.search;

  function writeUrl({ push = false } = {}) {
    const qs = stateQuery(state, DEFAULTS);
    const next = `${location.pathname}${qs ? `?${qs}` : ""}${location.hash}`;
    lastSearch = qs ? `?${qs}` : "";
    try {
      const same = next === `${location.pathname}${location.search}${location.hash}`;
      if (push && !same) history.pushState(null, "", next);
      else history.replaceState(null, "", next);
    } catch {
      // The view is already right; only the address bar is stale.
    }
    // Entry pages link back to these results (entry.js reads this).
    try {
      if (qs) sessionStorage.setItem(RESULTS_KEY, qs);
      else sessionStorage.removeItem(RESULTS_KEY);
    } catch {
      // Storage can be unavailable; the entry pages then link to the plain catalog.
    }
  }

  /* ---------------------------------------------------------- filtering */

  const passesFilters = (entry) => passes(entry, state, FORMAT_GROUPS);

  /** One pass over the catalog per change (search.js, tested in lib.test.mjs). */
  function computeResults() {
    return computeResultsFor(data.entries, state, { passes: passesFilters, score: searchScore, hasQuery: queryTests().length > 0 });
  }

  /* ------------------------------------------------------------- search */

  // Each entry's searchable fields, normalised once, on the first search (search.js).
  let searchIndex = null;
  function fieldsOf(entry) {
    if (!searchIndex) searchIndex = new Map(data.entries.map((e) => [e.id, searchFields(e)]));
    return searchIndex.get(entry.id) || [];
  }

  let compiled = { q: null, tests: [] };
  function queryTests() {
    if (compiled.q !== state.q) compiled = { q: state.q, tests: compileQuery(state.q) };
    return compiled.tests;
  }

  const searchScore = (entry) => (queryTests().length ? scoreFields(fieldsOf(entry), queryTests()) : 1);

  /** The chosen sort, with entries made for the chosen engine first (search.js). */
  const sorter = () => sorterFor(state);

  /* ---------------------------------------------------------- rendering */

  /** A category's view on this page: the config default (cards or list). */
  function viewFor(cat) {
    return categoryLabels[cat]?.view === "cards" ? "cards" : "list";
  }

  /** The view a category is showing right now: the toggle's choice, else the default. */
  function viewNow(cat) {
    return headingNodes.get(cat)?.getAttribute("data-view") || viewFor(cat);
  }

  const limitFor = (cat) => (viewNow(cat) === "cards" ? CARD_LIMIT : LIST_LIMIT);

  function cardHtml(entry) {
    return entryCardHtml(entry, { root: "", repo, now: NOW, view: viewFor(entry.category), label: categoryLabels[entry.category]?.label });
  }

  /** Grouped by category only under the default sort and no category filter (search.js). The prerendered page is always the grouped default. */
  const shouldGroup = () => shouldGroupFor(state);

  function renderCategoryFilters() {
    const host = $("#category-filters");
    const buttons = [
      { id: "all", label: "All" },
      ...Object.keys(categoryLabels).map((id) => ({
        id,
        label: categoryLabels[id]?.label || id,
      })),
    ];
    // One choice at a time, so the row is a radio group, not a set of
    // independent toggles (aria-pressed announced each chip as its own switch).
    host.setAttribute("role", "radiogroup");
    host.innerHTML = buttons
      .map(
        (b) =>
          `<button type="button" class="chip" role="radio" data-cat="${escapeHtml(b.id)}" aria-checked="false">${escapeHtml(b.label)} <span class="chip-count" data-count-for="${escapeHtml(b.id)}"></span></button>`
      )
      .join("");
    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      state.category = btn.getAttribute("data-cat");
      apply({ push: true });
    });
    // Arrow keys move through the group as they do in a native radio set.
    host.addEventListener("keydown", (e) => {
      const chips = $$("#category-filters .chip");
      const at = chips.indexOf(document.activeElement);
      if (at === -1) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      const to = e.key === "Home" ? 0 : e.key === "End" ? chips.length - 1 : step === undefined ? -1 : (at + step + chips.length) % chips.length;
      if (to === -1) return;
      e.preventDefault();
      chips[to].focus();
      state.category = chips[to].getAttribute("data-cat");
      // Moving through the group is browsing, not a step to go Back to.
      apply();
    });
  }

  function syncCategoryChips({ counts, total }) {
    $$("#category-filters .chip").forEach((chip) => {
      const cat = chip.getAttribute("data-cat");
      const on = cat === state.category;
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-checked", on ? "true" : "false");
      const slot = chip.querySelector(".chip-count");
      if (slot) slot.textContent = cat === "all" ? String(total) : String(counts.get(cat) || 0);
      chip.classList.toggle("is-empty", cat !== "all" && !(counts.get(cat) || 0));
    });
  }

  /** Chips describing what is currently filtering the list, each removable. */
  function renderActiveFilters() {
    const host = $("#active-filters");
    const chips = activeFilterChips(state, DEFAULTS, CHOICE_LABELS);

    // The filter keeps aggregators whose files differ, which a reader
    // filtering for "safe to ship" must see, not find in a tooltip.
    $("#commercial-note").hidden = !state.commercialOnly;
    // The small-screen disclosure counts what its hidden panel is doing.
    const set = chips.filter((c) => c.key !== "q").length;
    $("#filters-toggle").textContent = set ? `Filters (${set})` : "Filters";

    if (!chips.length) {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }
    host.hidden = false;
    host.innerHTML = `
      <span class="active-filters-label">Filtering by</span>
      ${chips
        .map(
          (c) =>
            `<button type="button" class="chip chip-remove" data-clear="${escapeHtml(c.key)}">${escapeHtml(c.label)}<span aria-hidden="true"> x</span><span class="sr-only"> (remove)</span></button>`
        )
        .join("")}
      <button type="button" class="chip chip-clear" data-clear="all">Clear all</button>`;
  }

  function headingHtml(cat, count) {
    return groupHeadingHtml({ cat, label: categoryLabels[cat]?.label || cat, count, view: viewFor(cat), root: "" });
  }

  /*
   * The grid keeps one node per entry and per category heading for the life
   * of the page. The prerendered rows are adopted as they are; only entries
   * the build leaves out (deprecated ones) are rendered here, once. Filtering
   * then toggles `hidden`, and nodes move only when the order changes.
   */
  const cardNodes = new Map();
  const headingNodes = new Map();
  // "Show all N in <category>" links under the homepage previews.
  const moreNodes = new Map();
  let flatHeading = null;
  let placedKey = null;

  function adoptNodes() {
    const grid = $("#entry-grid");
    for (const el of $$(".entry-card", grid)) cardNodes.set(el.getAttribute("data-id"), el);
    for (const el of $$(".group-heading", grid)) headingNodes.set(el.getAttribute("data-cat"), el);
    for (const el of $$(".group-more", grid)) moreNodes.set(el.getAttribute("data-cat"), el);
    const tpl = document.createElement("template");
    tpl.innerHTML = [
      ...Object.keys(categoryLabels)
        .filter((cat) => !headingNodes.has(cat))
        .map((cat) => headingHtml(cat, 0)),
      ...Object.keys(categoryLabels)
        .filter((cat) => !moreNodes.has(cat))
        .map((cat) => groupMoreHtml({ cat, label: categoryLabels[cat]?.label || cat, count: 0, root: "" })),
    ].join("");
    for (const el of [...tpl.content.children]) {
      if (el.matches(".entry-card")) cardNodes.set(el.getAttribute("data-id"), el);
      else if (el.matches(".group-more")) moreNodes.set(el.getAttribute("data-cat"), el);
      else headingNodes.set(el.getAttribute("data-cat"), el);
    }
    // Anything else the grid held (a stale prerender) goes.
    for (const el of [...grid.children]) {
      if (!el.matches(".entry-card, .group-heading, .group-more")) el.remove();
    }
    // Card titles are h4 under the h3 category headings. A flat list has no
    // category headings, so this one keeps the outline from skipping a level.
    flatHeading = document.createElement("h3");
    flatHeading.className = "sr-only";
    flatHeading.textContent = "Matching entries";
  }

  // The build prerenders each category's preview only. The rest of the
  // catalog is rendered here once, the first time a search, a filter or a
  // "Show all" needs it, so the page loads without that work.
  let allRendered = false;
  // Set when ensureAllNodes added nodes; renderGrid announces them once
  // they are in the DOM (shortlist.js wires its buttons on the event).
  let announceRendered = false;
  function ensureAllNodes() {
    if (allRendered) return;
    allRendered = true;
    announceRendered = true;
    const missing = data.entries.filter((e) => !cardNodes.has(e.id));
    if (!missing.length) return;
    const tpl = document.createElement("template");
    tpl.innerHTML = missing.map(cardHtml).join("");
    for (const el of [...tpl.content.children]) cardNodes.set(el.getAttribute("data-id"), el);
    // Force the next render to place every node.
    placedKey = null;
  }

  // The prerender has CARD_LIMIT nodes for a cards-default category. Shown
  // as a List (LIST_LIMIT rows), its preview needs a few more: render just
  // those, not the whole catalog, so a stored List choice keeps the fast load.
  function ensurePreviewNodes(list) {
    if (allRendered) return;
    const byCat = new Map();
    for (const e of list.slice().sort(sorter())) {
      if (!byCat.has(e.category)) byCat.set(e.category, []);
      byCat.get(e.category).push(e);
    }
    const missing = [];
    for (const [cat, entries] of byCat) {
      for (const e of entries.slice(0, limitFor(cat))) if (!cardNodes.has(e.id)) missing.push(e);
    }
    if (!missing.length) return;
    const tpl = document.createElement("template");
    tpl.innerHTML = missing.map(cardHtml).join("");
    for (const el of [...tpl.content.children]) cardNodes.set(el.getAttribute("data-id"), el);
    announceRendered = true;
    placedKey = null;
  }

  /**
   * "Did you mean" for a search that matched nothing: the closest entry names,
   * by the same similarity the 404 page uses. A typo ("quaternious", "kenny")
   * is the moment a visitor leaves, and the fix is one click.
   */
  function renderSuggestions(query) {
    const host = $("#empty-suggest");
    if (!host) return;
    const q = String(query || "").trim();
    // Only entries the other filters would show: a suggestion that the
    // Audio chip then hides would lead straight back to this empty state.
    const pool = q
      ? data.entries.filter((e) => (state.category === "all" || e.category === state.category) && passes(e, { ...state, q: "" }, FORMAT_GROUPS))
      : [];
    const matches = q ? closestEntries(slugOf(q), pool) : [];
    if (!matches.length) {
      host.hidden = true;
      host.textContent = "";
      return;
    }
    host.hidden = false;
    host.textContent = "Did you mean: ";
    matches.forEach((entry, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "link-button";
      btn.textContent = entry.name;
      btn.setAttribute("data-suggest", entry.name);
      host.append(btn);
      if (i < matches.length - 1) host.append(", ");
    });
    host.append("?");
  }

  /** Puts every node in `order` (visible ones first), moving nothing already in place. */
  function placeNodes(order) {
    const grid = $("#entry-grid");
    const current = grid.children;
    if (order.length === current.length && order.every((n, i) => current[i] === n)) return;
    grid.append(...order);
  }

  function renderGrid({ list, ranked }) {
    const grid = $("#entry-grid");
    const empty = $("#empty-state");
    const group = shouldGroup();
    // The denominator is what the status switches could show: deprecated
    // entries count only once their switch is on, so the default view reads
    // "418 of 418", matching the hero and the README.
    const pool = state.deprecated ? data.entries.length : data.entries.filter(isListed).length;
    $("#result-count").textContent = `${list.length} of ${pool} sources shown`;
    empty.hidden = list.length > 0;
    renderSuggestions(list.length ? "" : state.q);
    if (!list.length) {
      // The search that came up empty goes into the gap report's title.
      $("#empty-request").href = gapIssueUrl(repo, state.q, state.category === "all" ? "" : categoryLabels[state.category]?.label || state.category);
      $("#empty-new-source").href = `${repo}/issues/new?template=new-source.yml`;
    }

    // The default page (no search, no filter) previews each category and
    // links to its page, as the prerender does. Any filter or search shows
    // the whole matching set, so every card must exist by then.
    const preview = group && !stateQuery(state, DEFAULTS);
    if (!preview) ensureAllNodes();
    else ensurePreviewNodes(list);

    // Under a plain sort the order of all nodes depends only on the sort
    // and the engine, so filtering only toggles visibility. A ranked search
    // reorders on every change (search.mjs placementKey).
    const key = placementKey(state, { ranked, group, list });
    if (key !== placedKey) {
      placedKey = key;
      const shown = new Set(list.map((e) => e.id));
      const rest = data.entries.filter((e) => !shown.has(e.id));
      const all = ranked ? [...list, ...rest] : data.entries.slice().sort(sorter());
      // Entries not rendered yet (the preview page) are simply not placed.
      const node = (e) => cardNodes.get(e.id);
      const order = [flatHeading];
      if (group) {
        for (const cat of Object.keys(categoryLabels)) {
          order.push(headingNodes.get(cat));
          for (const e of all) if (e.category === cat && node(e)) order.push(node(e));
          order.push(moreNodes.get(cat));
        }
        // Entries outside the configured categories never show grouped.
        for (const e of all) if (!categoryLabels[e.category] && node(e)) order.push(node(e));
      } else {
        order.push(...headingNodes.values(), ...moreNodes.values(), ...all.map(node).filter(Boolean));
      }
      placeNodes(order);
    }

    const shown = new Set();
    const perCat = new Map();
    for (const e of list) {
      if (group && !categoryLabels[e.category]) continue;
      shown.add(e.id);
      perCat.set(e.category, (perCat.get(e.category) || 0) + 1);
    }
    // A search always uses the list form.
    const searching = !!state.q.trim();
    const seenPerCat = new Map();
    for (const el of grid.children) {
      if (!el.matches(".entry-card")) continue;
      const id = el.getAttribute("data-id");
      const cat = el.getAttribute("data-cat");
      let visible = shown.has(id);
      if (visible && preview) {
        const n = seenPerCat.get(cat) || 0;
        seenPerCat.set(cat, n + 1);
        if (n >= limitFor(cat)) visible = false;
      }
      el.hidden = !visible;
      const view = searching ? "list" : viewNow(cat);
      if (el.getAttribute("data-view") !== view) el.setAttribute("data-view", view);
    }
    for (const [cat, el] of moreNodes) {
      const total = perCat.get(cat) || 0;
      const show = preview && total > limitFor(cat);
      el.hidden = !show;
      if (show) el.textContent = `Show all ${total} in ${categoryLabels[cat]?.label || cat}`;
    }
    flatHeading.hidden = group || !list.length;
    for (const [cat, el] of headingNodes) {
      const n = group ? perCat.get(cat) || 0 : 0;
      el.hidden = !n;
      if (n) el.querySelector(".group-n").textContent = String(n);
    }
    if (announceRendered) {
      announceRendered = false;
      document.dispatchEvent(new CustomEvent("fgda:cards-rendered"));
    }
    groupHeadings = [...grid.children].filter((el) => el.matches(".group-heading") && !el.hidden);
    // The first visible heading sits flush with the top of the list.
    for (const el of headingNodes.values()) el.classList.toggle("is-lead", el === groupHeadings[0]);
    syncSpy();
  }

  /* ------------------------------------------------- scroll position */

  let groupHeadings = [];
  let currentGroup = null;
  let ticking = false;

  /**
   * Marks which category you are currently scrolled into. The chips stay pure
   * filters; this is a separate, quieter signal, because one control carrying
   * two meanings is how a filter row stops being readable.
   */
  function syncSpy() {
    const controls = $(".controls");
    // Anchored jumps (chip links, #entry- permalinks) would otherwise land
    // underneath the sticky filter bar. Its height varies with wrapping, so
    // publish the measured value and let CSS scroll-margin use it. On small
    // screens the bar is not sticky, and nothing needs clearing.
    const stuck = !!controls && getComputedStyle(controls).position === "sticky";
    document.documentElement.style.setProperty(
      "--sticky-h",
      stuck ? `${Math.round(controls.getBoundingClientRect().height)}px` : "0px"
    );
    const cutoff = (stuck ? controls.getBoundingClientRect().bottom : 0) + 8;
    let found = null;
    for (const h of groupHeadings) {
      if (h.getBoundingClientRect().top <= cutoff) found = h.getAttribute("data-cat");
      else break;
    }
    if (found === currentGroup) return;
    currentGroup = found;
    // "You are in" is a line of its own. It used to underline a second chip,
    // which read (and was announced) as a second selected filter.
    const line = $("#current-group");
    if (!line) return;
    const label = found !== null && groupHeadings.length > 1 ? categoryLabels[found]?.label || found : null;
    line.textContent = label ? `You are in: ${label}` : "";
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      syncSpy();
      const btn = $("#to-top");
      if (btn) btn.hidden = window.scrollY < 600;
    });
  }

  // Typing waits for a pause before filtering; every other control is immediate.
  const SEARCH_DELAY = 120;
  let searchTimer = 0;

  // The entries the current view shows, for "Download these" (#110).
  let lastList = [];

  function apply({ push = false } = {}) {
    clearTimeout(searchTimer);
    const results = computeResults();
    lastList = results.list;
    syncCategoryChips(results);
    renderActiveFilters();
    renderGrid(results);
    writeUrl({ push });
  }

  // The starter table and the guide list are prerendered by the build and
  // never change after it, so the page does not render them again (#258).


  /* ------------------------------------------------------ scroll memory */

  // Back from an entry page should land where you were, even when the
  // browser reloads this page instead of restoring it from its cache.
  const scrollKey = () => `fgda:scroll:${location.pathname}${location.search}`;

  function rememberScroll() {
    try {
      sessionStorage.setItem(scrollKey(), String(Math.round(window.scrollY)));
    } catch {
      // Storage can be unavailable; scrolling back is a convenience.
    }
  }

  function restoreScroll() {
    let y = null;
    try {
      y = sessionStorage.getItem(scrollKey());
      sessionStorage.removeItem(scrollKey());
    } catch {
      return;
    }
    // Only Back and Forward return to a position. A link to the homepage
    // (the brand, the breadcrumb) is a new visit and starts where it asks.
    const nav = performance.getEntriesByType("navigation")[0];
    if (y !== null && nav && nav.type === "back_forward") {
      requestAnimationFrame(() => window.scrollTo(0, Number(y)));
    }
  }

  // Restored from the back/forward cache: the page kept its own position,
  // so drop the saved one before a later visit can reuse it.
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    try {
      sessionStorage.removeItem(scrollKey());
    } catch {
      // Nothing to clear.
    }
  });

  /* ----------------------------------------------------------- controls */

  /** "Copy link to this view" and "Download these" beside the result count (#110). */
  function bindViewActions() {
    const host = $("#view-actions");
    if (!host) return;
    host.hidden = false;
    const status = $("#view-actions-status");
    $("#copy-view-link").addEventListener("click", async () => {
      const url = location.href.split("#")[0] + "#catalog";
      try {
        await navigator.clipboard.writeText(url);
        status.textContent = "Link copied";
      } catch {
        // Clipboard refused: show the link so it can be copied by hand.
        status.textContent = url;
      }
    });
    for (const btn of $$("[data-results-export]", host)) {
      btn.addEventListener("click", () => {
        const csv = btn.getAttribute("data-results-export") === "csv";
        const text = csv ? catalogCsv(lastList, data.site?.siteUrl || "") : `${JSON.stringify(lastList, null, 2)}\n`;
        const url = URL.createObjectURL(new Blob([text], { type: csv ? "text/csv" : "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = csv ? "free-game-dev-assets.csv" : "free-game-dev-assets.json";
        document.body.append(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = `Downloaded ${lastList.length} ${lastList.length === 1 ? "entry" : "entries"}`;
      });
    }
  }

  function bindControls() {
    const search = $("#search");
    search.value = state.q;

    // The hero's search box runs the catalog search in place and moves to the
    // results; without this script its form loads ?q= at #catalog instead.
    $("#hero-search-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      state.q = $("#hero-search").value;
      search.value = state.q;
      apply({ push: true });
      $("#catalog").scrollIntoView();
      $("#result-count").focus({ preventScroll: true });
    });
    search.addEventListener("input", (e) => {
      state.q = e.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(apply, SEARCH_DELAY);
    });

    // Every filter control, from the FILTERS table (#252). A select whose
    // markup holds only its default option is filled from its choices.
    for (const f of FILTERS) {
      if (!f.control) continue;
      const el = $(f.control);
      if (f.kind === "switch") {
        el.checked = state[f.field];
        el.addEventListener("change", (e) => {
          state[f.field] = e.target.checked;
          apply();
        });
        continue;
      }
      if (el.options.length <= 1) {
        el.insertAdjacentHTML(
          "beforeend",
          Object.entries(OPTION_TEXT[f.field] || choicesOf(f))
            .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
            .join("")
        );
      }
      el.value = state[f.field];
      el.addEventListener("change", (e) => {
        state[f.field] = e.target.value;
        // A new sort is a new view worth a Back step; a narrowed list is not.
        apply(f.field === "sort" ? { push: true } : undefined);
      });
    }

    // Back and Forward step through the pushed views.
    window.addEventListener("popstate", () => {
      // A hash-only move (#stacks, #catalog) also fires popstate; the
      // filters did not change, and re-reading them would wipe typing
      // that the debounce has not written yet.
      if (location.search === lastSearch) return;
      lastSearch = location.search;
      readUrl();
      syncControls();
      apply();
    });

    // The whole card is the title link (a stretched ::after), so every click
    // that leaves for an entry page lands here.
    $("#entry-grid").addEventListener("click", (e) => {
      // A modified click opens a new tab and this page stays where it is.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.target.closest("a.entry-link")) rememberScroll();
    });
    // The floating Search button steps aside while a card's own links have
    // keyboard focus (styles.css body.card-focus).
    $("#entry-grid").addEventListener("focusin", (e) => {
      document.body.classList.toggle("card-focus", !!e.target.closest(".entry-links"));
    });
    $("#entry-grid").addEventListener("focusout", () => document.body.classList.remove("card-focus"));
    // "Show all N in <category>" opens that category in place; without this
    // script the same link leads to the static category page.
    $("#entry-grid").addEventListener("click", (e) => {
      const more = e.target.closest("a.group-more");
      if (!more || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      state.category = more.getAttribute("data-cat");
      apply({ push: true });
      // The category headings are hidden under a category filter, so land on
      // the first card of the list instead (it clears the sticky bar).
      $("#entry-grid .entry-card:not([hidden])")?.scrollIntoView({ block: "start" });
      $("#result-count").focus({ preventScroll: true });
    });
    // Cards / List on each category heading (views.js); re-render so the
    // preview limit follows the view.
    const defaults = Object.fromEntries(Object.keys(categoryLabels).map((cat) => [cat, viewFor(cat)]));
    installViewToggles($("#entry-grid"), defaults, { onChange: () => apply() });
    // Starter rows link to entry pages too.
    $("#starter-table").addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.target.closest("a")) rememberScroll();
    });

    // The button pressed is gone after the re-render. Focus goes to the chip
    // that took its place, or to the result count, never back to the top of
    // the document.
    $("#active-filters").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-clear]");
      if (!btn) return;
      const key = btn.getAttribute("data-clear");
      const index = $$("#active-filters [data-clear]").indexOf(btn);
      if (key === "all") Object.assign(state, DEFAULTS);
      else state[key] = DEFAULTS[key];
      syncControls();
      apply();
      const left = $$("#active-filters [data-clear]");
      const next = key === "all" ? null : left[Math.min(index, left.length - 1)];
      (next || $("#result-count")).focus();
    });

    $("#empty-reset").addEventListener("click", () => {
      Object.assign(state, DEFAULTS);
      syncControls();
      apply();
      $("#result-count").focus();
    });

    // A suggestion runs that search in the box, keeping the other filters.
    $("#empty-suggest").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-suggest]");
      if (!btn) return;
      state.q = btn.getAttribute("data-suggest");
      search.value = state.q;
      apply({ push: true });
      $("#result-count").focus();
    });

    // On a phone the filter panel is about 530px of chips and checkboxes
    // between the search box and the first entry. It folds behind a button
    // there (styles.css); on wider screens the button is not shown. Only
    // with this script can the panel be folded, so no-script pages keep it.
    const controls = $(".controls");
    const toggle = $("#filters-toggle");
    toggle.hidden = false;
    controls.classList.add("is-collapsed");
    toggle.addEventListener("click", () => {
      const open = controls.classList.toggle("is-collapsed") === false;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // On wider screens the bar stays sticky, and unfolded it covered about
    // a quarter of a laptop screen. Once it docks at the top it folds to the
    // search row and the Filters button, as on a phone; scrolling back up
    // to it unfolds it again.
    const wide = matchMedia("(min-width: 641px) and (min-height: 601px)");
    const sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    controls.before(sentinel);
    const setDocked = (docked) => {
      if (!wide.matches) {
        controls.classList.remove("is-docked");
        return;
      }
      if (docked === controls.classList.contains("is-docked")) return;
      controls.classList.toggle("is-docked", docked);
      controls.classList.toggle("is-collapsed", docked);
      toggle.setAttribute("aria-expanded", docked ? "false" : "true");
    };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => setDocked(!e.isIntersecting && e.boundingClientRect.top < 0)).observe(sentinel);
    }
    wide.addEventListener?.("change", () => {
      if (!wide.matches) controls.classList.remove("is-docked");
      else controls.classList.remove("is-collapsed");
    });
    if (wide.matches) {
      controls.classList.remove("is-collapsed");
      toggle.setAttribute("aria-expanded", "true");
    }

    const top = $("#to-top");
    // Returns to the catalog's search and filters, which on small screens have
    // scrolled away. It used to scroll to the page top and then focus search
    // further down, leaving keyboard users typing into a field off screen.
    top.addEventListener("click", () => {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      $("#catalog").scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
      search.focus({ preventScroll: true });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // "/" focuses search, Escape leaves it. Suppressed whenever the user is
    // already typing somewhere.
    document.addEventListener("keydown", (e) => {
      const el = document.activeElement;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      // Ctrl+/ and Cmd+/ belong to the browser and its extensions.
      if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        search.focus();
        search.select();
        return;
      }
      if (e.key === "Escape" && el === search && search.value) {
        search.value = "";
        state.q = "";
        apply();
      }
    });

  }

  function syncControls() {
    $("#search").value = state.q;
    for (const f of FILTERS) {
      if (!f.control) continue;
      if (f.kind === "switch") $(f.control).checked = state[f.field];
      else $(f.control).value = state[f.field];
    }
  }

  /* --------------------------------------------------------------- init */

  readUrl();
  adoptNodes();
  renderCategoryFilters();
  bindControls();
  bindViewActions();
  syncControls();
  apply();
  restoreScroll();

})();

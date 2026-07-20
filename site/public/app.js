(() => {
  const data = window.__CATALOG__;
  if (!data) {
    document.body.innerHTML =
      "<p style='padding:2rem;font-family:sans-serif'>Catalog data missing. Run <code>node site/build.mjs</code>.</p>";
    return;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const state = {
    category: "all",
    q: "",
    active: true,
    review: true,
    commercialOnly: false,
    noAttr: false,
  };

  const categoryLabels = data.categories || {};
  const repo = data.site?.repo || "https://github.com/TMHSDigital/Free-Game-Dev-Assets";
  const byId = Object.fromEntries(data.entries.map((e) => [e.id, e]));

  function edgeColor(entry) {
    if (entry.commercial === true) return "var(--ok)";
    if (entry.commercial === false) return "var(--danger)";
    return "var(--warn)";
  }

  function commercialLabel(v) {
    if (v === true) return "commercial OK";
    if (v === false) return "non-commercial";
    return "commercial ?";
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function matches(entry) {
    if (state.category !== "all" && entry.category !== state.category) return false;
    if (entry.status === "active" && !state.active) return false;
    if (entry.status === "needs-review" && !state.review) return false;
    if (entry.status === "deprecated" && !state.active) return false;
    if (state.commercialOnly && entry.commercial !== true) return false;
    if (state.noAttr && entry.attribution_required !== false) return false;

    const q = state.q.trim().toLowerCase();
    if (!q) return true;
    const hay = [
      entry.name,
      entry.license,
      entry.category,
      entry.summary,
      ...(entry.tags || []),
      ...(entry.formats || []),
      ...(entry.subcategories || []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }

  function renderCategoryFilters() {
    const host = $("#category-filters");
    const cats = Object.keys(categoryLabels);
    const buttons = [
      { id: "all", label: "All" },
      ...cats.map((id) => ({ id, label: categoryLabels[id]?.label || id })),
    ];
    host.innerHTML = buttons
      .map(
        (b) =>
          `<button type="button" class="chip${state.category === b.id ? " is-active" : ""}" data-cat="${escapeHtml(b.id)}">${escapeHtml(b.label)}</button>`
      )
      .join("");

    host.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      state.category = btn.getAttribute("data-cat");
      $$(".chip", host).forEach((c) => c.classList.toggle("is-active", c === btn));
      renderGrid();
    });
  }

  function cardHtml(entry) {
    const cat = categoryLabels[entry.category]?.label || entry.category;
    const flags = [
      entry.status,
      commercialLabel(entry.commercial),
      entry.license,
    ].join(" · ");
    return `
      <button type="button" class="entry-card" data-id="${escapeHtml(entry.id)}" style="--edge:${edgeColor(entry)}">
        <span class="entry-edge" aria-hidden="true"></span>
        <span class="entry-body">
          <span class="entry-top">
            <h3>${escapeHtml(entry.name)}</h3>
            <span class="entry-flags">${escapeHtml(flags)}</span>
          </span>
          <p>${escapeHtml(entry.summary || "")}</p>
          <span class="meta-line">
            <span>${escapeHtml(cat)}</span>
            ${(entry.formats || []).slice(0, 3).map((f) => `<span>${escapeHtml(f)}</span>`).join("")}
          </span>
        </span>
      </button>
    `;
  }

  function renderStarters() {
    const tbody = $("#starter-table tbody");
    const featured = Array.isArray(data.featured) ? data.featured : [];
    const rows = featured
      .map((item) => {
        const id = typeof item === "string" ? item : item.id;
        const need = typeof item === "string" ? "" : item.need || "";
        const entry = byId[id];
        if (!entry) return "";
        return `
          <tr>
            <td class="need">${escapeHtml(need)}</td>
            <td><a href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(entry.name)}</a></td>
            <td class="license">${escapeHtml(entry.license)} · ${escapeHtml(commercialLabel(entry.commercial))}</td>
          </tr>
        `;
      })
      .filter(Boolean);
    tbody.innerHTML = rows.join("");
  }

  function renderGrid() {
    const list = data.entries.filter(matches);
    const grid = $("#entry-grid");
    const empty = $("#empty-state");
    const stats = data.stats || {};
    $("#result-count").textContent = `${list.length} / ${data.entries.length}`;
    $("#catalog-blurb").textContent =
      `${stats.total || data.entries.length} sources · ${stats.active || 0} active · ${stats.commercialOk || 0} commercial-ok`;

    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    grid.innerHTML = list.map(cardHtml).join("");
  }

  function renderGuides() {
    const host = $("#guide-list");
    host.innerHTML = (data.guides || [])
      .map((g) => {
        const href = `${repo}/blob/main/${g.path}`;
        return `<li><a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(g.title)}<span>${escapeHtml(g.path)}</span></a></li>`;
      })
      .join("");
  }

  function openEntry(id) {
    const entry = byId[id];
    if (!entry) return;
    const cat = categoryLabels[entry.category]?.label || entry.category;
    $("#dialog-body").innerHTML = `
      <h2>${escapeHtml(entry.name)}</h2>
      <p class="dialog-flags">${escapeHtml(entry.status)} · ${escapeHtml(commercialLabel(entry.commercial))} · ${escapeHtml(entry.license)}</p>
      <p class="lead">${escapeHtml(entry.summary || "")}</p>
      <dl class="dialog-meta">
        <div><dt>Category</dt><dd>${escapeHtml(cat)}</dd></div>
        <div><dt>Attribution</dt><dd>${escapeHtml(String(entry.attribution_required))}</dd></div>
        <div><dt>Formats</dt><dd>${escapeHtml((entry.formats || []).join(", ") || "—")}</dd></div>
        <div><dt>Tags</dt><dd>${escapeHtml((entry.tags || []).join(", ") || "—")}</dd></div>
        <div><dt>Verified</dt><dd>${escapeHtml(entry.verified || "—")}</dd></div>
      </dl>
      <div class="dialog-actions">
        <a class="btn" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener noreferrer">Open source</a>
        <a class="btn-ghost" href="${escapeHtml(`${repo}/blob/main/${entry.path}`)}" target="_blank" rel="noopener noreferrer">View entry</a>
      </div>
    `;
    $("#entry-dialog").showModal();
  }

  function bindControls() {
    $("#search").addEventListener("input", (e) => {
      state.q = e.target.value;
      renderGrid();
    });
    $("#filter-active").addEventListener("change", (e) => {
      state.active = e.target.checked;
      renderGrid();
    });
    $("#filter-review").addEventListener("change", (e) => {
      state.review = e.target.checked;
      renderGrid();
    });
    $("#filter-commercial").addEventListener("change", (e) => {
      state.commercialOnly = e.target.checked;
      renderGrid();
    });
    $("#filter-no-attr").addEventListener("change", (e) => {
      state.noAttr = e.target.checked;
      renderGrid();
    });
    $("#entry-grid").addEventListener("click", (e) => {
      const card = e.target.closest("[data-id]");
      if (!card) return;
      openEntry(card.getAttribute("data-id"));
    });
    $("#repo-link").href = repo;
    $("#footer-repo").href = repo;
  }

  renderCategoryFilters();
  renderStarters();
  renderGuides();
  bindControls();
  renderGrid();
})();

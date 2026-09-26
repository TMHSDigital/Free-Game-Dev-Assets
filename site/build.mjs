#!/usr/bin/env node
/**
 * Build GitHub Pages site from catalog markdown frontmatter.
 * Add/edit one catalog/<category>/<id>.md → rebuild regenerates everything.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commercialLabel, esc, latestAllowedDate, PERSPECTIVE_LABELS, verifiedAge } from "./lib/shared.mjs";
import { parseFrontmatter, summaryFromBody } from "./lib/frontmatter.mjs";
import { entryPageHtml } from "./lib/entry-page.mjs";
import { LinkError, makeLinkResolver } from "./lib/links.mjs";
import { llmsFullTxt, llmsTxt } from "./lib/llms.mjs";
import { deprecationReason, MarkdownError, renderBlocks, renderInline, splitEntryBody } from "./lib/markdown.mjs";
import { checkPage } from "./lib/page-checks.mjs";
import { checkStacks } from "./checks.mjs";
import { stackPageHtml } from "./lib/stack-page.mjs";
import { freshnessLineHtml, freshnessPageHtml, freshnessStats } from "./lib/freshness.mjs";
import { licenceTerms, listStackFiles, owes, parseStack, pickPath } from "./lib/stacks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const PUBLIC = path.join(__dirname, "public");
const DIST = path.join(__dirname, "dist");
const CONFIG_PATH = path.join(__dirname, "config.json");
const VOCAB_PATH = path.join(__dirname, "license-vocabulary.json");
const SPDX_ALLOWED_PATH = path.join(__dirname, "spdx-allowed.json");
const FORMATS_PATH = path.join(__dirname, "format-vocabulary.json");
// Social preview image: a first-party screenshot of this site, kept with the
// other first-party stills (the validator allows binaries there) and copied
// into dist at build time.
const OG_CARD_NAME = "og-card.png";
const OG_CARD_SRC = path.join(ROOT, "docs", "images", "readme", OG_CARD_NAME);

/** Sort rank for "license permissiveness": least owed first. */
const ATTRIBUTION_RANK = { none: 0, notice: 1, required: 2, any: 3 };

function walkMarkdown(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkMarkdown(full, out);
      continue;
    }
    if (!name.endsWith(".md")) continue;
    if (name === "README.md" || name === "TEMPLATE.md") continue;
    out.push(full);
  }
  return out;
}

/** The Licence-filter family a license value belongs to (license-vocabulary.json `families`). */
function licenseFamily(vocab, license) {
  for (const [key, fam] of Object.entries(vocab.families || {})) {
    if (Array.isArray(fam.licenses) && fam.licenses.includes(license)) return key;
  }
  return "mixed";
}

function loadEntries(vocab) {
  const files = walkMarkdown(CATALOG);
  const entries = [];
  const errors = [];
  const bodies = new Map();

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    const parsed = parseFrontmatter(text);
    if (!parsed) {
      errors.push(`${rel} has no frontmatter`);
      continue;
    }
    if (parsed.errors.length) {
      errors.push(...parsed.errors.map((e) => `${rel} frontmatter ${e}`));
      continue;
    }
    const { meta } = parsed;
    const body = parsed.body.trim();
    const required = ["id", "name", "url", "category", "license", "status"];
    const missing = required.filter((k) => meta[k] === undefined || meta[k] === null || meta[k] === "");
    if (missing.length) {
      errors.push(`${rel} missing: ${missing.join(", ")}`);
      continue;
    }
    bodies.set(String(meta.id), body);

    entries.push({
      id: String(meta.id),
      name: String(meta.name),
      url: String(meta.url),
      category: String(meta.category),
      subcategories: Array.isArray(meta.subcategories) ? meta.subcategories : [],
      license: String(meta.license),
      commercial:
        meta.commercial === true
          ? true
          : meta.commercial === false
            ? false
            : meta.commercial === "varies"
              ? "varies"
              : "unknown",
      attribution_required:
        meta.attribution_required === true
          ? true
          : meta.attribution_required === false
            ? false
            : "unknown",
      formats: Array.isArray(meta.formats) ? meta.formats : [],
      tags: Array.isArray(meta.tags) ? meta.tags : [],
      verified: meta.verified ? String(meta.verified) : null,
      status: String(meta.status),
      path: rel,
      page: `entry/${String(meta.id)}/`,
      summary: summaryFromBody(body),
      ...(meta.grid_dimensions ? { grid_dimensions: String(meta.grid_dimensions) } : {}),
      ...(meta.camera_perspective ? { camera_perspective: String(meta.camera_perspective) } : {}),
      ...(Array.isArray(meta.hardware_tags) ? { hardware_tags: meta.hardware_tags } : {}),
      ...(meta.attribution_string ? { attribution_string: String(meta.attribution_string) } : {}),
      ...(meta.publisher ? { publisher: String(meta.publisher) } : {}),
      ...(meta.license_spdx ? { license_spdx: String(meta.license_spdx) } : {}),
      ...(meta.maintenance ? { maintenance: String(meta.maintenance) } : {}),
      licenseFamily: licenseFamily(vocab, String(meta.license)),
      attributionClass: vocab.licenses[String(meta.license)]?.attribution || "any",
      licenseRank:
        ATTRIBUTION_RANK[
          vocab.licenses[String(meta.license)]?.attribution || "any"
        ],
    });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  return { entries, errors, bodies };
}

function edgeVar(entry) {
  if (entry.commercial === true) return "var(--ok)";
  if (entry.commercial === false) return "var(--danger)";
  if (entry.commercial === "varies") return "var(--warn)";
  return "var(--unknown)";
}

/**
 * Prerendered entry row. The same markup app.js produces on hydrate, so the
 * page is complete and indexable before any script runs. The card is an
 * <article> with a real heading link, not a <button> wrapping a heading:
 * that gives every entry a permalink and keeps heading navigation working.
 */
function entryRowHtml(entry, repo, now) {
  const age = verifiedAge(entry.verified, now);
  const ageText =
    age.days === null
      ? "verified date unknown"
      : `verified ${entry.verified} (${age.days}d ago)`;
  const flags = [entry.status, commercialLabel(entry.commercial), entry.license]
    .map(esc)
    .join(" &middot; ");
  const formats = (entry.formats || [])
    .slice(0, 3)
    .map((f) => `<span>${esc(f)}</span>`)
    .join("");
  const taxonomy = [
    entry.grid_dimensions ? `<span class="tax">${esc(entry.grid_dimensions)}</span>` : "",
    entry.camera_perspective
      ? `<span class="tax">${esc(PERSPECTIVE_LABELS[entry.camera_perspective] || entry.camera_perspective)}</span>`
      : "",
  ].join("");
  return `<article class="entry-card" id="entry-${esc(entry.id)}" data-id="${esc(entry.id)}" data-status="${esc(entry.status)}" style="--edge:${edgeVar(entry)}">
  <span class="entry-edge" aria-hidden="true"></span>
  <div class="entry-body">
    <div class="entry-top">
      <h4><a class="entry-link" href="entry/${esc(entry.id)}/" data-id="${esc(entry.id)}">${esc(entry.name)}</a></h4>
      <span class="entry-flags">${flags}</span>
    </div>
    <p>${esc(entry.summary || "")}</p>
    <div class="meta-line">
      <span>${esc(entry.category)}</span>${formats}${taxonomy}
      <span class="verified is-${age.bucket}" data-verified="${esc(entry.verified || "")}" title="License last checked at the source">${esc(ageText)}</span>
    </div>
    <div class="entry-links">
      <a href="${esc(entry.url)}" rel="noopener noreferrer">Open source</a>
      <a href="${esc(`${repo}/blob/main/${entry.path}`)}" rel="noopener noreferrer">Entry and evidence</a>
    </div>
  </div>
</article>`;
}

/**
 * The catalog grouped under category headings. 300 rows in one flat list is
 * not navigable; headings give the page structure a reader can scan and an
 * anchor they can link to. app.js reproduces this exact shape on hydrate.
 *
 * Grouping is only correct under the default sort. Sorting by verified date
 * or license across category buckets would be meaningless, so app.js falls
 * back to a flat list in those cases; the prerender is always the default.
 */
function groupedRowsHtml(entries, categories, repo, now) {
  const order = Object.keys(categories);
  const seen = new Set(entries.map((e) => e.category));
  const out = [];
  for (const cat of order) {
    if (!seen.has(cat)) continue;
    const group = entries.filter((e) => e.category === cat);
    if (!group.length) continue;
    const label = categories[cat]?.label || cat;
    out.push(
      `<h3 class="group-heading" id="group-${esc(cat)}" data-cat="${esc(cat)}">` +
        `<span class="group-name">${esc(label)}</span>` +
        `<span class="group-count">${group.length}</span>` +
        `</h3>`
    );
    out.push(...group.map((e) => entryRowHtml(e, repo, now)));
  }
  return out.join("\n");
}

/**
 * Without JavaScript the chips cannot filter, so the prerender emits them as
 * jump links to the group headings instead. app.js replaces them with real
 * filter buttons on hydrate.
 */
function categoryChipsHtml(entries, categories) {
  const counts = new Map();
  for (const e of entries) counts.set(e.category, (counts.get(e.category) || 0) + 1);
  const chips = [
    `<a class="chip" href="#catalog">All <span class="chip-count">${entries.length}</span></a>`,
  ];
  for (const [cat, meta] of Object.entries(categories)) {
    const n = counts.get(cat) || 0;
    if (!n) continue;
    chips.push(
      `<a class="chip" href="#group-${esc(cat)}">${esc(meta.label || cat)} <span class="chip-count">${n}</span></a>`
    );
  }
  return chips.join("");
}

function starterRowsHtml(featured) {
  return featured
    .map(
      (e) => `<tr>
  <td class="need">${esc(e.need || "")}</td>
  <td><a href="entry/${esc(e.id)}/">${esc(e.name)}</a></td>
  <td class="license">${esc(e.license)} &middot; ${esc(commercialLabel(e.commercial))}</td>
</tr>`
    )
    .join("\n");
}

function guideRowsHtml(guides, repo) {
  return (guides || [])
    .map(
      (g) =>
        `<li><a href="${esc(`${repo}/blob/main/${g.path}`)}" rel="noopener noreferrer">${esc(g.title)}<span>${esc(g.path)}</span></a></li>`
    )
    .join("\n");
}

function headMetaHtml(site, stats, generatedAt, hasCard) {
  const url = site.siteUrl;
  const title = site.title;
  const desc = site.tagline;
  const card = `${url.replace(/\/+$/, "")}/${OG_CARD_NAME}`;
  const cardMeta = hasCard
    ? [
        `<meta property="og:image" content="${esc(card)}" />`,
        `<meta property="og:image:width" content="1200" />`,
        `<meta property="og:image:height" content="630" />`,
        `<meta property="og:image:alt" content="${esc(`${title}: ${desc}`)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:image" content="${esc(card)}" />`,
      ]
    : [`<meta name="twitter:card" content="summary" />`];
  return [
    `<link rel="canonical" href="${esc(url)}" />`,
    // robots.txt is only read at a host's root, so under a project Pages path
    // its Sitemap line is never seen; point at the sitemap from the page too.
    `<link rel="sitemap" type="application/xml" href="${esc(url.replace(/\/+$/, ""))}/sitemap.xml" />`,
    `<meta name="theme-color" content="#1a4d3e" media="(prefers-color-scheme: light)" />`,
    `<meta name="theme-color" content="#0f1216" media="(prefers-color-scheme: dark)" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(title)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    ...cardMeta,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="generator" content="site/build.mjs ${esc(generatedAt)}" />`,
    `<meta name="catalog:entries" content="${stats.total}" />`,
  ].join("\n    ");
}

function sitemapXml(site, entries, stacks = []) {
  const base = site.siteUrl.replace(/\/+$/, "");
  const urls = [
    `  <url><loc>${esc(base)}/</loc></url>`,
    `  <url><loc>${esc(base)}/freshness/</loc></url>`,
    ...stacks.map((s) => `  <url><loc>${esc(base)}/stack/${esc(s.meta.id)}/</loc><lastmod>${esc(s.meta.walked)}</lastmod></url>`),
    ...entries.map(
      (e) =>
        `  <url><loc>${esc(base)}/entry/${esc(e.id)}/</loc>${e.verified ? `<lastmod>${esc(e.verified)}</lastmod>` : ""}</url>`
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

function robotsTxt(site) {
  const base = site.siteUrl.replace(/\/+$/, "");
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}

function notFoundHtml(site) {
  const base = site.siteUrl.replace(/\/+$/, "");
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Not found - ${esc(site.title)}</title>
    <meta name="robots" content="noindex" />
    <link rel="icon" href="${esc(base)}/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="${esc(base)}/styles.css" />
  </head>
  <body>
    <main class="section">
      <h1>Not found</h1>
      <p>That page is not part of this catalog.</p>
      <p>Looking for an entry? <a href="${esc(base)}/#catalog">Search the catalog</a>.</p>
      <div id="suggestions"></div>
      <p class="hero-actions">
        <a class="btn" href="${esc(base)}/">Back to the catalog</a>
      </p>
    </main>
    <script src="${esc(base)}/data.js" defer></script>
    <script src="${esc(base)}/not-found.js" defer></script>
  </body>
</html>
`;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (fs.statSync(from).isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

/** Returns file => link resolver for links in that file's body (`file.path` is repo-relative). */
function linkResolvers(entries, config, entryBase = "../") {
  const idByPath = new Map(entries.map((e) => [e.path, e.id]));
  const kindOf = (repoPath) => {
    const full = path.join(ROOT, repoPath);
    if (!fs.existsSync(full)) return null;
    return fs.statSync(full).isDirectory() ? "dir" : "file";
  };
  return (file) => makeLinkResolver({ entryPath: file.path, idByPath, repo: config.site.repo, kindOf, entryBase });
}

/** Reads stacks/*.md, checks them (V15) and resolves each pick to its entry. */
function loadStacks(entries, vocab, spdxAllowed) {
  const { files, stray } = listStackFiles(ROOT);
  const terms = licenceTerms(vocab, spdxAllowed);
  const byPath = new Map(entries.map((e) => [e.path, e]));
  const errors = [
    ...stray.map((rel) => `${rel}: stacks live directly in stacks/; the build does not read subfolders`),
    ...checkStacks(files, byPath, terms, latestAllowedDate()),
  ];
  if (errors.length) return { stacks: [], errors };
  const stacks = files.map(({ rel, text }) => {
    const parsed = parseStack(text, { file: rel, terms });
    const picked = parsed.sections.flatMap((s) =>
      s.picks.map((p) => ({ ...p, section: s.name, entry: byPath.get(pickPath(rel, p.href)) }))
    );
    return { ...parsed, rel, picked };
  });
  return { stacks, errors };
}

/** Writes dist/stack/<id>/index.html for every stack. */
function writeStackPages({ stacks, entries, config, stats, stamp, hasCard, now }) {
  const errors = [];
  const written = [];
  const resolverFor = linkResolvers(entries, config, "../../entry/");
  for (const stack of stacks) {
    try {
      const resolveLink = resolverFor({ path: stack.rel });
      const leadHtml = renderBlocks(stack.lead, { file: stack.rel, resolveLink, firstLine: stack.leadLine });
      const sections = stack.sections.map((s) => ({
        name: s.name,
        rows: stack.picked
          .filter((p) => p.section === s.name)
          .map((p) => ({ need: p.need, entry: p.entry, whyHtml: renderInline(p.why, resolveLink) })),
      }));
      const gapsHtml = stack.gaps.map((g) => renderInline(g.text, resolveLink));
      const html = stackPageHtml({
        stack,
        sections,
        gapsHtml,
        leadHtml,
        owed: owes(stack.picked),
        site: config.site,
        stamp,
        total: stats.total,
        hasCard,
        now,
      });
      const dir = path.join(DIST, "stack", stack.meta.id);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), html);
      written.push(`stack/${stack.meta.id}/index.html`);
    } catch (err) {
      if (err instanceof MarkdownError || err instanceof LinkError) errors.push(err.message);
      else throw err;
    }
  }
  return { errors, written };
}

function stackRowsHtml(stacks) {
  return stacks
    .map((s) => `<li><a href="stack/${esc(s.meta.id)}/">${esc(s.meta.title)}<span>${esc(s.meta.task)}</span></a></li>`)
    .join("\n");
}

/** Writes dist/entry/<id>/index.html for every entry. */
function writeEntryPages({ entries, bodies, config, stats, stamp, hasCard, now, usedIn = new Map() }) {
  const errors = [];
  const written = [];
  const resolverFor = linkResolvers(entries, config);
  // Prev/next follow the homepage's default order: category, then name.
  const visible = entries.filter((e) => e.status !== "deprecated");
  const neighbours = new Map();
  for (const cat of Object.keys(config.categories)) {
    const group = visible.filter((e) => e.category === cat);
    group.forEach((e, i) => neighbours.set(e.id, { prev: group[i - 1] || null, next: group[i + 1] || null }));
  }
  for (const entry of entries) {
    const body = bodies.get(entry.id) || "";
    const file = `${entry.path} (body)`;
    try {
      const resolveLink = resolverFor(entry);
      const { lead, rest, restFirstLine } = splitEntryBody(body);
      const leadHtml = renderBlocks(lead, { file, resolveLink });
      const restHtml = renderBlocks(rest, { file, resolveLink, firstLine: restFirstLine });
      const reason = entry.status === "deprecated" ? deprecationReason(body) : null;
      const { prev = null, next = null } = neighbours.get(entry.id) || {};
      const html = entryPageHtml({
        entry,
        leadHtml,
        restHtml,
        deprecatedReasonHtml: reason ? renderInline(reason, resolveLink) : null,
        prev,
        next,
        site: config.site,
        categoryLabel: config.categories[entry.category]?.label || entry.category,
        stamp,
        total: stats.total,
        hasCard,
        now,
        stacks: usedIn.get(entry.id) || [],
      });
      const dir = path.join(DIST, "entry", entry.id);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), html);
      written.push(`entry/${entry.id}/index.html`);
    } catch (err) {
      if (err instanceof MarkdownError || err instanceof LinkError) errors.push(err.message);
      else throw err;
    }
  }
  return { errors, written };
}

/** Runs the page checks over dist-relative files. */
function checkPages(files) {
  const kindOf = (rel) => {
    const full = path.join(DIST, rel);
    if (!fs.existsSync(full)) return null;
    if (fs.statSync(full).isDirectory()) return fs.existsSync(path.join(full, "index.html")) ? "dir" : null;
    return "file";
  };
  return files.flatMap((f) => checkPage(fs.readFileSync(path.join(DIST, f), "utf8"), { file: f, kindOf }));
}

function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const vocab = JSON.parse(fs.readFileSync(VOCAB_PATH, "utf8"));
  const formatVocab = JSON.parse(fs.readFileSync(FORMATS_PATH, "utf8"));
  const { entries, errors, bodies } = loadEntries(vocab);
  const spdxAllowed = JSON.parse(fs.readFileSync(SPDX_ALLOWED_PATH, "utf8"));
  const { stacks, errors: stackErrors } = loadStacks(entries, vocab, spdxAllowed);
  // Entry id => the stacks that pick it, for "Used in" on entry pages.
  const usedIn = new Map();
  for (const s of stacks) {
    for (const p of s.picked) {
      const list = usedIn.get(p.entry.id) || [];
      if (!list.some((x) => x.id === s.meta.id)) list.push({ id: s.meta.id, title: s.meta.title });
      usedIn.set(p.entry.id, list);
    }
  }

  // An entry that cannot be read must stop the build: carrying on would
  // publish a site with that entry, and any featured slot for it, missing.
  if (errors.length) {
    console.error(`Build failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const repoUrl = config.site.repo;
  const featuredRaw = config.featured || [];
  const featured = featuredRaw
    .map((item) => {
      const id = typeof item === "string" ? item : item?.id;
      const need = typeof item === "string" ? null : item?.need || null;
      const entry = entries.find((e) => e.id === id);
      if (!entry) return null;
      return { ...entry, need };
    })
    .filter(Boolean);

  const stats = {
    total: entries.length,
    active: entries.filter((e) => e.status === "active").length,
    needsReview: entries.filter((e) => e.status === "needs-review").length,
    deprecated: entries.filter((e) => e.status === "deprecated").length,
    commercialOk: entries.filter((e) => e.commercial === true).length,
    commercialVaries: entries.filter((e) => e.commercial === "varies").length,
    categories: Object.keys(config.categories).length,
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    site: config.site,
    categories: config.categories,
    guides: config.guides,
    featured,
    stats,
    // Choices for the Licence and Format filters (app.js).
    filters: {
      licenseFamilies: Object.fromEntries(
        Object.entries(vocab.families || {})
          .filter(([key]) => !key.startsWith("_"))
          .map(([key, fam]) => [key, fam.label])
      ),
      formatGroups: formatVocab.groups,
    },
    entries,
  };

  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(PUBLIC, DIST);
  const hasCard = fs.existsSync(OG_CARD_SRC);
  if (hasCard) fs.copyFileSync(OG_CARD_SRC, path.join(DIST, OG_CARD_NAME));
  // data.json is the public machine-readable catalog (see site/README.md);
  // the page itself loads data.js.
  fs.writeFileSync(path.join(DIST, "data.json"), JSON.stringify(payload, null, 2));
  fs.writeFileSync(
    path.join(DIST, "data.js"),
    `window.__CATALOG__ = ${JSON.stringify(payload)};\n`
  );

  // Prerender. The served HTML must be complete without JavaScript: this is a
  // catalog whose whole value is that its entries can be found.
  const now = Date.now();
  const indexPath = path.join(DIST, "index.html");
  const stamp = payload.generatedAt.slice(0, 10);
  const visible = entries.filter((e) => e.status !== "deprecated");
  const fresh = freshnessStats(entries, now);
  const substitutions = {
    FRESHNESS_LINE: freshnessLineHtml(fresh, stamp, "freshness/"),
    HEAD_META: headMetaHtml(config.site, stats, payload.generatedAt, hasCard),
    STACK_ROWS: stackRowsHtml(stacks),
    STARTER_ROWS: starterRowsHtml(featured),
    ENTRY_ROWS: groupedRowsHtml(visible, config.categories, repoUrl, now),
    CATEGORY_CHIPS: categoryChipsHtml(visible, config.categories),
    GUIDE_ROWS: guideRowsHtml(config.guides, repoUrl),
    CATALOG_BLURB: `${stats.total} sources &middot; ${stats.active} active &middot; ${stats.commercialOk} commercial-ok &middot; ${stats.commercialVaries} per-file &middot; ${stats.deprecated} deprecated`,
    RESULT_COUNT: `${visible.length} of ${stats.total} entries shown`,
    FOOTER_STAMP: `Built ${esc(stamp)} from ${stats.total} catalog entries.`,
  };
  let html = fs.readFileSync(indexPath, "utf8");
  const missingMarkers = Object.keys(substitutions).filter((key) => !html.includes(`<!--${key}-->`));
  if (missingMarkers.length) {
    console.error(`Build failed: site/public/index.html is missing ${missingMarkers.map((k) => `<!--${k}-->`).join(", ")}`);
    process.exit(1);
  }
  for (const [key, value] of Object.entries(substitutions)) {
    // A function replacement, so a "$" in the value is never read as a pattern.
    html = html.replace(`<!--${key}-->`, () => value);
  }
  fs.writeFileSync(indexPath, html);

  fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemapXml(config.site, visible, stacks));
  fs.writeFileSync(path.join(DIST, "robots.txt"), robotsTxt(config.site));
  fs.writeFileSync(path.join(DIST, "404.html"), notFoundHtml(config.site));
  fs.mkdirSync(path.join(DIST, "freshness"), { recursive: true });
  fs.writeFileSync(
    path.join(DIST, "freshness", "index.html"),
    freshnessPageHtml({ stats: fresh, site: config.site, stamp, total: stats.total, hasCard })
  );

  const pages = writeEntryPages({ entries, bodies, config, stats, stamp, hasCard, now, usedIn });
  const stackPages = writeStackPages({ stacks, entries, config, stats, stamp, hasCard, now });
  const pageErrors = [
    ...stackErrors,
    ...pages.errors,
    ...stackPages.errors,
    ...checkPages(["index.html", "freshness/index.html", ...pages.written, ...stackPages.written]),
  ];
  if (pageErrors.length) {
    console.error(`Page build failed (${pageErrors.length}):`);
    for (const e of pageErrors.slice(0, 50)) console.error(`  - ${e}`);
    process.exit(1);
  }

  // After the page gate: every body link has resolved by now, so the llms
  // files cannot hit a link error of their own.
  fs.writeFileSync(path.join(DIST, "llms.txt"), llmsTxt({ entries, site: config.site, categories: config.categories, stacks }));
  fs.writeFileSync(
    path.join(DIST, "llms-full.txt"),
    llmsFullTxt({
      entries,
      site: config.site,
      categories: config.categories,
      bodies,
      resolverFor: linkResolvers(entries, config),
      stacks,
    })
  );

  console.log(
    `Built ${entries.length} entries → site/dist (${stats.active} active, ${stats.commercialOk} commercial-ok, ${stats.commercialVaries} per-file)`
  );
  console.log(
    `Prerendered ${visible.length} entry rows into index.html; wrote ${pages.written.length} entry pages, ${stackPages.written.length} stack pages, sitemap.xml, robots.txt, 404.html, freshness/index.html`
  );
}

main();

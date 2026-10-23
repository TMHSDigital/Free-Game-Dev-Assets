#!/usr/bin/env node
/**
 * Build GitHub Pages site from catalog markdown frontmatter.
 * Add/edit one catalog/<category>/<id>.md → rebuild regenerates everything.
 *
 *   node site/build.mjs [--clean]
 *
 * The build is incremental on disk: it writes only the files whose bytes
 * changed and prunes what an earlier build left, so a no-change rebuild is
 * fast on a slow drive. --clean empties site/dist first; the output is the
 * same either way.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { baseHeadHtml, commercialLabel, headAssetsHtml, ENGINE_LOCK_LABELS, ENGINE_LOCK_NOTES, esc, latestAllowedDate, MAINTENANCE_NOTES, OG_CARD_NAME, PERSPECTIVE_LABELS, sponsorButtonHtml, verifiedAge } from "./lib/shared.mjs";
import { parseFrontmatter, summaryFromBody } from "./lib/frontmatter.mjs";
import { listEntryFiles } from "./lib/entry-files.mjs";
import { entryPageHtml, scriptJson } from "./lib/entry-page.mjs";
import { LinkError, makeLinkResolver } from "./lib/links.mjs";
import { atomFeed, catalogCsv, homeJsonLd, sitemapXml } from "./lib/exports.mjs";
import { llmsFullTxt, llmsTxt } from "./lib/llms.mjs";
import { deprecationReason, MarkdownError, renderBlocks, renderInline, splitEntryBody } from "./lib/markdown.mjs";
import { checkPage } from "./lib/page-checks.mjs";
import { checkStacks } from "./checks.mjs";
import { stackPageHtml } from "./lib/stack-page.mjs";
import { freshnessLineHtml, freshnessPageHtml, freshnessStats, newEntriesLineHtml } from "./lib/freshness.mjs";
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
const OG_CARD_SRC = path.join(ROOT, "docs", "images", "readme", OG_CARD_NAME);

/** Sort rank for "license permissiveness": least owed first. */
const ATTRIBUTION_RANK = { none: 0, notice: 1, required: 2, any: 3 };

/** The Licence-filter family a license value belongs to (license-vocabulary.json `families`). */
function licenseFamily(vocab, license) {
  for (const [key, fam] of Object.entries(vocab.families || {})) {
    if (Array.isArray(fam.licenses) && fam.licenses.includes(license)) return key;
  }
  return "mixed";
}

function loadEntries(vocab) {
  const files = listEntryFiles(CATALOG);
  const entries = [];
  const errors = [];
  const bodies = new Map();
  // validate.mjs catches a duplicate id too, but a local `npm run build` must
  // not quietly write one entry's page over another's.
  const fileOfId = new Map();

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
    if (fileOfId.has(String(meta.id))) {
      errors.push(`duplicate id "${meta.id}": ${fileOfId.get(String(meta.id))} and ${rel}`);
      continue;
    }
    fileOfId.set(String(meta.id), rel);
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
      added: meta.added ? String(meta.added) : null,
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
      ...(meta.engine_lock ? { engine_lock: String(meta.engine_lock) } : {}),
      ...(meta.ue_versions ? { ue_versions: String(meta.ue_versions) } : {}),
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
function maintenanceFlagHtml(entry) {
  if (!entry.maintenance) return "";
  const title = MAINTENANCE_NOTES[entry.maintenance] || "";
  return ` <span class="maintenance-flag" title="${esc(title)}">${esc(entry.maintenance)}</span>`;
}

function engineLockFlagHtml(entry) {
  if (!entry.engine_lock) return "";
  const title = ENGINE_LOCK_NOTES[entry.engine_lock] || "";
  return ` <span class="engine-flag" title="${esc(title)}">${esc(ENGINE_LOCK_LABELS[entry.engine_lock] || entry.engine_lock)}</span>`;
}

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
      <span class="entry-flags">${flags}${maintenanceFlagHtml(entry)}${engineLockFlagHtml(entry)}</span>
    </div>
    <p>${esc(entry.summary || "")}</p>
    <div class="meta-line">
      <span>${esc(entry.category)}</span>${formats}${taxonomy}
      <span class="verified is-${age.bucket}" data-verified="${esc(entry.verified || "")}" title="Licence last checked at the source">${esc(ageText)}</span>
    </div>
    <div class="entry-links">
      <a href="${esc(entry.url)}" rel="noopener noreferrer">Open source</a>
      <a href="${esc(`${repo}/blob/main/${entry.path}`)}" rel="noopener noreferrer">Entry and evidence</a>
      <button type="button" class="link-button shortlist-toggle" data-shortlist="${esc(entry.id)}" aria-pressed="false" data-name="${esc(entry.name)}" aria-label="Add to shortlist: ${esc(entry.name)}" hidden>Add to shortlist</button>
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
  return [
    baseHeadHtml({ site, title: site.title, description: site.tagline, url: site.siteUrl, hasCard, root: "./" }),
    `<meta name="generator" content="site/build.mjs ${esc(generatedAt)}" />`,
    `<meta name="catalog:entries" content="${stats.total}" />`,
    `<script type="application/ld+json">${scriptJson(homeJsonLd({ site, generatedAt, total: stats.total }))}</script>`,
  ].join("\n    ");
}

/**
 * Repo-relative file => date of its last commit, from one `git log` over the
 * catalog and stacks. The sitemap's lastmod must never be earlier than the
 * last content change, and an entry's `verified` date is not that. Empty when
 * git is unavailable (a tarball, a shallow CI checkout with no history).
 */
function lastCommitDates() {
  const dates = new Map();
  try {
    const out = execFileSync("git", ["log", "--format=%x00%cs", "--name-only", "--", "catalog", "stacks"], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
    let date = null;
    for (const line of out.split("\n")) {
      if (line.startsWith("\0")) {
        date = line.slice(1).trim();
        continue;
      }
      const file = line.trim();
      // Newest commit first, so the first date seen for a file is its latest.
      if (file && date && !dates.has(file)) dates.set(file, date);
    }
  } catch {
    // No git: the sitemap falls back to the build date.
  }
  return dates;
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
    ${headAssetsHtml(`${base}/`).join("\n    ")}
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
    <script type="module" src="${esc(base)}/not-found.js"></script>
  </body>
</html>
`;
}

/*
 * Output goes through one writer that creates a directory once, writes a
 * file only when its bytes changed and remembers every path it produced, so
 * the build can prune what an earlier build left behind instead of wiping
 * dist/ and recreating 420 directories (94% of the build time on a slow
 * disk). `--clean` still wipes first; the result is byte-identical either way.
 */
const produced = new Set();
const madeDirs = new Set();
let writes = 0;

function ensureDir(dir) {
  if (madeDirs.has(dir)) return;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  madeDirs.add(dir);
}

/** Writes `content` (string or Buffer) to dist-relative `rel` if it differs. */
function writeOut(rel, content) {
  const full = path.join(DIST, rel);
  produced.add(rel.split(path.sep).join("/"));
  ensureDir(path.dirname(full));
  const next = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
  if (fs.existsSync(full)) {
    const stat = fs.statSync(full);
    if (stat.isFile() && stat.size === next.length && fs.readFileSync(full).equals(next)) return;
  }
  fs.writeFileSync(full, next);
  writes += 1;
}

/** Copies a file into dist (through writeOut, so unchanged files are left alone). */
function copyOut(src, rel) {
  writeOut(rel, fs.readFileSync(src));
}

/** Everything under site/public except the names in `skip`, dist-relative paths kept. */
function copyPublic(src, skip, prefix = "") {
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (fs.statSync(from).isDirectory()) copyPublic(from, skip, rel);
    else if (!skip.has(rel)) copyOut(from, rel);
  }
}

/** Removes every file and directory in dist that this build did not produce. */
function pruneDist(dir = DIST, prefix = "") {
  let kept = 0;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (fs.statSync(full).isDirectory()) {
      if (pruneDist(full, rel) === 0) fs.rmSync(full, { recursive: true, force: true });
      else kept += 1;
    } else if (produced.has(rel)) kept += 1;
    else fs.rmSync(full, { force: true });
  }
  return kept;
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
      writeOut(path.join("stack", stack.meta.id, "index.html"), html);
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
      writeOut(path.join("entry", entry.id, "index.html"), html);
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
  // Link targets resolve against what this build produced, not what is on
  // disk: an incremental build still has last time's pages there until
  // pruneDist runs, and a link to a removed entry must fail now.
  const kindOf = (rel) => {
    if (produced.has(rel)) return "file";
    if (produced.has(rel ? `${rel}/index.html` : "index.html")) return "dir";
    return null;
  };
  return files.flatMap((f) => checkPage(fs.readFileSync(path.join(DIST, f), "utf8"), { file: f, kindOf }));
}

function main() {
  const started = Date.now();
  const clean = process.argv.includes("--clean");
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const vocab = JSON.parse(fs.readFileSync(VOCAB_PATH, "utf8"));
  const formatVocab = JSON.parse(fs.readFileSync(FORMATS_PATH, "utf8"));
  const { entries, errors, bodies } = loadEntries(vocab);

  // An entry that cannot be read must stop the build: carrying on would
  // publish a site with that entry, and any featured slot for it, missing.
  // Checked before the stacks load, so a broken entry does not hide a stack
  // error until the next run.
  if (errors.length) {
    console.error(`Build failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

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

  const generatedAt = new Date().toISOString();
  const payload = {
    generatedAt,
    // Calendar version, the tag a dataset release carries (release.yml).
    version: process.env.CATALOG_VERSION || `v${generatedAt.slice(0, 10).replaceAll("-", ".")}`,
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

  // Empty dist rather than remove it: on Windows a server or editor holding the
  // folder open makes removing the folder itself fail with EPERM/EBUSY.
  ensureDir(DIST);
  if (clean) for (const name of fs.readdirSync(DIST)) fs.rmSync(path.join(DIST, name), { recursive: true, force: true });
  // index.html is a template; its filled-in version is written below.
  copyPublic(PUBLIC, new Set(["index.html"]));
  // The shortlist builds its CREDITS file with the same code as the stack pages.
  copyOut(path.join(__dirname, "lib", "owes.mjs"), "owes.js");
  // The catalog search and the 404 page's guesses, tested in lib.test.mjs.
  copyOut(path.join(__dirname, "lib", "search.mjs"), "search.js");
  const hasCard = fs.existsSync(OG_CARD_SRC);
  if (hasCard) copyOut(OG_CARD_SRC, OG_CARD_NAME);
  // data.json is the public machine-readable catalog (see site/README.md);
  // the page itself loads data.js.
  writeOut("data.json", JSON.stringify(payload, null, 2));
  writeOut("data.js", `window.__CATALOG__ = ${JSON.stringify(payload)};\n`);
  writeOut("catalog.csv", catalogCsv(entries, config.site.siteUrl));
  writeOut("feed.xml", atomFeed({ entries, site: config.site, generatedAt: payload.generatedAt, kind: "added" }));
  writeOut("reverified.xml", atomFeed({ entries, site: config.site, generatedAt: payload.generatedAt, kind: "verified" }));

  // Prerender. The served HTML must be complete without JavaScript: this is a
  // catalog whose whole value is that its entries can be found.
  const now = Date.now();
  const stamp = payload.generatedAt.slice(0, 10);
  const visible = entries.filter((e) => e.status !== "deprecated");
  const fresh = freshnessStats(entries, now);
  const substitutions = {
    FRESHNESS_LINE: freshnessLineHtml(fresh, stamp, "freshness/"),
    NEW_LINE: newEntriesLineHtml(visible, stamp),
    HEAD_META: headMetaHtml(config.site, stats, payload.generatedAt, hasCard),
    STACK_ROWS: stackRowsHtml(stacks),
    STARTER_ROWS: starterRowsHtml(featured),
    ENTRY_ROWS: groupedRowsHtml(visible, config.categories, repoUrl, now),
    CATEGORY_CHIPS: categoryChipsHtml(visible, config.categories),
    GUIDE_ROWS: guideRowsHtml(config.guides, repoUrl),
    CATALOG_BLURB: `${stats.total} sources &middot; ${stats.active} active &middot; ${stats.commercialOk} commercial-ok &middot; ${stats.commercialVaries} per-file &middot; ${stats.deprecated} deprecated`,
    RESULT_COUNT: `${visible.length} of ${stats.total} entries shown`,
    SPONSOR_BUTTON: sponsorButtonHtml(),
    FOOTER_STAMP: `Built ${esc(stamp)} from ${stats.total} catalog entries.`,
  };
  let html = fs.readFileSync(path.join(PUBLIC, "index.html"), "utf8");
  const missingMarkers = Object.keys(substitutions).filter((key) => !html.includes(`<!--${key}-->`));
  if (missingMarkers.length) {
    console.error(`Build failed: site/public/index.html is missing ${missingMarkers.map((k) => `<!--${k}-->`).join(", ")}`);
    process.exit(1);
  }
  for (const [key, value] of Object.entries(substitutions)) {
    // A function replacement, so a "$" in the value is never read as a pattern.
    html = html.replaceAll(`<!--${key}-->`, () => value);
  }
  writeOut("index.html", html);

  writeOut("sitemap.xml", sitemapXml({ site: config.site, entries: visible, stacks, stamp, modified: lastCommitDates() }));
  writeOut("robots.txt", robotsTxt(config.site));
  writeOut("404.html", notFoundHtml(config.site));
  writeOut(path.join("freshness", "index.html"), freshnessPageHtml({ stats: fresh, site: config.site, stamp, total: stats.total, hasCard }));

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

  // After the page gate: every body link has resolved by now, and the llms
  // files read links with the same LINK_RE, so they cannot hit a link error
  // of their own.
  writeOut("llms.txt", llmsTxt({ entries, site: config.site, categories: config.categories, stacks }));
  writeOut(
    "llms-full.txt",
    llmsFullTxt({
      entries,
      site: config.site,
      categories: config.categories,
      bodies,
      resolverFor: linkResolvers(entries, config),
      stacks,
    })
  );

  // Pages of entries that left the catalog, and anything else an earlier
  // build wrote, go now; what remains is exactly a clean build's output.
  pruneDist();

  console.log(
    `Built ${entries.length} entries → site/dist (${stats.active} active, ${stats.commercialOk} commercial-ok, ${stats.commercialVaries} per-file)`
  );
  console.log(
    `Prerendered ${visible.length} entry rows into index.html; wrote ${pages.written.length} entry pages, ${stackPages.written.length} stack pages, sitemap.xml, robots.txt, 404.html, freshness/index.html`
  );
  console.log(`${writes} of ${produced.size} output files changed${clean ? " (clean build)" : ""}; ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main();

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
import { BROWSER_MODULES, isListed, esc, latestAllowedDate, OG_CARD_NAME, opensearchXml, siteFooterHtml, siteHeaderHtml } from "./lib/shared.mjs";
import { bodySearchText } from "./lib/search.mjs";
import { filmstripHtml, groupedEntriesHtml } from "./lib/cards.mjs";
import { guidePageHtml } from "./lib/guide-page.mjs";
import { renderGuide } from "./lib/guide-render.mjs";
import { categoryPageHtml } from "./lib/category-page.mjs";
import { filmstripPick, isAttributionLicence, previewCredit, thumbRelPath } from "./lib/thumbs.mjs";
import { summaryFromBody } from "./lib/frontmatter.mjs";
import { readCatalog, idMatchesFile } from "./lib/entry-files.mjs";
import { normalizeEntry, RENDER_REQUIRED } from "./lib/entry-fields.mjs";
import { cliArgs } from "./lib/cli.mjs";
import { entryPageHtml } from "./lib/entry-page.mjs";
import { LinkError, makeLinkResolver, caseMismatch } from "./lib/links.mjs";
import { atomFeed, catalogCsv, commitDatesFromLog, DATED_PATHS, sitemapXml } from "./lib/exports.mjs";
import { schemaErrors } from "./lib/schema-check.mjs";
import { llmsFullTxt, llmsTxt } from "./lib/llms.mjs";
import { deprecationReason, MarkdownError, renderBlocks, renderInline, reviewQuestion, splitEntryBody } from "./lib/markdown.mjs";
import { checkPage, pageIds } from "./lib/page-checks.mjs";
import { checkStacks } from "./checks.mjs";
import { stackPageHtml } from "./lib/stack-page.mjs";
import { freshnessLineHtml, freshnessPageHtml, freshnessStats, newEntriesLineHtml } from "./lib/freshness.mjs";
import { licenceTerms, listStackFiles, owes, parseStack, pickPath } from "./lib/stacks.mjs";
import { createDistWriter } from "./lib/dist-writer.mjs";
import { ATTRIBUTION_RANK, categoryChipsHtml, guideRowsHtml, headMetaHtml, licenseFamily, notFoundHtml, robotsTxt, stackRowsHtml, starterRowsHtml } from "./lib/home-page.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const PUBLIC = path.join(__dirname, "public");
const DIST = path.join(__dirname, "dist");
const CONFIG_PATH = path.join(__dirname, "config.json");
const VOCAB_PATH = path.join(__dirname, "license-vocabulary.json");
const SPDX_ALLOWED_PATH = path.join(__dirname, "spdx-allowed.json");
const FORMATS_PATH = path.join(__dirname, "format-vocabulary.json");
const THUMBS_MANIFEST = path.join(__dirname, "thumbs.json");
// Social preview image: a first-party screenshot of this site, kept with the
// other first-party stills (the validator allows binaries there) and copied
// into dist at build time.
const OG_CARD_SRC = path.join(ROOT, "docs", "images", "readme", OG_CARD_NAME);

/** site/thumbs.json: id => { width, height, ... } for every committed thumbnail (site/thumbs.mjs). */
function loadThumbs() {
  if (!fs.existsSync(THUMBS_MANIFEST)) return {};
  return JSON.parse(fs.readFileSync(THUMBS_MANIFEST, "utf8")).thumbs || {};
}

function loadEntries(vocab) {
  const records = readCatalog(CATALOG, { root: ROOT });
  const thumbs = loadThumbs();
  const entries = [];
  const errors = [];
  const bodies = new Map();
  // validate.mjs catches a duplicate id too, but a local `npm run build` must
  // not quietly write one entry's page over another's.
  const fileOfId = new Map();

  for (const { file, rel, parsed } of records) {
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
    // validate requires every REQUIRED_KEYS field; these are the ones a page
    // cannot be written without, so a local build stops on them too.
    const missing = RENDER_REQUIRED.filter((k) => meta[k] === undefined || meta[k] === null || meta[k] === "");
    if (missing.length) {
      errors.push(`${rel} missing: ${missing.join(", ")}`);
      continue;
    }
    if (fileOfId.has(String(meta.id))) {
      errors.push(`duplicate id "${meta.id}": ${fileOfId.get(String(meta.id))} and ${rel}`);
      continue;
    }
    // Page and thumbnail paths are built from the id; never from one that
    // could leave dist (validate reports the same mismatch with a line).
    if (!idMatchesFile(meta.id, rel)) {
      throw new Error(`${rel}: id "${meta.id}" must be short kebab-case and match the file name (node site/validate.mjs explains)`);
    }
    fileOfId.set(String(meta.id), rel);
    bodies.set(String(meta.id), body);

    // The shared reading of the frontmatter (entry-fields.mjs, #256);
    // preview is an instruction to thumbs.mjs, not exported.
    const { preview: _preview, ...fields } = normalizeEntry(meta, rel);
    entries.push({
      ...fields,
      page: `entry/${String(meta.id)}/`,
      summary: summaryFromBody(body),
      // What a needs-review entry still has to settle (#211).
      ...(reviewQuestion(body) ? { review: reviewQuestion(body) } : {}),
      // The publisher's preview, when the licence gate let the script keep one.
      thumb: thumbs[String(meta.id)]
        ? {
            path: thumbRelPath(String(meta.id)),
            width: thumbs[String(meta.id)].width,
            height: thumbs[String(meta.id)].height,
            // CC-BY: the creator is named on the card too, not only on the entry page.
            ...(isAttributionLicence(meta.license) ? { credit: previewCredit(meta) } : {}),
          }
        : null,
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

/**
 * Repo-relative file => date of its last commit, from one `git log` over the
 * catalog, stacks and docs (DATED_PATHS). The sitemap's lastmod must never be earlier than the
 * last content change, and an entry's `verified` date is not that. Empty when
 * git is unavailable (a tarball); a shallow checkout dates every file to HEAD.
 */
function lastCommitDates() {
  const git = (args) =>
    execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
  try {
    // The dates depend only on the commits, so they are cached per HEAD inside
    // .git (never published, never committed): a no-change rebuild skips the
    // full-history log, whose cost grows with every commit (#262).
    const [gitDir, head] = git(["rev-parse", "--git-dir", "HEAD"]).trim().split("\n");
    const cacheFile = path.resolve(ROOT, gitDir, "fgda-commit-dates.json");
    const key = `${head} ${DATED_PATHS.join(",")}`;
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      if (cached.key === key) return new Map(Object.entries(cached.dates));
    } catch {
      // No cache yet, or an unreadable one: rebuild it below.
    }
    const dates = commitDatesFromLog(git(["log", "--format=%x00%cs", "--name-only", "--", ...DATED_PATHS]));
    try {
      fs.writeFileSync(cacheFile, JSON.stringify({ key, dates: Object.fromEntries(dates) }));
    } catch {
      // A read-only .git still builds; it just reads the log every time.
    }
    return dates;
  } catch {
    // No git: the sitemap falls back to the build date.
    return new Map();
  }
}

// Output writer: writes only changed bytes and prunes what it did not produce (lib/dist-writer.mjs).
const { ensureDir, writeOut, pruneDist, produced, writes } = createDistWriter(DIST);

/** Copies a file into dist (through writeOut, so unchanged files are left alone). */
function copyOut(src, rel) {
  writeOut(rel, fs.readFileSync(src));
}

/**
 * Everything under site/public except the names in `skip`, dist-relative paths
 * kept. A symlink stops the build: following it would publish whatever it
 * points at on the machine that runs the build.
 */
function copyPublic(src, skip, prefix = "") {
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    const stat = fs.lstatSync(from);
    if (stat.isSymbolicLink()) throw new Error(`site/public/${rel} is a symlink; the build copies only real files`);
    if (stat.isDirectory()) copyPublic(from, skip, rel);
    else if (!skip.has(rel)) copyOut(from, rel);
  }
}

/** Returns file => link resolver for links in that file's body (`file.path` is repo-relative). */
function linkResolvers(entries, config, entryBase = "../") {
  const idByPath = new Map(entries.map((e) => [e.path, e.id]));
  const realRoot = fs.realpathSync.native(ROOT);
  const kindOf = (repoPath) => {
    const full = path.join(ROOT, repoPath);
    if (!fs.existsSync(full)) return null;
    // A wrong-case link resolves here on Windows and macOS but not on Linux.
    if (caseMismatch(repoPath, path.relative(realRoot, fs.realpathSync.native(full)))) return null;
    return fs.statSync(full).isDirectory() ? "dir" : "file";
  };
  const nameById = new Map(entries.map((e) => [e.id, e.name]));
  return (file) => makeLinkResolver({ entryPath: file.path, idByPath, repo: config.site.repo, kindOf, entryBase, nameById });
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
        total: stats.listed,
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

/** Writes dist/entry/<id>/index.html for every entry. */
function writeEntryPages({ entries, bodies, config, stats, stamp, hasCard, now, usedIn = new Map() }) {
  const errors = [];
  const written = [];
  const resolverFor = linkResolvers(entries, config);
  // Prev/next follow the homepage's default order: category, then name.
  const visible = entries.filter(isListed);
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
        total: stats.listed,
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

/** Writes dist/category/<id>/index.html for every configured category with a visible entry. */
function writeCategoryPages({ entries, config, stats, stamp, hasCard, now }) {
  const written = [];
  for (const [cat, meta] of Object.entries(config.categories)) {
    const group = entries.filter((e) => e.category === cat);
    if (!group.length) continue;
    writeOut(
      path.join("category", cat, "index.html"),
      categoryPageHtml({ cat, meta, entries: group, site: config.site, stamp, total: stats.listed, hasCard, now })
    );
    written.push(`category/${cat}/index.html`);
  }
  return { written };
}

/**
 * docs/ guides as guide/<id>/ pages. Links to entries go to their pages,
 * links to another guide go to its page, anything else to GitHub.
 */
function writeGuidePages({ entries, config, stats, stamp, hasCard, modified = new Map() }) {
  const written = [];
  const errors = [];
  const resolverFor = linkResolvers(entries, config, "../../entry/");
  const guideByPath = new Map((config.guides || []).map((g) => [g.path, g.id]));
  for (const guide of config.guides || []) {
    const inner = resolverFor({ path: guide.path });
    const resolveLink = (raw) => {
      const m = String(raw).match(/^([^?#]*)((?:\?[^#]*)?(?:#.*)?)$/);
      if (m && m[1] && !/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
        let repoPath = null;
        try {
          repoPath = path.posix.normalize(path.posix.join(path.posix.dirname(guide.path), decodeURI(m[1])));
        } catch {
          // A malformed link falls through to the entry resolver, which reports it.
        }
        if (repoPath && guideByPath.has(repoPath)) {
          const id = guideByPath.get(repoPath);
          return { href: id === guide.id ? m[2] || "#content" : `../${id}/${m[2]}`, external: false };
        }
      }
      return inner(raw);
    };
    const source = path.join(ROOT, guide.path);
    if (!fs.existsSync(source)) {
      errors.push(`site/config.json guides: ${guide.path} (guide "${guide.id}") does not exist`);
      continue;
    }
    // Page errors (bad markdown, a broken link) are reported with the rest;
    // anything else is a bug in the build and stops it, as for entry pages.
    try {
      const rendered = renderGuide(fs.readFileSync(source, "utf8"), { file: guide.path, resolveLink });
      writeOut(path.join("guide", guide.id, "index.html"), guidePageHtml({ guide, rendered, site: config.site, stamp, total: stats.listed, hasCard, modified: modified.get(guide.path) || null }));
      written.push(`guide/${guide.id}/index.html`);
    } catch (err) {
      if (!(err instanceof MarkdownError || err instanceof LinkError)) throw err;
      errors.push(err.message);
    }
  }
  return { written, errors };
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
  // A #fragment is checked against the ids of the page it points at.
  const ids = new Map();
  const idsOf = (rel) => {
    if (!ids.has(rel)) {
      let found = null;
      try {
        found = pageIds(fs.readFileSync(path.join(DIST, rel), "utf8"));
      } catch {
        // Not a readable page: kindOf has already vouched for it existing.
      }
      ids.set(rel, found);
    }
    return ids.get(rel);
  };
  return files.flatMap((f) => checkPage(fs.readFileSync(path.join(DIST, f), "utf8"), { file: f, kindOf, idsOf }));
}

function main() {
  const started = Date.now();
  const clean = cliArgs({ clean: { type: "boolean" } }, "node site/build.mjs [--clean]").values.clean === true;
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
    // What every "N sources" line on the site says (#257).
    listed: entries.filter(isListed).length,
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
    // Stack ids and titles, so the 404 page can suggest a mistyped stack (#249).
    stacks: stacks.map((s) => ({ id: s.meta.id, title: s.meta.title })),
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

  // data.json is held to its published schema (site/data.schema.json), so a
  // renamed or retyped field fails here, before anything is written.
  const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "data.schema.json"), "utf8"));
  const schemaProblems = schemaErrors(schema, JSON.parse(JSON.stringify(payload)));
  if (schemaProblems.length) {
    console.error(`Build failed: data.json does not match site/data.schema.json (${schemaProblems.length}); update the schema with the change:`);
    for (const p of schemaProblems.slice(0, 20)) console.error(`  - ${p}`);
    process.exit(1);
  }

  // Empty dist rather than remove it: on Windows a server or editor holding the
  // folder open makes removing the folder itself fail with EPERM/EBUSY.
  ensureDir(DIST);
  if (clean) for (const name of fs.readdirSync(DIST)) fs.rmSync(path.join(DIST, name), { recursive: true, force: true });
  // index.html is a template; its filled-in version is written below.
  copyPublic(PUBLIC, new Set(["index.html"]));
  // Lib modules the browser loads (shared.mjs BROWSER_MODULES; none imports node:).
  for (const [out, src] of Object.entries(BROWSER_MODULES)) copyOut(path.join(__dirname, "lib", src), out);
  const hasCard = fs.existsSync(OG_CARD_SRC);
  if (hasCard) copyOut(OG_CARD_SRC, OG_CARD_NAME);
  // data.json is the public machine-readable catalog (see site/README.md);
  // the page itself loads data.js.
  writeOut("data.json", JSON.stringify(payload, null, 2));
  copyOut(path.join(__dirname, "data.schema.json"), "data.schema.json");
  writeOut("data.js", `window.__CATALOG__ = ${JSON.stringify(payload)};\n`);
  // Entry bodies for full-text search, fetched on the first search, not on
  // page load (#92). Listed entries only, as search shows.
  writeOut("search-bodies.json", JSON.stringify(Object.fromEntries(entries.filter(isListed).map((e) => [e.id, bodySearchText(bodies.get(e.id) || "")]))));
  writeOut("catalog.csv", catalogCsv(entries, config.site.siteUrl));
  writeOut("feed.xml", atomFeed({ entries, site: config.site, generatedAt: payload.generatedAt, kind: "added" }));
  writeOut("reverified.xml", atomFeed({ entries, site: config.site, generatedAt: payload.generatedAt, kind: "verified" }));
  // New sources per category, linked from each category page.
  for (const [id, meta] of Object.entries(config.categories)) {
    if (!entries.some((e) => e.category === id)) continue;
    writeOut(path.join("category", id, "feed.xml"), atomFeed({ entries, site: config.site, generatedAt: payload.generatedAt, kind: "added", category: { id, label: meta.label || id } }));
  }

  // Prerender. The served HTML must be complete without JavaScript: this is a
  // catalog whose whole value is that its entries can be found.
  const now = Date.now();
  const stamp = payload.generatedAt.slice(0, 10);
  const visible = entries.filter(isListed);
  const fresh = freshnessStats(entries, now);
  // The hero filmstrip draws from the categories that default to cards.
  const cardCategories = Object.entries(config.categories)
    .filter(([, meta]) => meta.view === "cards")
    .map(([cat]) => cat);
  const substitutions = {
    FRESHNESS_LINE: freshnessLineHtml(fresh, stamp, "freshness/"),
    NEW_LINE: newEntriesLineHtml(visible, stamp),
    HEAD_META: headMetaHtml(config.site, stats, payload.generatedAt, hasCard),
    STACK_ROWS: stackRowsHtml(stacks),
    STARTER_ROWS: starterRowsHtml(featured),
    // Each category shows its first few entries; the category pages hold the rest.
    ENTRY_ROWS: groupedEntriesHtml(visible, config.categories, { root: "", repo: repoUrl, now }),
    // The headline counts what the catalog lists; deprecated entries are hidden by default.
    HERO_COUNT: String(visible.length),
    FILMSTRIP: filmstripHtml(filmstripPick(visible, { count: 9, cardCategories }), { root: "" }),
    CATEGORY_CHIPS: categoryChipsHtml(visible, config.categories),
    GUIDE_ROWS: guideRowsHtml(config.guides),
    CATALOG_BLURB: `${visible.length} sources &middot; ${stats.active} active &middot; ${stats.commercialOk} commercial-ok &middot; ${stats.commercialVaries} per-file${stats.deprecated ? ` &middot; plus ${stats.deprecated} deprecated, hidden by default` : ""}`,
    // Deprecated entries are hidden until their switch is on, so they are not counted until then (app.js does the same).
    RESULT_COUNT: `${visible.length} of ${stats.listed} sources shown`,
    // The chrome every page shares (shared.mjs), so the homepage cannot drift from it (#253).
    SITE_HEADER: siteHeaderHtml({ root: "", repo: repoUrl }),
    SITE_FOOTER: siteFooterHtml({ root: "", stamp, total: stats.listed, repo: repoUrl }),
    REPO_URL: esc(repoUrl),
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

  const categoriesInSitemap = Object.keys(config.categories)
    .filter((cat) => visible.some((e) => e.category === cat))
    .map((id) => ({ id, lastmod: stamp }));
  const modified = lastCommitDates();
  writeOut("sitemap.xml", sitemapXml({ site: config.site, entries: visible, stacks, stamp, modified, categories: categoriesInSitemap, guides: config.guides }));
  writeOut("robots.txt", robotsTxt(config.site));
  writeOut("opensearch.xml", opensearchXml(config.site));
  writeOut("404.html", notFoundHtml(config.site));
  writeOut(path.join("freshness", "index.html"), freshnessPageHtml({ stats: fresh, site: config.site, stamp, total: stats.listed, hasCard }));

  const pages = writeEntryPages({ entries, bodies, config, stats, stamp, hasCard, now, usedIn });
  const stackPages = writeStackPages({ stacks, entries, config, stats, stamp, hasCard, now });
  const categoryPages = writeCategoryPages({ entries: visible, config, stats, stamp, hasCard, now });
  const guidePages = writeGuidePages({ entries, config, stats, stamp, hasCard, modified });
  const pageErrors = [
    ...stackErrors,
    ...pages.errors,
    ...stackPages.errors,
    ...guidePages.errors,
    ...checkPages(["index.html", "freshness/index.html", ...pages.written, ...stackPages.written, ...categoryPages.written, ...guidePages.written]),
  ];
  if (pageErrors.length) {
    console.error(`Page build failed (${pageErrors.length}):`);
    for (const e of pageErrors.slice(0, 50)) console.error(`  - ${e}`);
    process.exit(1);
  }

  // After the page gate: every body link has resolved by now, and the llms
  // files read links with the same LINK_RE, so they cannot hit a link error
  // of their own.
  writeOut("llms.txt", llmsTxt({ entries, site: config.site, categories: config.categories, stacks, guides: config.guides }));
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
    `Prerendered ${visible.length} entry rows into index.html; wrote ${pages.written.length} entry pages, ${stackPages.written.length} stack pages, ${categoryPages.written.length} category pages, ${guidePages.written.length} guide pages, sitemap.xml, robots.txt, 404.html, freshness/index.html`
  );
  console.log(`${writes()} of ${produced.size} output files changed${clean ? " (clean build)" : ""}; ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main();

#!/usr/bin/env node
/**
 * Catalog integrity checks. Run before every commit: node site/validate.mjs
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  empty,
  ENTRY_CHECKS,
  checkPreviewVocabulary,
  checkFeatured,
  checkAiGuide,
  checkThumbManifest,
  checkCategoryReadmeRows,
  checkComparisonLicences,
  checkCategorySets,
  checkCountTables,
  checkLicenceGuide,
  checkLineEndings,
  checkEntryCount,
  checkEntryText,
  checkMarkdownLinks,
  categoryFormOptions,
  hasEmoji,
  checkRepoFiles,
  checkPublisherConsistency,
  checkStacks,
  checkValueSpellings,
  markdownAnchors,
} from "./checks.mjs";
import { ANY_SCHEME_RE, EXTERNAL_SCHEME_RE, isListed, latestAllowedDate } from "./lib/shared.mjs";
import { readCatalog } from "./lib/entry-files.mjs";
import { licenceTerms, listStackFiles } from "./lib/stacks.mjs";
import { cliArgs } from "./lib/cli.mjs";

// No flags: a mistyped one fails instead of being ignored.
cliArgs({}, "node site/validate.mjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REAL_ROOT = fs.realpathSync.native(ROOT);
const CATALOG = path.join(ROOT, "catalog");
const CONFIG_PATH = path.join(__dirname, "config.json");
const SPDX_ALLOWED_PATH = path.join(__dirname, "spdx-allowed.json");
const VOCAB_PATH = path.join(__dirname, "license-vocabulary.json");
const ALIASES_PATH = path.join(__dirname, "value-aliases.json");
const FORMATS_PATH = path.join(__dirname, "format-vocabulary.json");
const STACKS = path.join(ROOT, "stacks");
// Hidden folders (.git, .claude worktrees, editor state) and local scratch
// space are not part of the repo's content. Used only for the markdown roots
// and as the fallback file list when git is not available.
const SKIP_WALK = new Set(["node_modules", "dist", "RESEARCH", "_scratch"]);
function walkFiles(dir, out = [], filter) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_WALK.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) {
      if (name.startsWith(".")) continue;
      walkFiles(full, out, filter);
      continue;
    }
    if (!filter || filter(full)) out.push(full);
  }
  return out;
}

/**
 * Every file git would commit (tracked, plus untracked files that are not
 * ignored), at any depth, with whether it is a symlink. Without git, the disk
 * walk stands in.
 */
function repoFiles() {
  try {
    const git = (args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
    const tracked = git(["ls-files", "-s", "-z"]).split("\0").filter(Boolean).map((line) => {
      const tab = line.indexOf("\t");
      return { rel: line.slice(tab + 1), symlink: line.startsWith("120000 ") };
    });
    const untracked = git(["ls-files", "-o", "--exclude-standard", "-z"]).split("\0").filter(Boolean).map((rel) => {
      let symlink = false;
      try {
        symlink = fs.lstatSync(path.join(ROOT, rel)).isSymbolicLink();
      } catch {}
      return { rel, symlink };
    });
    return [...tracked, ...untracked];
  } catch {
    return walkFiles(ROOT, [], () => true).map((full) => ({ rel: relFromRoot(full), symlink: fs.lstatSync(full).isSymbolicLink() }));
  }
}

function relFromRoot(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function catalogCategories() {
  return new Set(
    fs
      .readdirSync(CATALOG, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  );
}

/**
 * File text, read once per run. Each entry used to re-read its category
 * README, and the link pass re-read every entry, so a run read about 1,800
 * times for under 500 files.
 */
const textCache = new Map();
function readText(file) {
  if (!textCache.has(file)) textCache.set(file, fs.readFileSync(file, "utf8"));
  return textCache.get(file);
}

/** existsSync, realpath and isFile for a link target, looked up once per path. */
const targetCache = new Map();
function linkTarget(resolved) {
  if (!targetCache.has(resolved)) {
    const exists = fs.existsSync(resolved);
    let isFile;
    targetCache.set(resolved, {
      exists,
      real: exists ? fs.realpathSync.native(resolved) : null,
      // Only links with a #fragment need it, so stat lazily.
      get isFile() {
        if (isFile === undefined) isFile = exists && fs.statSync(resolved).isFile();
        return isFile;
      },
    });
  }
  return targetCache.get(resolved);
}

/** Heading anchors per Markdown file, read once. */
const anchorCache = new Map();
function anchorsOf(file) {
  if (!anchorCache.has(file)) anchorCache.set(file, markdownAnchors(readText(file)));
  return anchorCache.get(file);
}

/** checks.mjs checkMarkdownLinks over one file, with the cached filesystem lookups. */
function checkRelativeLinks(file) {
  return checkMarkdownLinks(file, readText(file), {
    root: ROOT,
    realRoot: REAL_ROOT,
    target: linkTarget,
    anchorsOf,
    relOf: relFromRoot,
    external: EXTERNAL_SCHEME_RE,
    anyScheme: ANY_SCHEME_RE,
  });
}

function coverageReport(entries) {
  const byCat = new Map();
  let spdx = 0;
  let publisher = 0;
  for (const meta of entries) {
    const cat = String(meta.category || "?");
    byCat.set(cat, (byCat.get(cat) || 0) + 1);
    if (!empty(meta.license_spdx)) spdx += 1;
    if (!empty(meta.publisher)) publisher += 1;
  }
  const n = entries.length;
  const pct = (c) => (n ? ((100 * c) / n).toFixed(1) : "0.0");
  const lines = ["coverage:"];
  for (const cat of [...byCat.keys()].sort()) {
    lines.push(`  ${cat.padEnd(14)} ${String(byCat.get(cat)).padStart(3)}`);
  }
  lines.push(`  license_spdx  ${spdx}/${n} (${pct(spdx)}%)`);
  lines.push(`  publisher     ${publisher}/${n} (${pct(publisher)}%)`);
  return lines.join("\n");
}

/**
 * Every repository check, over this checkout. Returns the errors and what
 * the CLI summary prints; the CLI below exits on errors. Importable, so the
 * tests run it (#255).
 */
export function validateRepo() {
  const errors = [];
  // "In the future" means after tomorrow in UTC, so no time zone's today fails.
  const today = latestAllowedDate();
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const expectedCount = config.expectedEntryCount;
  const spdxAllowed = new Set(
    JSON.parse(fs.readFileSync(SPDX_ALLOWED_PATH, "utf8"))
  );
  const vocab = JSON.parse(fs.readFileSync(VOCAB_PATH, "utf8"));
  errors.push(...checkPreviewVocabulary(vocab));
  errors.push(...checkLicenceGuide(vocab, fs.readFileSync(path.join(ROOT, "docs", "licenses.md"), "utf8")));
  const aliases = JSON.parse(fs.readFileSync(ALIASES_PATH, "utf8"));
  const formatVocab = JSON.parse(fs.readFileSync(FORMATS_PATH, "utf8"));
  const categories = catalogCategories();
  const entryRecords = readCatalog(CATALOG, { root: ROOT, read: readText });
  const entryFiles = entryRecords.map((r) => r.file);

  const entries = [];
  const records = [];
  const ids = new Map();
  const metaById = new Map();

  for (const { file, rel, text, parsed } of entryRecords) {
    errors.push(...checkEntryText(rel, text, parsed));
    if (!parsed) continue;
    const { meta, body } = parsed;
    for (const e of parsed.errors) errors.push(`${rel} frontmatter ${e}`);
    const stem = path.basename(file, ".md");
    const catReadme = path.join(path.dirname(file), "README.md");
    const readmeText = linkTarget(catReadme).exists ? readText(catReadme) : null;
    // Every per-entry check, from one list (checks.mjs ENTRY_CHECKS, #255).
    const ctx = { vocab, spdxAllowed, aliases, formatVocab, today, stem, dirName: path.basename(path.dirname(file)), categories, readmeText };
    for (const check of ENTRY_CHECKS) errors.push(...check.run(rel, meta, body, ctx));
    if (meta.id) {
      const id = String(meta.id);
      if (ids.has(id)) errors.push(`duplicate id "${id}": ${ids.get(id)} and ${rel}`);
      else {
        ids.set(id, rel);
        metaById.set(id, meta);
      }
    }

    entries.push(meta);
    records.push({ rel, meta });
  }

  errors.push(...checkPublisherConsistency(records));
  errors.push(...checkValueSpellings(records));

  // V15: starter stacks. The build reads the same list (lib/stacks.mjs).
  const { files: stackFiles, stray: strayStacks } = listStackFiles(ROOT);
  for (const rel of strayStacks) errors.push(`${rel}: stacks live directly in stacks/; the build does not read subfolders`);
  for (const { rel, text } of stackFiles) if (hasEmoji(text)) errors.push(`${rel} contains emoji`);
  const entriesByPath = new Map(records.map(({ rel, meta }) => [rel, { id: String(meta.id), status: String(meta.status) }]));
  errors.push(...checkStacks(stackFiles, entriesByPath, licenceTerms(vocab, [...spdxAllowed]), today));

  const byCategory = new Map();
  for (const record of records) {
    const cat = String(record.meta.category);
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(record);
  }
  const entriesByRel = new Map(records.map(({ rel, meta }) => [rel, meta]));
  for (const [cat, group] of byCategory) {
    const readme = path.join(CATALOG, cat, "README.md");
    if (!fs.existsSync(readme)) continue;
    errors.push(
      ...checkCategoryReadmeRows(cat, readText(readme), group)
    );
    errors.push(...checkComparisonLicences(cat, readText(readme), entriesByRel));
  }

  errors.push(
    ...checkAiGuide(
      readText(path.join(ROOT, "docs", "ai-assets.md")),
      records.filter(({ meta }) => Array.isArray(meta.tags) && meta.tags.map(String).includes("ai-generated")).map(({ rel }) => rel)
    )
  );

  const measured = {};
  for (const { meta } of records) {
    const cat = String(meta.category);
    // The README counts match the site's "All" chip: deprecated entries are not listed.
    measured[cat] = (measured[cat] || 0) + (isListed(meta) ? 1 : 0);
  }
  errors.push(
    ...checkCountTables(measured, [
      {
        name: "README.md",
        text: readText(path.join(ROOT, "README.md")),
        pathFragment: "catalog/CAT/",
      },
      {
        name: "catalog/README.md",
        text: readText(path.join(CATALOG, "README.md")),
        pathFragment: "`CAT/`",
      },
    ])
  );

  errors.push(...checkEntryCount(entryFiles.length, expectedCount));

  const formPath = path.join(ROOT, ".github", "ISSUE_TEMPLATE", "new-source.yml");
  errors.push(
    ...checkCategorySets({
      dirs: categories,
      configured: Object.keys(config.categories || {}),
      formOptions: fs.existsSync(formPath) ? categoryFormOptions(fs.readFileSync(formPath, "utf8")) : null,
    })
  );

  errors.push(...checkFeatured(config.featured, ids));

  const mdRoots = [
    CATALOG,
    STACKS,
    path.join(ROOT, "docs"),
    path.join(ROOT, "README.md"),
    path.join(ROOT, "CONTRIBUTING.md"),
    path.join(ROOT, "SECURITY.md"),
    path.join(ROOT, "CODE_OF_CONDUCT.md"),
    path.join(__dirname, "README.md"),
  ].filter((p) => fs.existsSync(p));
  for (const root of mdRoots) {
    const files = fs.statSync(root).isDirectory()
      ? walkFiles(root, [], (f) => f.endsWith(".md"))
      : [root];
    for (const file of files) {
      errors.push(...checkLineEndings(relFromRoot(file), readText(file)));
      errors.push(...checkRelativeLinks(file));
    }
  }

  // Thumbnails: the manifest, the files and the licence gate must agree.
  const thumbsDir = path.join(__dirname, "public", "thumbs");
  const manifestPath = path.join(__dirname, "thumbs.json");
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : null;
  const thumbFiles = fs.existsSync(thumbsDir) ? fs.readdirSync(thumbsDir).filter((n) => n !== ".gitkeep") : [];
  errors.push(...checkThumbManifest(manifest, metaById, thumbFiles));

  errors.push(...checkRepoFiles(repoFiles()));

  return { errors, entries, entryCount: entryFiles.length, idCount: ids.size, stackCount: stackFiles.length };
}

function main() {
  const { errors, entries, entryCount, idCount, stackCount } = validateRepo();
  if (errors.length) {
    console.error(`validate failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`validate ok: ${entryCount} entries, ${idCount} ids, ${stackCount} stacks, no broken links`);
  console.log(coverageReport(entries));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

#!/usr/bin/env node
/**
 * Catalog integrity checks. Run before every commit: node site/validate.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  checkActiveIsSettled,
  checkAttributionConsistency,
  checkCategoryReadmeRows,
  checkCategorySets,
  checkCountTables,
  checkDeprecationReason,
  checkEntryUrl,
  checkEvidenceDates,
  checkFormatVocabulary,
  checkLicenseVocabulary,
  checkPublisherConsistency,
  checkSpdxConsistency,
  checkStacks,
  checkTagsRestatePublisher,
  checkTaxonomyValues,
  checkValueAliases,
  checkValueSpellings,
  evidenceDates,
  markdownAnchors,
} from "./checks.mjs";
import { evidenceSection, parseFrontmatter } from "./lib/frontmatter.mjs";
import { isRealDate, latestAllowedDate } from "./lib/shared.mjs";
import { licenceTerms, listStackFiles } from "./lib/stacks.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const CONFIG_PATH = path.join(__dirname, "config.json");
const SPDX_ALLOWED_PATH = path.join(__dirname, "spdx-allowed.json");
const VOCAB_PATH = path.join(__dirname, "license-vocabulary.json");
const ALIASES_PATH = path.join(__dirname, "value-aliases.json");
const FORMATS_PATH = path.join(__dirname, "format-vocabulary.json");
const STACKS = path.join(ROOT, "stacks");
const REQUIRED = [
  "id",
  "name",
  "url",
  "category",
  "subcategories",
  "license",
  "commercial",
  "attribution_required",
  "formats",
  "tags",
  "verified",
  "status",
];
const SKIP_MD = new Set(["README.md", "TEMPLATE.md"]);
const BINARY_EXT = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".wav",
  ".mp3",
  ".ogg",
  ".flac",
  ".glb",
  ".gltf",
  ".fbx",
  ".blend",
  ".zip",
  ".7z",
  ".rar",
  ".psd",
  ".ase",
  ".aseprite",
  ".ttf",
  ".otf",
  ".woff",
  ".woff2",
  ".mp4",
  ".webm",
  ".hdr",
  ".exr",
  ".tif",
  ".tiff",
  ".bin",
  ".pak",
]);
// Hidden folders (.git, .claude worktrees, editor state) and local scratch
// space are not part of the repo's content.
const SKIP_WALK = new Set(["node_modules", "dist", "RESEARCH", "_scratch"]);
/** Generated output and first-party stills (README screenshots, the social card): not third-party packs. */
const ALLOWED_BINARY_PREFIXES = ["site/dist/", "docs/images/readme/"];
const EMOJI_RE = /\p{Extended_Pictographic}/u;
const MD_LINK_RE = /!\[[^\]]*\]\(([^)]+)\)|\[[^\]]*\]\(([^)]+)\)/g;
const COMMERCIAL_VALUES = new Set(["true", "false", "unknown", "varies"]);
const STATUS_VALUES = new Set(["active", "needs-review", "deprecated"]);
const ATTRIBUTION_REQUIRED_VALUES = new Set(["true", "false", "unknown"]);

function hasEmoji(text) {
  const stripped = text.replace(/[©®™]/g, "");
  return EMOJI_RE.test(stripped);
}

function walkFiles(dir, out = [], filter) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_WALK.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name.startsWith(".")) continue;
      walkFiles(full, out, filter);
      continue;
    }
    if (!filter || filter(full)) out.push(full);
  }
  return out;
}

function isEmptyField(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
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

function enumKey(v) {
  if (v === true) return "true";
  if (v === false) return "false";
  return String(v);
}

/** Heading anchors per Markdown file, read once. */
const anchorCache = new Map();
function anchorsOf(file) {
  if (!anchorCache.has(file)) anchorCache.set(file, markdownAnchors(fs.readFileSync(file, "utf8")));
  return anchorCache.get(file);
}

function checkRelativeLinks(file, errors) {
  const text = fs.readFileSync(file, "utf8");
  const dir = path.dirname(file);
  let m;
  MD_LINK_RE.lastIndex = 0;
  while ((m = MD_LINK_RE.exec(text))) {
    let target = (m[1] || m[2] || "").trim();
    if (!target) continue;
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    const href = target.split(/\s+/)[0];
    if (!href) continue;
    if (/^(https?:|mailto:|ftp:)/i.test(href)) continue;
    const hash = href.indexOf("#");
    const filePart = hash === -1 ? href : href.slice(0, hash);
    const fragment = hash === -1 ? "" : href.slice(hash + 1);
    const resolved = filePart ? path.resolve(dir, filePart) : file;
    if (!fs.existsSync(resolved)) {
      errors.push(`${relFromRoot(file)} broken link: ${href}`);
      continue;
    }
    // A fragment into a Markdown file must name one of its headings.
    if (fragment && resolved.endsWith(".md") && fs.statSync(resolved).isFile()) {
      let id = fragment;
      try {
        id = decodeURIComponent(fragment);
      } catch {
        // A malformed escape stays as written and fails the lookup below.
      }
      if (!anchorsOf(resolved).has(id.toLowerCase())) {
        errors.push(`${relFromRoot(file)} broken anchor: ${href} (no such heading in ${relFromRoot(resolved)})`);
      }
    }
  }
}

/** The options of the `id: category` dropdown in the new-source issue form. */
function categoryFormOptions(yml) {
  const lines = yml.split(/\r?\n/);
  const at = lines.findIndex((l) => /^\s*id:\s*category\s*$/.test(l));
  if (at === -1) return [];
  const start = lines.findIndex((l, i) => i > at && /^\s*options:\s*$/.test(l));
  if (start === -1) return [];
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const m = lines[i].match(/^\s*-\s+(\S+)\s*$/);
    if (!m) break;
    out.push(m[1]);
  }
  return out;
}

function coverageReport(entries) {
  const byCat = new Map();
  let spdx = 0;
  let publisher = 0;
  for (const meta of entries) {
    const cat = String(meta.category || "?");
    byCat.set(cat, (byCat.get(cat) || 0) + 1);
    if (!isEmptyField(meta.license_spdx)) spdx += 1;
    if (!isEmptyField(meta.publisher)) publisher += 1;
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

function main() {
  const errors = [];
  // "In the future" means after tomorrow in UTC, so no time zone's today fails.
  const today = latestAllowedDate();
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const expectedCount = config.expectedEntryCount;
  if (!Number.isInteger(expectedCount) || expectedCount < 1) {
    errors.push("site/config.json expectedEntryCount must be a positive integer");
  }
  const spdxAllowed = new Set(
    JSON.parse(fs.readFileSync(SPDX_ALLOWED_PATH, "utf8"))
  );
  const vocab = JSON.parse(fs.readFileSync(VOCAB_PATH, "utf8"));
  const aliases = JSON.parse(fs.readFileSync(ALIASES_PATH, "utf8"));
  const formatVocab = JSON.parse(fs.readFileSync(FORMATS_PATH, "utf8"));
  const categories = catalogCategories();
  const entryFiles = walkFiles(CATALOG, [], (f) => {
    const base = path.basename(f);
    return f.endsWith(".md") && !SKIP_MD.has(base);
  });

  const entries = [];
  const records = [];
  const ids = new Map();

  for (const file of entryFiles) {
    const rel = relFromRoot(file);
    const text = fs.readFileSync(file, "utf8");
    if (hasEmoji(text)) errors.push(`${rel} contains emoji`);

    const parsed = parseFrontmatter(text);
    if (!parsed) {
      errors.push(`${rel} missing frontmatter`);
      continue;
    }
    const { meta, body } = parsed;
    for (const e of parsed.errors) errors.push(`${rel} frontmatter ${e}`);
    const missing = REQUIRED.filter((k) => isEmptyField(meta[k]));
    if (missing.length) errors.push(`${rel} missing/empty: ${missing.join(", ")}`);

    const stem = path.basename(file, ".md");
    const dirName = path.basename(path.dirname(file));
    if (meta.id && String(meta.id) !== stem) {
      errors.push(`${rel} id "${meta.id}" does not match filename`);
    }
    if (meta.category && String(meta.category) !== dirName) {
      errors.push(`${rel} category "${meta.category}" does not match directory`);
    }
    if (meta.category && !categories.has(String(meta.category))) {
      errors.push(`${rel} category "${meta.category}" is not a catalog/ directory`);
    }
    const commercialKey = enumKey(meta.commercial);
    if (!isEmptyField(meta.commercial) && !COMMERCIAL_VALUES.has(commercialKey)) {
      errors.push(`${rel} commercial "${commercialKey}" is not true|false|unknown|varies`);
    }
    const statusKey = enumKey(meta.status);
    if (!isEmptyField(meta.status) && !STATUS_VALUES.has(statusKey)) {
      errors.push(`${rel} status "${statusKey}" is not active|needs-review|deprecated`);
    }
    const attrKey = enumKey(meta.attribution_required);
    if (
      !isEmptyField(meta.attribution_required) &&
      !ATTRIBUTION_REQUIRED_VALUES.has(attrKey)
    ) {
      errors.push(
        `${rel} attribution_required "${attrKey}" is not true|false|unknown`
      );
    }
    if (attrKey === "true" && isEmptyField(meta.attribution_string)) {
      errors.push(`${rel} attribution_required true needs attribution_string`);
    }
    errors.push(...checkEntryUrl(rel, meta));
    errors.push(...checkLicenseVocabulary(rel, meta, vocab));
    errors.push(...checkSpdxConsistency(rel, meta, vocab, spdxAllowed));
    errors.push(...checkAttributionConsistency(rel, meta, body, vocab));
    errors.push(...checkEvidenceDates(rel, meta, body, today));
    errors.push(...checkDeprecationReason(rel, meta, body, vocab));
    errors.push(...checkTaxonomyValues(rel, meta));
    errors.push(...checkValueAliases(rel, meta, aliases));
    errors.push(...checkFormatVocabulary(rel, meta, formatVocab));
    errors.push(...checkTagsRestatePublisher(rel, meta));
    errors.push(...checkActiveIsSettled(rel, meta));
    if (meta.id) {
      const id = String(meta.id);
      if (ids.has(id)) errors.push(`duplicate id "${id}": ${ids.get(id)} and ${rel}`);
      else ids.set(id, rel);
    }

    if (meta.verified) {
      const v = String(meta.verified);
      if (!isRealDate(v)) errors.push(`${rel} verified "${v}" is not a real YYYY-MM-DD date`);
      else if (v > today) errors.push(`${rel} verified ${v} is in the future`);
    }

    if (meta.status === "active") {
      const ev = evidenceSection(body);
      if (!ev) errors.push(`${rel} active entry missing ## Evidence`);
      else if (!evidenceDates(ev).length) {
        errors.push(`${rel} active Evidence section has no YYYY-MM-DD date`);
      }
    }

    const catReadme = path.join(path.dirname(file), "README.md");
    if (fs.existsSync(catReadme)) {
      const listing = fs.readFileSync(catReadme, "utf8");
      if (!listing.includes(`(${stem}.md)`)) {
        errors.push(`${rel} not listed in category README.md`);
      }
    } else {
      errors.push(`${rel} category README.md missing`);
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
  for (const [cat, group] of byCategory) {
    const readme = path.join(CATALOG, cat, "README.md");
    if (!fs.existsSync(readme)) continue;
    errors.push(
      ...checkCategoryReadmeRows(cat, fs.readFileSync(readme, "utf8"), group)
    );
  }

  const measured = {};
  for (const { meta } of records) {
    const cat = String(meta.category);
    measured[cat] = (measured[cat] || 0) + 1;
  }
  errors.push(
    ...checkCountTables(measured, [
      {
        name: "README.md",
        text: fs.readFileSync(path.join(ROOT, "README.md"), "utf8"),
        pathFragment: "catalog/CAT/",
      },
      {
        name: "catalog/README.md",
        text: fs.readFileSync(path.join(CATALOG, "README.md"), "utf8"),
        pathFragment: "`CAT/`",
      },
    ])
  );

  if (Number.isInteger(expectedCount) && entryFiles.length !== expectedCount) {
    errors.push(
      `entry count ${entryFiles.length} !== ${expectedCount} (update expectedEntryCount in site/config.json when adding or removing entries)`
    );
  }

  const formPath = path.join(ROOT, ".github", "ISSUE_TEMPLATE", "new-source.yml");
  errors.push(
    ...checkCategorySets({
      dirs: categories,
      configured: Object.keys(config.categories || {}),
      formOptions: fs.existsSync(formPath) ? categoryFormOptions(fs.readFileSync(formPath, "utf8")) : null,
    })
  );

  for (const item of config.featured || []) {
    const id = typeof item === "string" ? item : item?.id;
    if (!id || !ids.has(id)) errors.push(`featured id "${id}" does not resolve`);
  }

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
    for (const file of files) checkRelativeLinks(file, errors);
  }

  for (const file of walkFiles(ROOT, [], () => true)) {
    const ext = path.extname(file).toLowerCase();
    if (!BINARY_EXT.has(ext)) continue;
    const rel = relFromRoot(file);
    if (ALLOWED_BINARY_PREFIXES.some((p) => rel.startsWith(p))) continue;
    errors.push(`binary asset file: ${rel}`);
  }

  if (errors.length) {
    console.error(`validate failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `validate ok: ${entryFiles.length} entries, ${ids.size} ids, ${stackFiles.length} stacks, no broken links`
  );
  console.log(coverageReport(entries));
}

main();

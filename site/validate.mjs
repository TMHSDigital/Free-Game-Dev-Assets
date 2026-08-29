#!/usr/bin/env node
/**
 * Catalog integrity checks. Run before every commit: node site/validate.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const CONFIG_PATH = path.join(__dirname, "config.json");
const EXPECTED_COUNT = 284;
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
const SKIP_WALK = new Set([".git", "node_modules", "dist", "RESEARCH"]);
const EMOJI_RE = /\p{Extended_Pictographic}/u;
const MD_LINK_RE = /!\[[^\]]*\]\(([^)]+)\)|\[[^\]]*\]\(([^)]+)\)/g;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EVIDENCE_DATE_RE = /\d{4}-\d{2}-\d{2}/;

function hasEmoji(text) {
  const stripped = text.replace(/[©®™]/g, "");
  return EMOJI_RE.test(stripped);
}

function parseScalar(raw) {
  const v = raw.trim();
  if (v === "true") return true;
  if (v === "false") return false;
  if (v === "null" || v === "~" || v === "") return null;
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((part) => {
      const s = part.trim();
      if (
        (s.startsWith('"') && s.endsWith('"')) ||
        (s.startsWith("'") && s.endsWith("'"))
      ) {
        return s.slice(1, -1);
      }
      return s;
    });
  }
  return v;
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = parseScalar(line.slice(idx + 1));
  }
  return { meta, body: match[2] };
}

function walkFiles(dir, out = [], filter) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    if (SKIP_WALK.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkFiles(full, out, filter);
      continue;
    }
    if (!filter || filter(full)) out.push(full);
  }
  return out;
}

function todayISO() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isEmptyField(v) {
  if (v === undefined || v === null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
}

function evidenceSection(body) {
  const idx = body.search(/^## Evidence\s*$/m);
  if (idx === -1) return null;
  const rest = body.slice(idx);
  const next = rest.search(/\n## [^E]/);
  return next === -1 ? rest : rest.slice(0, next);
}

function relFromRoot(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
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
    if (/^(https?:|mailto:|ftp:|#)/i.test(href)) continue;
    const hash = href.indexOf("#");
    const filePart = hash === -1 ? href : href.slice(0, hash);
    if (!filePart) continue;
    const resolved = path.resolve(dir, filePart);
    if (!fs.existsSync(resolved)) {
      errors.push(`${relFromRoot(file)} broken link: ${href}`);
    }
  }
}

function main() {
  const errors = [];
  const today = todayISO();
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const entryFiles = walkFiles(CATALOG, [], (f) => {
    const base = path.basename(f);
    return f.endsWith(".md") && !SKIP_MD.has(base);
  });

  const entries = [];
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
    if (meta.id) {
      const id = String(meta.id);
      if (ids.has(id)) errors.push(`duplicate id "${id}": ${ids.get(id)} and ${rel}`);
      else ids.set(id, rel);
    }

    if (meta.verified) {
      const v = String(meta.verified);
      if (!DATE_RE.test(v)) errors.push(`${rel} verified is not YYYY-MM-DD`);
      else if (v > today) errors.push(`${rel} verified ${v} is in the future`);
    }

    if (meta.status === "active") {
      const ev = evidenceSection(body);
      if (!ev) errors.push(`${rel} active entry missing ## Evidence`);
      else if (!EVIDENCE_DATE_RE.test(ev)) {
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
  }

  if (entryFiles.length !== EXPECTED_COUNT) {
    errors.push(
      `entry count ${entryFiles.length} !== ${EXPECTED_COUNT} (update EXPECTED_COUNT in site/validate.mjs when adding or removing entries)`
    );
  }

  for (const item of config.featured || []) {
    const id = typeof item === "string" ? item : item?.id;
    if (!id || !ids.has(id)) errors.push(`featured id "${id}" does not resolve`);
  }

  const mdRoots = [
    CATALOG,
    path.join(ROOT, "docs"),
    path.join(ROOT, "README.md"),
  ];
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
    if (rel.startsWith("site/dist/")) continue;
    errors.push(`binary asset file: ${rel}`);
  }

  if (errors.length) {
    console.error(`validate failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `validate ok: ${entryFiles.length} entries, ${ids.size} ids, no broken links`
  );
}

main();

#!/usr/bin/env node
/**
 * Build GitHub Pages site from catalog markdown frontmatter.
 * Add/edit one catalog/<category>/<id>.md → rebuild regenerates everything.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CATALOG = path.join(ROOT, "catalog");
const PUBLIC = path.join(__dirname, "public");
const DIST = path.join(__dirname, "dist");
const CONFIG_PATH = path.join(__dirname, "config.json");

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
    const key = line.slice(0, idx).trim();
    meta[key] = parseScalar(line.slice(idx + 1));
  }
  return { meta, body: match[2].trim() };
}

function stripMd(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function summaryFromBody(body) {
  const chunks = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("#"));
  const first = chunks[0] || "";
  const clean = stripMd(first);
  return clean.length > 220 ? `${clean.slice(0, 217)}…` : clean;
}

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

function loadEntries() {
  const files = walkMarkdown(CATALOG);
  const entries = [];
  const errors = [];

  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const parsed = parseFrontmatter(text);
    if (!parsed) {
      errors.push(`No frontmatter: ${path.relative(ROOT, file)}`);
      continue;
    }
    const { meta, body } = parsed;
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    const required = ["id", "name", "url", "category", "license", "status"];
    const missing = required.filter((k) => meta[k] === undefined || meta[k] === null || meta[k] === "");
    if (missing.length) {
      errors.push(`${rel} missing: ${missing.join(", ")}`);
      continue;
    }

    entries.push({
      id: String(meta.id),
      name: String(meta.name),
      url: String(meta.url),
      category: String(meta.category),
      subcategories: Array.isArray(meta.subcategories) ? meta.subcategories : [],
      license: String(meta.license),
      commercial: meta.commercial === true ? true : meta.commercial === false ? false : "unknown",
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
      summary: summaryFromBody(body),
    });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  return { entries, errors };
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

function main() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const { entries, errors } = loadEntries();

  if (errors.length) {
    console.error("Build warnings:");
    for (const e of errors) console.error(`  - ${e}`);
  }

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
    commercialOk: entries.filter((e) => e.commercial === true).length,
    categories: Object.keys(config.categories).length,
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    site: config.site,
    categories: config.categories,
    guides: config.guides,
    featured,
    stats,
    entries,
  };

  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  copyDir(PUBLIC, DIST);
  fs.writeFileSync(path.join(DIST, "data.json"), JSON.stringify(payload, null, 2));
  fs.writeFileSync(
    path.join(DIST, "data.js"),
    `window.__CATALOG__ = ${JSON.stringify(payload)};\n`
  );

  console.log(
    `Built ${entries.length} entries → site/dist (${stats.active} active, ${stats.commercialOk} commercial-ok)`
  );
  if (errors.length) process.exitCode = 0; // soft-fail missing fields as warnings
}

main();

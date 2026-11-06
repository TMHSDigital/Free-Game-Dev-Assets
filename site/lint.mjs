#!/usr/bin/env node
/**
 * The static check CI runs over every script, including the ones that only
 * run monthly (thumbs, reverify, check-links): each file must parse
 * (`node --check`), and every name it imports must be used. Zero
 * dependencies; run: node site/lint.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

/** Every script under site/: .mjs anywhere, and the browser .js files. */
export function scriptFiles(dir = __dirname) {
  const out = [];
  const walk = (d) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      if (ent.name === "dist" || ent.name === "node_modules" || ent.name.startsWith(".")) continue;
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (/\.(mjs|js)$/.test(ent.name)) out.push(full);
    }
  };
  walk(dir);
  return out.sort();
}

const IMPORT_RE = /^\s*import\s+([^"';]+?)\s+from\s+["'][^"']+["'];?/gm;

/** The local names a module's static imports bind. */
function importedNames(clause) {
  const names = [];
  const braces = clause.match(/\{([^}]*)\}/);
  if (braces) {
    for (const part of braces[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) names.push(name);
    }
  }
  const rest = clause.replace(/\{[^}]*\}/, "").replace(/,/g, " ").trim();
  const star = rest.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/);
  if (star) names.push(star[1]);
  else if (/^[A-Za-z_$][\w$]*$/.test(rest)) names.push(rest);
  return names;
}

/** Names a module imports and never uses (comments and strings are not stripped, so this errs towards "used"). */
export function unusedImports(text) {
  const src = String(text);
  const body = src.replace(IMPORT_RE, "");
  const unused = [];
  for (const m of src.matchAll(IMPORT_RE)) {
    for (const name of importedNames(m[1])) {
      // Not a property (`x.name`), but a spread (`...name`) counts.
      const re = new RegExp(`(^|[^\\w$.]|\\.\\.\\.)${name.replace(/\$/g, "\\$")}(?![\\w$])`, "m");
      if (!re.test(body)) unused.push(name);
    }
  }
  return unused;
}

function main() {
  const errors = [];
  const files = scriptFiles();
  for (const file of files) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    try {
      execFileSync(process.execPath, ["--check", file], { stdio: ["ignore", "ignore", "pipe"] });
    } catch (err) {
      const first = String(err.stderr || err.message).trim().split("\n").slice(0, 5).join("\n    ");
      errors.push(`${rel} does not parse:\n    ${first}`);
      continue;
    }
    for (const name of unusedImports(fs.readFileSync(file, "utf8"))) errors.push(`${rel} imports ${name} and never uses it`);
  }
  if (errors.length) {
    console.error(`lint failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`lint ok: ${files.length} scripts parse, no unused imports`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
